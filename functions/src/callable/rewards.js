/**
 * @file rewards.js
 * @description Gamification Engine: Level Thresholds, Milestone Nudges, and Cryptographic Coupon Generation.
 */

import crypto from 'crypto';
import { logAuditEvent } from '../utils/audit.js';

export const LEVEL_THRESHOLDS = [
  { level: 'legend', threshold: 50, name: 'Legend', color: '#D90429', perks: ['Annual Hero Trophy', 'VIP Concierge', 'Priority Listing'] },
  { level: 'diamond', threshold: 25, name: 'Diamond', color: '#00BCD4', perks: ['Diamond Donor Badge', 'Special Recognition', '15% Partner Perks'] },
  { level: 'platinum', threshold: 15, name: 'Platinum', color: '#708090', perks: ['Platinum Frame', 'Certificate of Honor', '10% Partner Perks'] },
  { level: 'gold', threshold: 10, name: 'Gold', color: '#D4AF37', perks: ['Gold Donor Badge', 'Profile Frame', 'Priority Search'] },
  { level: 'silver', threshold: 6, name: 'Silver', color: '#A8A9AD', perks: ['Silver Badge', 'Digital Donor Card'] },
  { level: 'bronze', threshold: 3, name: 'Bronze', color: '#B87333', perks: ['Bronze Badge', 'Hero Welcome Pack'] }
];

/**
 * Computes donor level and milestone progress.
 * @param {number} totalDonations
 * @returns {{ currentLevel: string, nextLevel: string|null, currentCount: number, nextThreshold: number|null, neededToNext: number, progressPercent: number }}
 */
export function computeDonorLevelProgress(totalDonations) {
  const count = Math.max(0, parseInt(totalDonations, 10) || 0);

  // Find highest level unlocked
  let currentLevel = 'starter';
  let nextLevel = 'bronze';
  let nextThreshold = 3;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= LEVEL_THRESHOLDS[i].threshold) {
      currentLevel = LEVEL_THRESHOLDS[i].level;
      if (i > 0) {
        nextLevel = LEVEL_THRESHOLDS[i - 1].level;
        nextThreshold = LEVEL_THRESHOLDS[i - 1].threshold;
      } else {
        nextLevel = null; // Reached highest level (Legend)
        nextThreshold = null;
      }
    }
  }

  let neededToNext = 0;
  let progressPercent = 100;

  if (nextThreshold !== null) {
    neededToNext = Math.max(0, nextThreshold - count);
    progressPercent = Math.min(100, Math.round((count / nextThreshold) * 100));
  }

  return {
    currentLevel,
    nextLevel,
    currentCount: count,
    nextThreshold,
    neededToNext,
    progressPercent
  };
}

/**
 * Validates donation eligibility based on mandatory medical recovery gap.
 * @param {Date|string} lastDonationDate
 * @param {'male'|'female'|'other'} gender
 * @param {Date} [currentDate=new Date()]
 * @returns {{ isEligible: boolean, daysRemaining: number, nextEligibleDate: string }}
 */
export function checkDonationEligibility(lastDonationDate, gender, currentDate = new Date()) {
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: 0, nextEligibleDate: currentDate.toISOString() };
  }

  const gapDays = gender === 'female' ? 120 : 90;
  const lastDate = new Date(lastDonationDate);
  const nextEligible = new Date(lastDate.getTime() + gapDays * 24 * 60 * 60 * 1000);

  const diffTime = nextEligible.getTime() - currentDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    isEligible: daysRemaining === 0,
    daysRemaining,
    nextEligibleDate: nextEligible.toISOString()
  };
}

/**
 * Generates a cryptographically secure single-use coupon code.
 * Format: RS-XXXX-XXXX (e.g. RS-A8F2-9K1L)
 * @returns {string}
 */
export function generateCouponCode() {
  const bytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RS-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}`;
}

/**
 * Claims a partner reward with points.
 * @param {string} userId
 * @param {string} rewardId
 * @param {object} db - Firestore database
 * @param {number} userPoints
 * @param {number} rewardCost
 */
export async function claimRewardHandler(userId, rewardId, db, userPoints, rewardCost) {
  if (userPoints < rewardCost) {
    const err = new Error(`INSUFFICIENT_POINTS: Requires ${rewardCost} points, user has ${userPoints}.`);
    err.code = 'failed-precondition';
    throw err;
  }

  const couponCode = generateCouponCode();
  const rewardDoc = {
    userId,
    rewardId,
    couponCode,
    pointsSpent: rewardCost,
    claimedAt: new Date().toISOString(),
    status: 'active'
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('user_rewards').add(rewardDoc);
    await logAuditEvent(db, {
      actorUid: userId,
      action: 'REWARD_CLAIMED',
      targetType: 'reward',
      targetId: rewardId,
      metadata: { couponCode, pointsSpent: rewardCost }
    });
  }

  return {
    success: true,
    couponCode,
    remainingPoints: userPoints - rewardCost
  };
}
