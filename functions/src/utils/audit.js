/**
 * @file audit.js
 * @description Immutable append-only audit logger for administrative & financial actions.
 */

/**
 * Creates an audit log entry in the Firestore database.
 * @param {FirebaseFirestore.Firestore} db - Firestore instance
 * @param {object} params
 * @param {string} params.actorUid - UID of user performing the action
 * @param {string} [params.actorEmail] - Email of actor
 * @param {string} params.action - Action identifier (e.g. 'USER_VERIFIED', 'PAYOUT_APPROVED')
 * @param {string} params.targetType - Type of resource ('user', 'fundraiser', 'payout', 'org')
 * @param {string} params.targetId - ID of resource
 * @param {object} [params.metadata] - Extra context/reason codes
 * @param {object} [params.diff] - Before & after snapshots
 * @param {string} [params.ipAddress] - Request IP
 * @returns {Promise<string>} The audit log document ID
 */
export async function logAuditEvent(db, {
  actorUid,
  actorEmail = null,
  action,
  targetType,
  targetId,
  metadata = {},
  diff = null,
  ipAddress = 'unknown'
}) {
  if (!actorUid || !action || !targetType || !targetId) {
    throw new Error('Audit log requires actorUid, action, targetType, and targetId');
  }

  const auditEntry = {
    actorUid,
    actorEmail,
    action,
    targetType,
    targetId,
    timestamp: new Date().toISOString(),
    ipAddress,
    metadata,
    diff
  };

  // If db is provided (connected Firestore), append to collection
  if (db && typeof db.collection === 'function') {
    const docRef = await db.collection('audit_logs').add(auditEntry);
    return docRef.id;
  }

  return 'audit_mock_id_' + Date.now();
}
