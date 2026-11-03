/**
 * @file admin.test.js
 * @description Unit tests for Platform Administration, User Moderation & Org Verification.
 */

import {
  getPlatformStatsHandler,
  manageUserStatusHandler,
  approveOrgApplicationHandler
} from '../../functions/src/callable/admin.js';

export async function runAdminTests() {
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

  // 1. Stats Handler
  await assertAsync('getPlatformStatsHandler returns national metrics for authorized admin', async () => {
    const adminContext = {
      auth: {
        uid: 'admin_usr_01',
        token: { admin: true, email: 'admin@roktosetu.org' }
      }
    };
    const res = await getPlatformStatsHandler({ context: adminContext });
    if (!res.kpis || res.kpis.totalDonors !== 14820 || res.divisionMetrics.length !== 8) {
      throw new Error('Invalid platform stats returned');
    }
  });

  await assertAsync('getPlatformStatsHandler rejects unauthorized regular user', async () => {
    const userContext = {
      auth: {
        uid: 'regular_user_01',
        token: { donor: true }
      }
    };
    let threw = false;
    try {
      await getPlatformStatsHandler({ context: userContext });
    } catch (err) {
      threw = true;
      if (!err.message.includes('PERMISSION_DENIED')) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Regular user was able to access admin platform stats');
  });

  // 2. User Moderation Handler
  const mockDb = {
    collections: {},
    collection(name) {
      if (!this.collections[name]) this.collections[name] = {};
      return {
        doc: (id) => ({
          update: async (data) => {
            this.collections[name][id] = { ...(this.collections[name][id] || {}), ...data };
          }
        }),
        add: async (data) => {
          const id = 'log_' + Date.now();
          this.collections[name][id] = data;
          return { id };
        }
      };
    }
  };

  await assertAsync('manageUserStatusHandler suspends bad actor with valid reason', async () => {
    const modContext = {
      auth: {
        uid: 'mod_usr_02',
        token: { moderator: true, email: 'mod@roktosetu.org' }
      }
    };

    const res = await manageUserStatusHandler({
      data: {
        targetUid: 'bad_user_99',
        action: 'suspend',
        reason: 'Repeatedly demanding payment for blood donations in chat'
      },
      context: modContext,
      db: mockDb
    });

    if (!res.success || res.newStatus !== 'suspended') {
      throw new Error('User failed to suspend');
    }
    const userDoc = mockDb.collections.users['bad_user_99'];
    if (userDoc?.accountStatus !== 'suspended') {
      throw new Error('User document accountStatus was not updated');
    }
  });

  await assertAsync('manageUserStatusHandler rejects suspension with empty reason', async () => {
    const modContext = {
      auth: { uid: 'mod_usr_02', token: { moderator: true } }
    };
    let threw = false;
    try {
      await manageUserStatusHandler({
        data: {
          targetUid: 'bad_user_99',
          action: 'suspend',
          reason: ''
        },
        context: modContext,
        db: mockDb
      });
    } catch (err) {
      threw = true;
    }
    if (!threw) throw new Error('Suspension with empty reason was permitted');
  });

  // 3. Org Approval Handler
  let assignedClaims = null;
  const mockAuthAdmin = {
    setCustomUserClaims: async (uid, claims) => {
      assignedClaims = { uid, claims };
    }
  };

  await assertAsync('approveOrgApplicationHandler verifies hospital and assigns owner custom claims', async () => {
    const adminContext = {
      auth: { uid: 'admin_super_1', token: { super_admin: true } }
    };

    const res = await approveOrgApplicationHandler({
      data: {
        orgId: 'org_chattogram_metro',
        applicantUid: 'doctor_kamal_88',
        orgName: 'Chattogram Metro Blood Center'
      },
      context: adminContext,
      authAdmin: mockAuthAdmin,
      db: mockDb
    });

    if (!res.success || res.verificationStatus !== 'verified') {
      throw new Error('Org failed to verify');
    }
    if (!assignedClaims || assignedClaims.uid !== 'doctor_kamal_88' || assignedClaims.claims.orgRole !== 'owner') {
      throw new Error('Custom claims failed to assign to applicant');
    }
  });

  return results;
}
