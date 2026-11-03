/**
 * @file billing.test.js
 * @description Unit tests for SaaS Billing, HMAC Webhook Verification, SSRF Protection & API Keys.
 */

import crypto from 'crypto';
import {
  SAAS_PLANS,
  computeHmacSignature,
  verifyWebhookSignature,
  validateWebhookDestination,
  generateApiKey,
  processPaymentWebhook
} from '../../functions/src/services/billing.js';

export async function runBillingTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  async function assertAsync(name, fn) {
    try {
      await fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // 1. HMAC Signature generation and timing-safe verification
  const secretKey = 'whsec_test_secret_key_12345';
  const payload = JSON.stringify({ event: 'invoice.paid', amount: 7500, orgId: 'org_test' });

  assert('computeHmacSignature generates 64-char SHA256 hex string', () => {
    const validSig = computeHmacSignature(payload, secretKey);
    if (typeof validSig !== 'string' || validSig.length !== 64) {
      throw new Error(`Expected 64-char string, got ${validSig}`);
    }
  });

  assert('verifyWebhookSignature verifies valid signature', () => {
    const validSig = computeHmacSignature(payload, secretKey);
    if (!verifyWebhookSignature(validSig, payload, secretKey)) {
      throw new Error('Valid signature failed verification');
    }
  });

  assert('verifyWebhookSignature rejects tampered signature', () => {
    if (verifyWebhookSignature('bad_signature_here', payload, secretKey)) {
      throw new Error('Tampered signature unexpectedly passed verification');
    }
  });

  assert('verifyWebhookSignature rejects tampered payload', () => {
    const validSig = computeHmacSignature(payload, secretKey);
    if (verifyWebhookSignature(validSig, payload + 'tampered', secretKey)) {
      throw new Error('Tampered payload unexpectedly passed verification');
    }
  });

  assert('verifyWebhookSignature rejects wrong secret key', () => {
    const validSig = computeHmacSignature(payload, secretKey);
    if (verifyWebhookSignature(validSig, payload, 'wrong_secret')) {
      throw new Error('Wrong secret unexpectedly passed verification');
    }
  });

  // 2. SSRF Protection Tests
  assert('validateWebhookDestination blocks localhost, loopback and private IPs', () => {
    const blockedUrls = [
      'http://api.hospital.org/webhook', // HTTP not allowed
      'https://localhost/webhook', // localhost
      'https://127.0.0.1/webhook', // loopback
      'https://169.254.169.254/latest/meta-data', // AWS/GCP metadata service
      'https://10.0.0.5/api', // RFC 1918 class A
      'https://192.168.1.10/api', // RFC 1918 class C
      'https://172.16.0.2/api', // RFC 1918 class B
      'https://intranet.local/webhook', // .local
      'https://service.internal/webhook' // .internal
    ];

    for (const url of blockedUrls) {
      const res = validateWebhookDestination(url);
      if (res.isSafe) {
        throw new Error(`SSRF filter failed to block: ${url}`);
      }
    }
  });

  assert('validateWebhookDestination allows legitimate public HTTPS URLs', () => {
    const allowedUrls = [
      'https://api.dhakahospital.org/webhooks/blood',
      'https://crm.redcrescent.org.bd/integrations/roktosetu',
      'https://hooks.slack.com/services/T00/B00/XXXX'
    ];

    for (const url of allowedUrls) {
      const res = validateWebhookDestination(url);
      if (!res.isSafe) {
        throw new Error(`SSRF filter falsely blocked: ${url} (${res.reason})`);
      }
    }
  });

  // 3. API Key Generation and SHA-256 Key Hashing
  assert('generateApiKey produces rs_live_ prefix and valid SHA-256 hash', () => {
    const { apiKey, keyHash, prefix } = generateApiKey('org_123');
    if (!apiKey.startsWith('rs_live_') || prefix !== 'rs_live_') {
      throw new Error('Invalid API key format');
    }
    const expectedHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    if (keyHash !== expectedHash) {
      throw new Error('Key hash mismatch');
    }
  });

  // 4. Webhook Replay Protection & Idempotency
  await assertAsync('processPaymentWebhook activates subscription and rejects duplicate replay attacks', async () => {
    const idempotencyStore = new Set();
    const mockDb = {
      collections: {},
      collection(name) {
        if (!this.collections[name]) this.collections[name] = [];
        return {
          doc: (id) => ({
            set: async (data) => {
              this.collections[name].push({ id, ...data });
            }
          }),
          add: async (data) => {
            const id = 'doc_' + Math.random().toString(36).substring(7);
            this.collections[name].push({ id, ...data });
            return { id };
          }
        };
      }
    };

    const webhookResult = await processPaymentWebhook({
      eventId: 'evt_stripe_9999',
      orgId: 'org_dhaka_01',
      planId: 'pro',
      amountPaid: 7500,
      db: mockDb,
      idempotencyCache: idempotencyStore
    });

    if (!webhookResult.success || webhookResult.status !== 'active') {
      throw new Error('Webhook failed to activate subscription');
    }

    let replayCaught = false;
    try {
      await processPaymentWebhook({
        eventId: 'evt_stripe_9999',
        orgId: 'org_dhaka_01',
        planId: 'pro',
        amountPaid: 7500,
        db: mockDb,
        idempotencyCache: idempotencyStore
      });
    } catch (err) {
      replayCaught = true;
      if (!err.message.includes('CONFLICT: Duplicate webhook event')) {
        throw new Error(`Unexpected replay error: ${err.message}`);
      }
    }

    if (!replayCaught) {
      throw new Error('Replayed webhook event was not rejected');
    }
  });

  return results;
}
