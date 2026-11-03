/**
 * @file auth.test.js
 * @description Cloud Functions auth middleware and role callable unit tests.
 */

import { requireAuth, requireRole, requireOrgMember } from '../../functions/src/middleware/auth.js';
import { assignPlatformRoleHandler } from '../../functions/src/callable/auth.js';

export async function runAuthTests() {
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

  // 1. requireAuth
  assert('requireAuth throws when context has no auth', () => {
    let threw = false;
    try {
      requireAuth({});
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error('Expected requireAuth to throw');
  });

  assert('requireAuth succeeds when context has valid uid', () => {
    const auth = requireAuth({ auth: { uid: 'u1' } });
    if (auth.uid !== 'u1') throw new Error('UID mismatch');
  });

  // 2. requireRole
  assert('requireRole permits super_admin unconditionally', () => {
    const auth = requireRole({ auth: { uid: 'u1', token: { super_admin: true } } }, 'finance_approver');
    if (!auth) throw new Error('Expected super_admin to pass');
  });

  assert('requireRole rejects user lacking required role', () => {
    let threw = false;
    try {
      requireRole({ auth: { uid: 'u1', token: { moderator: true } } }, 'finance_approver');
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error('Expected requireRole to throw for missing role');
  });

  assert('requireRole accepts user having one of multiple acceptable roles', () => {
    const auth = requireRole({ auth: { uid: 'u1', token: { senior_reviewer: true } } }, ['fundraiser_reviewer', 'senior_reviewer']);
    if (!auth) throw new Error('Expected senior_reviewer to pass');
  });

  // 3. requireOrgMember
  assert('requireOrgMember permits user with matching orgId and role', () => {
    const auth = requireOrgMember({ auth: { uid: 'u1', token: { orgId: 'org1', orgRole: 'manager' } } }, 'org1', ['manager', 'owner']);
    if (!auth) throw new Error('Expected org member check to pass');
  });

  assert('requireOrgMember rejects user from another organization', () => {
    let threw = false;
    try {
      requireOrgMember({ auth: { uid: 'u1', token: { orgId: 'org2', orgRole: 'manager' } } }, 'org1');
    } catch (e) {
      threw = true;
    }
    if (!threw) throw new Error('Expected cross-tenant access to throw');
  });

  // 4. assignPlatformRoleHandler
  await assertAsync('assignPlatformRoleHandler successfully updates custom claims when called by super_admin', async () => {
    let assignedClaims = null;
    const mockAuthAdmin = {
      getUser: async (uid) => ({ uid, customClaims: { moderator: true } }),
      setCustomUserClaims: async (uid, claims) => { assignedClaims = claims; }
    };
    const mockDb = {
      collection: () => ({
        doc: () => ({ set: async () => {} }),
        add: async () => ({ id: 'mock_audit_id' })
      })
    };

    const context = { auth: { uid: 'super1', token: { super_admin: true, email: 'admin@roktosetu.org' } } };
    const payload = { targetUid: 'target_u123', role: 'identity_verifier', enabled: true };

    const response = await assignPlatformRoleHandler(payload, context, mockAuthAdmin, mockDb);
    if (!response.success || assignedClaims?.identity_verifier !== true || assignedClaims?.moderator !== true) {
      throw new Error('Claims were not merged and updated correctly');
    }
  });

  return results;
}
