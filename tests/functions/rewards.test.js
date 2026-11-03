/**
 * @file rewards.test.js
 * @description Unit tests for Gamification, Milestone Progress, Donation Gap Gating, and Coupon Codes.
 */

import { computeDonorLevelProgress, checkDonationEligibility, generateCouponCode, claimRewardHandler } from '../../functions/src/callable/rewards.js';

export async function runRewardsTests() {
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

  // 1. Level computation
  assert('computeDonorLevelProgress calculates Bronze at 3 donations', () => {
    const res = computeDonorLevelProgress(3);
    if (res.currentLevel !== 'bronze' || res.nextLevel !== 'silver' || res.neededToNext !== 3) {
      throw new Error(`Unexpected level state: ${JSON.stringify(res)}`);
    }
  });

  assert('computeDonorLevelProgress calculates Gold at 12 donations with 3 needed for Platinum', () => {
    const res = computeDonorLevelProgress(12);
    if (res.currentLevel !== 'gold' || res.nextLevel !== 'platinum' || res.neededToNext !== 3) {
      throw new Error(`Expected Gold with 3 to Platinum, got ${res.currentLevel} with ${res.neededToNext} needed`);
    }
  });

  assert('computeDonorLevelProgress calculates Legend at 50 donations with no further tiers', () => {
    const res = computeDonorLevelProgress(50);
    if (res.currentLevel !== 'legend' || res.nextLevel !== null || res.neededToNext !== 0) {
      throw new Error(`Expected Legend cap, got ${JSON.stringify(res)}`);
    }
  });

  // 2. Donation Gap Medical Enforcement
  assert('checkDonationEligibility enforces 90 days gap for male donors', () => {
    const now = new Date();
    // 30 days ago
    const lastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const res = checkDonationEligibility(lastDate, 'male', now);

    if (res.isEligible !== false || res.daysRemaining < 59 || res.daysRemaining > 61) {
      throw new Error(`Expected ~60 days remaining for male, got ${res.daysRemaining}`);
    }
  });

  assert('checkDonationEligibility marks eligible once 90 days pass', () => {
    const now = new Date();
    const lastDate = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000);
    const res = checkDonationEligibility(lastDate, 'male', now);

    if (res.isEligible !== true || res.daysRemaining !== 0) {
      throw new Error('Expected donor to be eligible after 95 days');
    }
  });

  assert('checkDonationEligibility enforces 120 days gap for female donors', () => {
    const now = new Date();
    const lastDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);
    const res = checkDonationEligibility(lastDate, 'female', now);

    if (res.isEligible !== false || res.daysRemaining < 19 || res.daysRemaining > 21) {
      throw new Error(`Expected ~20 days remaining for female, got ${res.daysRemaining}`);
    }
  });

  // 3. Cryptographic Coupon Generation
  assert('generateCouponCode produces RS-XXXX-XXXX format with high entropy', () => {
    const set = new Set();
    const regex = /^RS-[A-F0-9]{4}-[A-F0-9]{4}$/;

    for (let i = 0; i < 100; i++) {
      const code = generateCouponCode();
      if (!regex.test(code)) {
        throw new Error(`Coupon code '${code}' does not match expected format`);
      }
      set.add(code);
    }

    if (set.size !== 100) {
      throw new Error('Collision detected in coupon generation');
    }
  });

  // 4. Claim Reward Handler
  await assertAsync('claimRewardHandler rejects when user has insufficient points', async () => {
    let threw = false;
    try {
      await claimRewardHandler('user1', 'reward_expensive', null, 50, 200);
    } catch (err) {
      threw = err.code === 'failed-precondition';
    }
    if (!threw) throw new Error('Expected claimRewardHandler to throw for insufficient points');
  });

  await assertAsync('claimRewardHandler deducts points and issues coupon when balance is sufficient', async () => {
    const res = await claimRewardHandler('user1', 'reward_optics', null, 500, 200);
    if (!res.success || !res.couponCode || res.remainingPoints !== 300) {
      throw new Error('Expected 300 points remaining and valid coupon');
    }
  });

  return results;
}
