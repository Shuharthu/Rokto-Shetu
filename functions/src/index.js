/**
 * @file index.js
 * @description Cloud Functions 2nd Gen entry point for RoktoSetu platform.
 */

import { assignPlatformRoleHandler } from './callable/auth.js';
import { executeExpandingRingMatch, acceptBloodRequestHandler } from './callable/matching.js';
import { claimRewardHandler } from './callable/rewards.js';
import { transferBloodUnitHandler, calculateFefoInventory } from './callable/org.js';
import { processPaymentWebhook, generateApiKey, validateWebhookDestination } from './services/billing.js';
import {
  applyFundraiserHandler,
  reviewFundraiserHandler,
  recordFundraiserDonation,
  approveMilestonePayoutHandler
} from './callable/fundraiser.js';
import {
  getPlatformStatsHandler,
  manageUserStatusHandler,
  approveOrgApplicationHandler
} from './callable/admin.js';
import { requireAppCheck } from './middleware/appCheck.js';
import { rateLimiter } from './middleware/rateLimit.js';

// Lazy-loaded or injected Firebase Admin to allow clean testing & emulator operation
let adminAuth = null;
let firestoreDb = null;

export function initializeServices(auth, db) {
  adminAuth = auth;
  firestoreDb = db;
}

/**
 * Assign platform staff roles (Super-Admin only).
 */
export async function assignPlatformRole(data, context) {
  requireAppCheck(context);
  const callerUid = context?.auth?.uid || 'anonymous';
  rateLimiter.check(`assign_role_${callerUid}`, 10, 60000);
  return assignPlatformRoleHandler(data, context, adminAuth, firestoreDb);
}

/**
 * Expanding Ring matching engine for urgent blood requests.
 */
export async function matchBloodDonors(data, context) {
  requireAppCheck(context);
  const callerUid = context?.auth?.uid || 'anonymous';
  rateLimiter.check(`match_${callerUid}`, 30, 60000);
  return executeExpandingRingMatch({ ...data, db: firestoreDb });
}

/**
 * Mutual acceptance contact reveal.
 */
export async function acceptBloodRequest(data, context) {
  requireAppCheck(context);
  return acceptBloodRequestHandler({ ...data, context, db: firestoreDb });
}

/**
 * Claim gamification coupon reward.
 */
export async function claimDonorReward(data, context) {
  requireAppCheck(context);
  return claimRewardHandler({ ...data, context, db: firestoreDb });
}

/**
 * Inter-branch blood unit transfer.
 */
export async function transferBloodUnit(data, context) {
  requireAppCheck(context);
  return transferBloodUnitHandler({ ...data, context, db: firestoreDb });
}

/**
 * Critical patient fundraiser application.
 */
export async function applyFundraiser(data, context) {
  requireAppCheck(context);
  return applyFundraiserHandler({ data, context, db: firestoreDb });
}

/**
 * 4-Eyes Fundraiser review step.
 */
export async function reviewFundraiser(data, context) {
  requireAppCheck(context);
  return reviewFundraiserHandler({ ...data, reviewerUid: context?.auth?.uid });
}

/**
 * Patient donation with double-entry ledger entry.
 */
export async function recordDonation(data, context) {
  requireAppCheck(context);
  return recordFundraiserDonation({ ...data, donorUid: context?.auth?.uid });
}

/**
 * Authorize staged milestone payout to hospital.
 */
export async function approveMilestonePayout(data, context) {
  requireAppCheck(context);
  return approveMilestonePayoutHandler({ ...data, adminUid: context?.auth?.uid });
}

/**
 * Get national platform stats & division heatmap.
 */
export async function getPlatformStats(data, context) {
  requireAppCheck(context);
  return getPlatformStatsHandler({ context, db: firestoreDb });
}

/**
 * Suspend/ban/reinstate user account.
 */
export async function manageUserStatus(data, context) {
  requireAppCheck(context);
  return manageUserStatusHandler({ data, context, db: firestoreDb });
}

/**
 * Approve B2B organization license & grant owner claims.
 */
export async function approveOrgApplication(data, context) {
  requireAppCheck(context);
  return approveOrgApplicationHandler({ data, context, authAdmin: adminAuth, db: firestoreDb });
}

// Re-export core modules & services
export * from './middleware/auth.js';
export * from './middleware/validation.js';
export * from './utils/audit.js';
export * from './utils/geohash.js';
export * from './services/kms.js';
export * from './services/ledger.js';
export * from './services/billing.js';
export * from './services/certificate.js';
export { calculateFefoInventory };
