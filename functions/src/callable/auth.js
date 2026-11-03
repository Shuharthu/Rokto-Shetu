/**
 * @file auth.js
 * @description Cloud Functions callable handlers for role management and custom claims.
 */

import { requireAuth, requireRole } from '../middleware/auth.js';
import { validatePayload, AssignRoleSchema } from '../middleware/validation.js';
import { logAuditEvent } from '../utils/audit.js';

/**
 * Assigns or revokes a platform sub-role via Firebase Auth Custom Claims.
 * Accessible strictly to callers with 'super_admin' claim.
 * @param {object} data - { targetUid: string, role: string, enabled: boolean }
 * @param {object} context - Callable context
 * @param {object} authAdmin - Firebase Admin Auth instance
 * @param {object} db - Firestore instance
 */
export async function assignPlatformRoleHandler(data, context, authAdmin, db) {
  // 1. Authenticate caller and assert super_admin status
  const caller = requireRole(context, 'super_admin');

  // 2. Validate payload schema
  const { targetUid, role, enabled } = validatePayload(AssignRoleSchema, data);

  // 3. Fetch existing custom claims
  let userRecord;
  try {
    userRecord = await authAdmin.getUser(targetUid);
  } catch (err) {
    const error = new Error(`NOT_FOUND: User '${targetUid}' not found.`);
    error.code = 'not-found';
    throw error;
  }

  const existingClaims = userRecord.customClaims || {};
  const updatedClaims = { ...existingClaims };

  if (enabled) {
    updatedClaims[role] = true;
  } else {
    delete updatedClaims[role];
  }

  // 4. Update Firebase Auth Custom Claims
  await authAdmin.setCustomUserClaims(targetUid, updatedClaims);

  // 5. Update roles array in Firestore user document
  if (db) {
    const userRef = db.collection('users').doc(targetUid);
    const rolesArray = Object.keys(updatedClaims).filter(k => updatedClaims[k] === true);
    await userRef.set({ roles: rolesArray, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // 6. Record immutable audit log
  await logAuditEvent(db, {
    actorUid: caller.uid,
    actorEmail: caller.token.email,
    action: enabled ? 'ROLE_GRANTED' : 'ROLE_REVOKED',
    targetType: 'user',
    targetId: targetUid,
    metadata: { role, enabled }
  });

  return {
    success: true,
    targetUid,
    role,
    enabled,
    claims: updatedClaims
  };
}

/**
 * Assigns an organization tenant claim (orgId & orgRole) to a user.
 * @param {string} targetUid
 * @param {string} orgId
 * @param {string} orgRole - 'owner' | 'manager' | 'inventory_staff' | 'verifier' | 'coordinator' | 'viewer'
 * @param {object} authAdmin
 */
export async function setOrgClaims(targetUid, orgId, orgRole, authAdmin) {
  const userRecord = await authAdmin.getUser(targetUid);
  const existingClaims = userRecord.customClaims || {};

  const updatedClaims = {
    ...existingClaims,
    orgId,
    orgRole
  };

  await authAdmin.setCustomUserClaims(targetUid, updatedClaims);
  return updatedClaims;
}
