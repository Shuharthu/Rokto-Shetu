/**
 * @file firestore.test.js
 * @description Comprehensive security rules test suite.
 */

import { RulesEvaluator } from './rules_evaluator.js';

export function runFirestoreRulesTests() {
  const results = [];

  function assertRule(testName, expectation, evaluation) {
    const passed = evaluation.allowed === expectation;
    results.push({
      testName,
      passed,
      expected: expectation ? 'ALLOW' : 'DENY',
      actual: evaluation.allowed ? 'ALLOW' : 'DENY',
      error: passed ? null : `Expected ${expectation ? 'ALLOW' : 'DENY'} but got ${evaluation.allowed ? 'ALLOW' : 'DENY'}`
    });
  }

  // --- 1. Unauthenticated & Global Deny Tests ---
  assertRule(
    'Unauthenticated user cannot read /users/user123',
    false,
    RulesEvaluator.evaluate({ auth: null, path: 'users/user123', operation: 'get' })
  );

  assertRule(
    'Unauthenticated user cannot read /users_private/user123',
    false,
    RulesEvaluator.evaluate({ auth: null, path: 'users_private/user123', operation: 'get' })
  );

  assertRule(
    'Unauthenticated user cannot write to /audit_logs/log123',
    false,
    RulesEvaluator.evaluate({ auth: null, path: 'audit_logs/log123', operation: 'create', requestResource: { action: 'TEST' } })
  );

  // --- 2. User Profile Self-Update & Tampering Tests ---
  assertRule(
    'Authenticated user can read public profile /users/user123',
    true,
    RulesEvaluator.evaluate({ auth: { uid: 'other_user' }, path: 'users/user123', operation: 'get' })
  );

  assertRule(
    'User CANNOT modify their own verificationStatus to verified',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'user123' },
      path: 'users/user123',
      operation: 'update',
      resource: { uid: 'user123', verificationStatus: 'pending', displayName: 'Rafi' },
      requestResource: { uid: 'user123', verificationStatus: 'verified', displayName: 'Rafi' }
    })
  );

  assertRule(
    'User CANNOT add super_admin role to their own user document',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'user123' },
      path: 'users/user123',
      operation: 'update',
      resource: { uid: 'user123', roles: [], displayName: 'Rafi' },
      requestResource: { uid: 'user123', roles: ['super_admin'], displayName: 'Rafi' }
    })
  );

  assertRule(
    'User CAN update their own displayName',
    true,
    RulesEvaluator.evaluate({
      auth: { uid: 'user123' },
      path: 'users/user123',
      operation: 'update',
      resource: { uid: 'user123', displayName: 'Old Name', roles: [], verificationStatus: 'pending', isDonor: false, profileCompletion: 50 },
      requestResource: { uid: 'user123', displayName: 'New Name', roles: [], verificationStatus: 'pending', isDonor: false, profileCompletion: 50 }
    })
  );

  // --- 3. Donor Levels & Gamification Tampering Tests ---
  assertRule(
    'Donor CANNOT arbitrarily increase their totalDonations or level',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'donor123' },
      path: 'donors/donor123',
      operation: 'update',
      resource: { totalDonations: 2, level: 'bronze', points: 200 },
      requestResource: { totalDonations: 50, level: 'legend', points: 10000 }
    })
  );

  assertRule(
    'Donor CAN toggle their availability status',
    true,
    RulesEvaluator.evaluate({
      auth: { uid: 'donor123' },
      path: 'donors/donor123',
      operation: 'update',
      resource: { totalDonations: 2, level: 'bronze', points: 200, isEligible: true, availabilityStatus: 'unavailable' },
      requestResource: { totalDonations: 2, level: 'bronze', points: 200, isEligible: true, availabilityStatus: 'available_now' }
    })
  );

  // --- 4. Cross-Tenant B2B Isolation Tests ---
  assertRule(
    'Org A member CANNOT read Org B inventory units',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'user_org_a', token: { orgId: 'org_a', orgRole: 'inventory_staff' } },
      path: 'inventory_units/unit_b1',
      operation: 'get',
      resource: { orgId: 'org_b', bloodGroup: 'B+', status: 'available' }
    })
  );

  assertRule(
    'Org A member CAN read Org A inventory units',
    true,
    RulesEvaluator.evaluate({
      auth: { uid: 'user_org_a', token: { orgId: 'org_a', orgRole: 'inventory_staff' } },
      path: 'inventory_units/unit_a1',
      operation: 'get',
      resource: { orgId: 'org_a', bloodGroup: 'B+', status: 'available' }
    })
  );

  assertRule(
    'Org A member CANNOT create inventory unit assigned to Org B',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'user_org_a', token: { orgId: 'org_a', orgRole: 'inventory_staff' } },
      path: 'inventory_units/unit_x',
      operation: 'create',
      requestResource: { orgId: 'org_b', bloodGroup: 'O+' }
    })
  );

  // --- 5. Fundraiser Tampering & Four-Eyes Protection Tests ---
  assertRule(
    'Fundraiser applicant CANNOT update status to approved',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'applicant123' },
      path: 'fundraisers/camp123',
      operation: 'update',
      resource: { applicantId: 'applicant123', status: 'draft', raisedAmountBDT: 0, donorCount: 0 },
      requestResource: { applicantId: 'applicant123', status: 'approved', raisedAmountBDT: 0, donorCount: 0 }
    })
  );

  assertRule(
    'Fundraiser applicant CANNOT tamper with raisedAmountBDT',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'applicant123' },
      path: 'fundraisers/camp123',
      operation: 'update',
      resource: { applicantId: 'applicant123', status: 'draft', raisedAmountBDT: 0, donorCount: 0 },
      requestResource: { applicantId: 'applicant123', status: 'draft', raisedAmountBDT: 500000, donorCount: 10 }
    })
  );

  assertRule(
    'Platform Reviewer CAN update fundraiser status',
    true,
    RulesEvaluator.evaluate({
      auth: { uid: 'reviewer123', token: { fundraiser_reviewer: true } },
      path: 'fundraisers/camp123',
      operation: 'update',
      resource: { applicantId: 'applicant123', status: 'under_review' },
      requestResource: { applicantId: 'applicant123', status: 'approved' }
    })
  );

  // --- 6. Ledger Immutability Tests ---
  assertRule(
    'Normal user CANNOT read ledger entries',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'user123' },
      path: 'ledger_entries/entry1',
      operation: 'get'
    })
  );

  assertRule(
    'Finance approver CAN read ledger entries',
    true,
    RulesEvaluator.evaluate({
      auth: { uid: 'fin123', token: { finance_approver: true } },
      path: 'ledger_entries/entry1',
      operation: 'get'
    })
  );

  assertRule(
    'Finance approver CANNOT modify or delete ledger entries (ledger is append-only)',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'fin123', token: { finance_approver: true } },
      path: 'ledger_entries/entry1',
      operation: 'delete'
    })
  );

  // --- 7. Public Fundraisers Projection Tests ---
  assertRule(
    'Unauthenticated public CAN read public fundraisers',
    true,
    RulesEvaluator.evaluate({
      auth: null,
      path: 'public_fundraisers/camp_proj_1',
      operation: 'get'
    })
  );

  assertRule(
    'Clients CANNOT directly write to public fundraisers (Cloud Functions projection only)',
    false,
    RulesEvaluator.evaluate({
      auth: { uid: 'applicant123' },
      path: 'public_fundraisers/camp_proj_1',
      operation: 'create',
      requestResource: { title: 'Fake Campaign' }
    })
  );

  return results;
}
