/**
 * @file fundraiser.js
 * @description Cloud Functions callable handlers for Critical Patient Fundraisers, 4-Eyes Review & Milestone Payouts.
 */

import { DoubleEntryLedger } from '../services/ledger.js';
import { logAuditEvent } from '../utils/audit.js';

export const BMDC_REGEX = /^A\d{4,6}$/i;

/**
 * Validates and submits a new patient medical fundraiser application.
 */
export async function applyFundraiserHandler({ data, context, db }) {
  const uid = context?.auth?.uid;
  if (!uid) {
    throw new Error('Authentication required to submit fundraiser application');
  }

  const {
    patientName,
    patientAge,
    diagnosis,
    hospitalName,
    doctorName,
    bmdcRegistrationNumber,
    targetAmountBDT,
    story,
    milestones = []
  } = data;

  if (!patientName || !diagnosis || !hospitalName || !doctorName || !targetAmountBDT) {
    throw new Error('Missing required medical or hospital details');
  }

  if (!BMDC_REGEX.test(bmdcRegistrationNumber)) {
    throw new Error('Invalid BMDC (Bangladesh Medical & Dental Council) registration number format. Expected format: A12345');
  }

  if (typeof targetAmountBDT !== 'number' || targetAmountBDT < 1000 || targetAmountBDT > 5000000) {
    throw new Error('Target amount must be between ৳1,000 and ৳5,000,000 BDT');
  }

  const campaignId = 'fund_' + Date.now();
  const campaignRecord = {
    campaignId,
    applicantUid: uid,
    patientName,
    patientAge,
    diagnosis,
    hospitalName,
    doctorName,
    bmdcRegistrationNumber: bmdcRegistrationNumber.toUpperCase(),
    targetAmountBDT,
    raisedAmountBDT: 0,
    donorsCount: 0,
    story,
    milestones: milestones.length > 0 ? milestones : [
      { id: 1, title: 'Pre-Op Hospital Admission & Diagnostics', amountBDT: Math.round(targetAmountBDT * 0.4), status: 'pending' },
      { id: 2, title: 'Surgery & ICU Management', amountBDT: Math.round(targetAmountBDT * 0.4), status: 'pending' },
      { id: 3, title: 'Post-Op Medication & Discharge', amountBDT: Math.round(targetAmountBDT * 0.2), status: 'pending' }
    ],
    status: 'under_review',
    reviews: {
      firstReview: null,
      seniorReview: null
    },
    createdAt: new Date().toISOString()
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('fundraisers').doc(campaignId).set(campaignRecord);
    await logAuditEvent(db, {
      actorUid: uid,
      action: 'FUNDRAISER_SUBMITTED',
      targetType: 'fundraiser',
      targetId: campaignId,
      metadata: { patientName, hospitalName, targetAmountBDT }
    });
  }

  return {
    success: true,
    campaignId,
    status: 'under_review'
  };
}

/**
 * 4-Eyes Review Flow for Patient Fundraisers.
 * Step 1: Medical Document Reviewer approves medical validity -> 'medical_verified'
 * Step 2: Senior Admin / Finance Reviewer approves campaign publication -> 'active'
 */
export async function reviewFundraiserHandler({ campaign, reviewerUid, reviewerRole, reviewStep, decision, notes = '' }) {
  if (!campaign || !reviewerUid) {
    throw new Error('Campaign object and reviewer UID are required');
  }

  if (decision === 'reject') {
    return {
      ...campaign,
      status: 'rejected',
      rejectionNotes: notes,
      updatedAt: new Date().toISOString()
    };
  }

  // Step 1: First Eye (Medical Document Reviewer)
  if (reviewStep === 'first_review') {
    if (reviewerRole !== 'fundraiser_reviewer' && reviewerRole !== 'super_admin') {
      throw new Error('Unauthorized: only fundraiser_reviewer can perform first review');
    }

    return {
      ...campaign,
      status: 'medical_verified',
      reviews: {
        ...campaign.reviews,
        firstReview: {
          reviewerUid,
          reviewedAt: new Date().toISOString(),
          notes
        }
      }
    };
  }

  // Step 2: Second Eye (Senior Reviewer)
  if (reviewStep === 'senior_review') {
    if (reviewerRole !== 'senior_reviewer' && reviewerRole !== 'super_admin') {
      throw new Error('Unauthorized: only senior_reviewer can perform final approval');
    }

    if (!campaign.reviews?.firstReview?.reviewerUid) {
      throw new Error('Four-eyes violation: campaign has not completed first-eye medical review');
    }

    // 4-EYES RULE: Same individual CANNOT be both first and second reviewer
    if (campaign.reviews.firstReview.reviewerUid === reviewerUid) {
      throw new Error('Four-eyes violation: second-eye approval MUST be performed by a different reviewer');
    }

    return {
      ...campaign,
      status: 'active',
      reviews: {
        ...campaign.reviews,
        seniorReview: {
          reviewerUid,
          reviewedAt: new Date().toISOString(),
          notes
        }
      }
    };
  }

  throw new Error(`Invalid review step: ${reviewStep}`);
}

/**
 * Records an incoming patient donation with balanced double-entry ledger transaction.
 */
