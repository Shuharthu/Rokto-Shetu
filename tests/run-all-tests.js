/**
 * @file run-all-tests.js
 * @description Master automated test suite runner for Phase 2.
 */

import { runFirestoreRulesTests } from './rules/firestore.test.js';
import { runStorageRulesTests } from './rules/storage.test.js';
import { runAuthTests } from './functions/auth.test.js';
import { runGeohashTests } from './functions/geohash.test.js';
import { runKmsTests } from './functions/kms.test.js';
import { runRateLimitTests } from './functions/rateLimit.test.js';
import { runValidationTests } from './functions/validation.test.js';
import { runMatchingTests } from './functions/matching.test.js';
import { runRewardsTests } from './functions/rewards.test.js';
import { runOrgTests } from './functions/org.test.js';
import { runBillingTests } from './functions/billing.test.js';
import { runFundraiserTests } from './functions/fundraiser.test.js';
import { runAdminTests } from './functions/admin.test.js';
import { runAntiCommercialTests } from './functions/anti_commercial.test.js';
import { runSection17Tests } from './functions/section17.test.js';
import { runSecureAuthTests } from './test-secure-auth.js';

async function main() {
  console.log('\n=====================================================================');
  console.log('ROKTOSETU (রক্তসেতু) — PHASE 2 AUTOMATED TEST SUITE');
  console.log('=====================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function printGroup(name, testResults) {
    console.log(`\n--- [TEST SUITE] ${name} ---`);
    for (const res of testResults) {
      totalTests++;
      if (res.passed) {
        passedTests++;
        console.log(`  [PASS] ${res.testName}`);
      } else {
        failedTests++;
        console.error(`  [FAIL] ${res.testName} => ${res.error || 'Assertion failed'}`);
      }
    }
  }

  // 1. Rules Tests
  const firestoreResults = runFirestoreRulesTests();
  printGroup('Firestore Security Rules & Tenant Isolation', firestoreResults);

  const storageResults = runStorageRulesTests();
  printGroup('Cloud Storage Security Rules & MIME Gating', storageResults);

  // 2. Functions Core Tests
  const authResults = await runAuthTests();
  printGroup('Cloud Functions Auth Middleware & Role Assignment', authResults);

  const geohashResults = runGeohashTests();
  printGroup('Geohash Encoding, Distance & Coordinate Fuzzing', geohashResults);

  const kmsResults = runKmsTests();
  printGroup('Cloud KMS AES-256-GCM Encryption & Salted ID Hash', kmsResults);

  const rateLimitResults = runRateLimitTests();
  printGroup('Sliding Window Rate Limiter', rateLimitResults);

  const validationResults = runValidationTests();
  printGroup('Zod Schemas & Input Validation', validationResults);

  const matchingResults = await runMatchingTests();
  printGroup('Expanding Ring Matching Engine & Privacy Protocol', matchingResults);

  const rewardsResults = await runRewardsTests();
  printGroup('Donor Levels, Gamification & Coupon Cryptography', rewardsResults);

  const orgResults = await runOrgTests();
  printGroup('B2B Organization Workspace & FEFO Blood Inventory', orgResults);

  const billingResults = await runBillingTests();
  printGroup('SaaS Billing Engine, HMAC Webhooks & SSRF Blocker', billingResults);

  const fundraiserResults = await runFundraiserTests();
  printGroup('Critical Patient Fundraiser, Double-Entry Ledger & 4-Eyes Payouts', fundraiserResults);

  const adminResults = await runAdminTests();
  printGroup('Unified Platform Admin Console, User Moderation & Org Approvals', adminResults);

  const antiCommercialResults = await runAntiCommercialTests();
  printGroup('Anti-Commercialization Filter (Word Boundary, Exemptions & Dual-Language)', antiCommercialResults);

  const section17Results = await runSection17Tests();
  printGroup('Section 17: Donor Certification, Digital ID Cards & Social Sharing', section17Results);

  const secureAuthResults = await runSecureAuthTests();
  printGroup('Firebase Auth, Cloud Firestore Profile & Role Security', secureAuthResults);

  console.log('\n=====================================================================');
  console.log(`SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('=====================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('All Phase 2 test suites passed successfully!\n');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
