/**
 * @file org.js
 * @description B2B Organization Workspace: FEFO Blood Inventory, Camp Campaigns & Audit Trail.
 */

import { logAuditEvent } from '../utils/audit.js';

/**
 * Sorts blood bag inventory strictly using FEFO (First-Expired, First-Out).
 * Available units closest to expiration are prioritized for issuance.
 * @param {Array<object>} units
 * @returns {Array<object>} Sorted units with expiry urgency flags
 */
export function calculateFefoInventory(units = []) {
  const now = Date.now();

  return [...units].sort((a, b) => {
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  }).map(unit => {
    const expTime = new Date(unit.expiryDate).getTime();
    const hoursLeft = Math.round((expTime - now) / (1000 * 60 * 60));

    let urgency = 'normal';
    if (hoursLeft <= 0) {
      urgency = 'expired';
    } else if (hoursLeft <= 48) {
      urgency = 'critical_expiring_soon';
    } else if (hoursLeft <= 120) {
      urgency = 'warning_expiring_soon';
    }

    return {
      ...unit,
      hoursToExpiry: hoursLeft,
      fefoPriority: hoursLeft > 0 ? hoursLeft : 999999,
      expiryUrgency: urgency
    };
  });
}

/**
 * Records an immutable lifecycle event for a blood bag unit.
 * @param {object} params
 * @param {string} params.orgId
 * @param {string} params.unitId
 * @param {'received'|'tested_cleared'|'reserved'|'transfused'|'transferred'|'expired'|'discarded'} params.eventType
 * @param {string} params.actorUid
 * @param {string} [params.notes]
 * @param {object} db - Firestore database
 */
export async function recordInventoryEvent({ orgId, unitId, eventType, actorUid, notes = '', db }) {
  if (!orgId || !unitId || !eventType || !actorUid) {
    throw new Error('orgId, unitId, eventType, and actorUid are required for inventory event');
  }

  const eventDoc = {
    orgId,
    unitId,
    eventType,
    actorUid,
    notes,
    timestamp: new Date().toISOString()
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('inventory_events').add(eventDoc);
    await logAuditEvent(db, {
      actorUid,
      action: `INVENTORY_${eventType.toUpperCase()}`,
      targetType: 'inventory_unit',
      targetId: unitId,
      metadata: { orgId, notes }
    });
  }

  return eventDoc;
}

/**
 * Handles inter-branch transfer of blood units.
 * @param {object} params
 * @param {string} params.orgId
 * @param {string} params.unitId
 * @param {string} params.sourceBranchId
 * @param {string} params.targetBranchId
 * @param {string} params.actorUid
 * @param {object} db
 */
export async function transferBloodUnitHandler({ orgId, unitId, sourceBranchId, targetBranchId, actorUid, db }) {
  if (sourceBranchId === targetBranchId) {
    throw new Error('Source and target branches cannot be identical');
  }

  const transferDoc = {
    orgId,
    unitId,
    sourceBranchId,
    targetBranchId,
    transferredBy: actorUid,
    transferredAt: new Date().toISOString(),
    status: 'in_transit'
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('transfers').add(transferDoc);
    await db.collection('inventory_units').doc(unitId).set({
      branchId: targetBranchId,
      status: 'reserved',
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await recordInventoryEvent({
      orgId,
      unitId,
      eventType: 'transferred',
      actorUid,
      notes: `Transferred from branch ${sourceBranchId} to ${targetBranchId}`,
      db
    });
  }

  return { success: true, transferDoc };
}
