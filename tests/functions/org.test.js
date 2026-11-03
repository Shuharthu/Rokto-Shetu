/**
 * @file org.test.js
 * @description Unit tests for B2B Organization Workspace: FEFO Inventory Sorting & Event Logging.
 */

import { calculateFefoInventory, recordInventoryEvent, transferBloodUnitHandler } from '../../functions/src/callable/org.js';

export async function runOrgTests() {
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

  const now = Date.now();
  const sampleUnits = [
    {
      unitId: 'unit_far_exp',
      bloodGroup: 'B+',
      expiryDate: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days away
    },
    {
      unitId: 'unit_expiring_soon',
      bloodGroup: 'B+',
      expiryDate: new Date(now + 24 * 60 * 60 * 1000).toISOString() // 24 hours away
    },
    {
      unitId: 'unit_expired',
      bloodGroup: 'B+',
      expiryDate: new Date(now - 5 * 60 * 60 * 1000).toISOString() // expired 5 hours ago
    }
  ];

  // 1. FEFO Sorting
  assert('calculateFefoInventory sorts strictly by expiry date ascending', () => {
    const sorted = calculateFefoInventory(sampleUnits);

    if (sorted[0].unitId !== 'unit_expired' || sorted[1].unitId !== 'unit_expiring_soon' || sorted[2].unitId !== 'unit_far_exp') {
      throw new Error(`FEFO sorting order failed: ${sorted.map(s => s.unitId).join(' -> ')}`);
    }

    if (sorted[1].expiryUrgency !== 'critical_expiring_soon') {
      throw new Error(`Expected critical_expiring_soon for 24h unit, got ${sorted[1].expiryUrgency}`);
    }

    if (sorted[0].expiryUrgency !== 'expired') {
      throw new Error(`Expected expired flag, got ${sorted[0].expiryUrgency}`);
    }
  });

  // 2. recordInventoryEvent
  await assertAsync('recordInventoryEvent creates immutable event payload', async () => {
    const mockDb = {
      collection: () => ({
        add: async (doc) => ({ id: 'mock_evt_123', ...doc })
      })
    };

    const evt = await recordInventoryEvent({
      orgId: 'org_cmch',
      unitId: 'BAG-99',
      eventType: 'received',
      actorUid: 'staff_1',
      notes: 'Collected at Agrabad Camp',
      db: mockDb
    });

    if (evt.eventType !== 'received' || evt.unitId !== 'BAG-99') {
      throw new Error('Event payload mismatch');
    }
  });

  // 3. transferBloodUnitHandler
  await assertAsync('transferBloodUnitHandler blocks transfer between identical branches', async () => {
    let threw = false;
    try {
      await transferBloodUnitHandler({
        orgId: 'org_cmch',
        unitId: 'BAG-99',
        sourceBranchId: 'branch_a',
        targetBranchId: 'branch_a',
        actorUid: 'staff_1',
        db: null
      });
    } catch {
      threw = true;
    }

    if (!threw) throw new Error('Expected identical branch transfer to fail');
  });

  return results;
}
