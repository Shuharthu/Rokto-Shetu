/**
 * @file billing.js
 * @description SaaS Billing Engine, HMAC Webhook Verification, Replay Protection, SSRF Blocker & API Keys.
 */

import crypto from 'crypto';
import { logAuditEvent } from '../utils/audit.js';

export const SAAS_PLANS = {
  free: {
    id: 'free',
    name: 'Free Community',
    monthlyPriceBDT: 0,
    annualPriceBDT: 0,
    limits: { seats: 1, branches: 1, maxInventoryUnits: 0, smsCredits: 0, apiCallsPerMin: 0 }
  },
  starter: {
    id: 'starter',
    name: 'Org Starter',
    monthlyPriceBDT: 2500,
    annualPriceBDT: 25000,
    limits: { seats: 5, branches: 1, maxInventoryUnits: 500, smsCredits: 250, apiCallsPerMin: 30 }
  },
  pro: {
    id: 'pro',
    name: 'Org Pro',
    monthlyPriceBDT: 7500,
    annualPriceBDT: 75000,
    limits: { seats: 25, branches: 5, maxInventoryUnits: 5000, smsCredits: 1500, apiCallsPerMin: 120 }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceBDT: 25000,
    annualPriceBDT: 250000,
    limits: { seats: 9999, branches: 999, maxInventoryUnits: 999999, smsCredits: 10000, apiCallsPerMin: 500 }
  }
};

/**
 * Computes HMAC-SHA256 signature for outgoing and incoming webhooks.
 * @param {string|Buffer} payload
 * @param {string} secretKey
 * @returns {string} Hex signature
 */
export function computeHmacSignature(payload, secretKey) {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHmac('sha256', secretKey).update(data).digest('hex');
}

/**
 * Verifies webhook HMAC signature using timing-safe comparison to prevent timing attacks.
 * @param {string} receivedSignature
 * @param {string|Buffer} payload
 * @param {string} secretKey
 * @returns {boolean}
 */
export function verifyWebhookSignature(receivedSignature, payload, secretKey) {
  if (!receivedSignature || !payload || !secretKey) return false;

  const expectedSignature = computeHmacSignature(payload, secretKey);
  const sigBuf = Buffer.from(receivedSignature, 'utf8');
  const expBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * SSRF Protection Validator: Checks whether a webhook destination URL points to private/internal IP space.
 * Blocks loopback, cloud metadata (169.254.169.254), RFC 1918 private subnets.
 * @param {string} targetUrl
 * @returns {{ isSafe: boolean, reason?: string }}
 */
export function validateWebhookDestination(targetUrl) {
  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { isSafe: false, reason: 'Invalid URL format' };
  }

  // Enforce HTTPS
  if (parsed.protocol !== 'https:') {
    return { isSafe: false, reason: 'Webhooks must use HTTPS protocol' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard private names
  if (hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { isSafe: false, reason: 'Internal and localhost domains are prohibited' };
  }

  // Regex checks for IPv4 private and link-local ranges
  const ipv4PrivateRegex = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/;
  if (ipv4PrivateRegex.test(hostname)) {
    return { isSafe: false, reason: 'Private IP addresses and cloud metadata services are blocked' };
  }

  return { isSafe: true };
}

/**
 * Generates and hashes a scoped B2B public API key.
 * @param {string} orgId
 * @returns {{ apiKey: string, keyHash: string, prefix: string }}
 */
export function generateApiKey(orgId) {
  const secretRandom = crypto.randomBytes(24).toString('base64url');
  const prefix = 'rs_live_';
  const apiKey = `${prefix}${secretRandom}`;
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  return {
    apiKey,
    keyHash,
    prefix
  };
}

/**
 * Handles incoming payment webhook with idempotency & replay protection.
 * @param {object} params
 * @param {string} params.eventId
 * @param {string} params.orgId
 * @param {string} params.planId
 * @param {number} params.amountPaid
 * @param {object} db - Firestore database
 * @param {Set<string>} [idempotencyCache] - In-memory / database idempotency store
 */
export async function processPaymentWebhook({ eventId, orgId, planId, amountPaid, db, idempotencyCache = new Set() }) {
  if (idempotencyCache.has(eventId)) {
    const error = new Error(`CONFLICT: Duplicate webhook event '${eventId}' detected. Replay attack blocked.`);
    error.code = 'already-exists';
    throw error;
  }

  idempotencyCache.add(eventId);

  const plan = SAAS_PLANS[planId];
  if (!plan) {
    throw new Error(`Invalid planId: ${planId}`);
  }

  const subscriptionRecord = {
    orgId,
    planId,
    status: 'active',
    lastEventId: eventId,
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('subscriptions').doc(orgId).set(subscriptionRecord, { merge: true });
    await db.collection('invoices').add({
      orgId,
      eventId,
      amountPaid,
      currency: 'BDT',
      status: 'paid',
      timestamp: new Date().toISOString()
    });
    await logAuditEvent(db, {
      actorUid: 'system:billing_webhook',
      action: 'SUBSCRIPTION_ACTIVATED',
      targetType: 'org',
      targetId: orgId,
      metadata: { planId, amountPaid, eventId }
    });
  }

  return {
    success: true,
    orgId,
    planId,
    status: 'active'
  };
}