export async function recordFundraiserDonation({ campaign, amountBDT, donorUid = 'anon', donorName = 'Kind Supporter', ledgerStore = [] }) {
  if (campaign.status !== 'active') {
    throw new Error(`Cannot donate to campaign with status: ${campaign.status}. Only active campaigns accept funds.`);
  }

  if (typeof amountBDT !== 'number' || amountBDT <= 0 || !Number.isInteger(amountBDT)) {
    throw new Error('Donation amount must be a positive integer in BDT');
  }

  const txId = 'tx_don_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  const ledgerTx = DoubleEntryLedger.recordDonation({
    transactionId: txId,
    campaignId: campaign.campaignId,
    amountBDT,
    donorUid,
    donorName
  });

  ledgerStore.push(ledgerTx);

  const updatedCampaign = {
    ...campaign,
    raisedAmountBDT: (campaign.raisedAmountBDT || 0) + amountBDT,
    donorsCount: (campaign.donorsCount || 0) + 1,
    lastDonationAt: new Date().toISOString()
  };

  return {
    success: true,
    campaign: updatedCampaign,
    ledgerTransaction: ledgerTx
  };
}

/**
 * Approves a staged milestone payout and generates disbursement ledger entry.
 */
export async function approveMilestonePayoutHandler({ campaign, milestoneIndex, adminUid, ledgerStore = [] }) {
  const milestone = campaign.milestones[milestoneIndex];
  if (!milestone) {
    throw new Error('Milestone not found');
  }

  if (milestone.status === 'disbursed') {
    throw new Error('Milestone already disbursed');
  }

  const currentEscrow = DoubleEntryLedger.computeEscrowBalance(ledgerStore, campaign.campaignId);
  if (currentEscrow < milestone.amountBDT) {
    throw new Error(`Insufficient escrow funds! Available: ৳${currentEscrow}, Requested: ৳${milestone.amountBDT}`);
  }

  const txId = 'tx_pay_' + Date.now();
  const payoutTx = DoubleEntryLedger.recordMilestonePayout({
    transactionId: txId,
    campaignId: campaign.campaignId,
    amountBDT: milestone.amountBDT,
    adminUid,
    hospitalName: campaign.hospitalName,
    milestoneNumber: milestone.id
  });

  ledgerStore.push(payoutTx);

  const updatedMilestones = [...campaign.milestones];
  updatedMilestones[milestoneIndex] = {
    ...milestone,
    status: 'disbursed',
    disbursedAt: new Date().toISOString(),
    payoutTxId: txId
  };

  return {
    success: true,
    campaign: {
      ...campaign,
      milestones: updatedMilestones
    },
    payoutTransaction: payoutTx
  };
}

/**
 * Automated Fraud Signal Engine for Critical Patient Fundraiser Applications.
 * Checks duplicate document hashes, reused payout accounts, PDF size anomalies, and target spikes.
 *
 * @param {object} data - Fundraiser application data
 * @param {Array<object>} [existingCampaigns=[]] - Existing campaigns for cross-referencing
 * @param {Set<string>} [flaggedAccounts=new Set()] - Watchlist of known fraudulent accounts
 * @returns {{ riskScore: number, flags: Array<object>, isBlocked: boolean, status: string }}
 */
export function analyzeFundraiserFraudSignals(data, existingCampaigns = [], flaggedAccounts = new Set()) {
  const flags = [];
  let riskScore = 0;

  // 1. Check duplicate document hashes (tampered or recycled hospital certificates)
  if (Array.isArray(data.documentHashes)) {
    for (const hash of data.documentHashes) {
      const match = existingCampaigns.find(c =>
        c.campaignId !== data.campaignId &&
        Array.isArray(c.documentHashes) &&
        c.documentHashes.includes(hash)
      );
      if (match) {
        flags.push({
          code: 'DUPLICATE_DOCUMENT_HASH',
          severity: 'HIGH',
          message: `Document SHA-256 hash ${hash.slice(0, 8)}... was previously submitted in campaign ${match.campaignId}`
        });
        riskScore += 45;
      }
    }
  }

  // 2. Check reused beneficiary payout bank account across different patient names
  if (data.payoutAccount) {
    const accNum = data.payoutAccount.accountNumber;
    if (flaggedAccounts.has(accNum)) {
      flags.push({
        code: 'FLAGGED_PAYOUT_ACCOUNT',
        severity: 'CRITICAL',
        message: `Payout account ${accNum} is on the platform anti-fraud watchlist.`
      });
      riskScore += 60;
    }

    const duplicateAcc = existingCampaigns.find(c =>
      c.campaignId !== data.campaignId &&
      c.payoutAccount?.accountNumber === accNum &&
      c.patientName && data.patientName &&
      c.patientName.toLowerCase() !== data.patientName.toLowerCase()
    );
    if (duplicateAcc) {
      flags.push({
        code: 'REUSED_PAYOUT_ACCOUNT',
        severity: 'HIGH',
        message: `Bank account ${accNum} is reused across different patient names (${data.patientName} vs ${duplicateAcc.patientName})`
      });
      riskScore += 35;
    }
  }

  // 3. PDF Anomalies (e.g. suspiciously small file size < 5KB)
  if (Array.isArray(data.documents)) {
    for (const doc of data.documents) {
      if (doc.sizeBytes && doc.sizeBytes < 5000) {
        flags.push({
          code: 'PDF_SIZE_ANOMALY',
          severity: 'MEDIUM',
          message: `Document "${doc.fileName}" is suspiciously small (${doc.sizeBytes} bytes) for an official hospital quotation.`
        });
        riskScore += 15;
      }
    }
  }

  // 4. Target amount threshold
  if (data.targetAmountBDT > 5000000) {
    flags.push({
      code: 'EXCESSIVE_TARGET_AMOUNT',
      severity: 'HIGH',
      message: 'Requested amount exceeds ৳5,000,000 national threshold and requires multi-specialist clinical board verification.'
    });
    riskScore += 30;
  }

  const isBlocked = riskScore >= 70;

  return {
    riskScore: Math.min(100, riskScore),
    flags,
    isBlocked,
    status: isBlocked ? 'auto_flagged' : (flags.length > 0 ? 'review_warning' : 'clean')
  };
}
