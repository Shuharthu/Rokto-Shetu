/**
 * @file fundraiser.test.js
 * @description Unit tests for Double-Entry Financial Ledger, 4-Eyes Fundraiser Review & Staged Payouts.
 */

import { DoubleEntryLedger } from '../../functions/src/services/ledger.js';
import {
  BMDC_REGEX,
  applyFundraiserHandler,
  reviewFundraiserHandler,
  recordFundraiserDonation,
  approveMilestonePayoutHandler,
  analyzeFundraiserFraudSignals
} from '../../functions/src/callable/fundraiser.js';

export async function runFundraiserTests() {
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

  // 1. Double-Entry Ledger Invariants
  assert('DoubleEntryLedger enforces debits === credits balance', () => {
    let threw = false;
    try {
      DoubleEntryLedger.createTransaction({
        transactionId: 'tx_unbalanced',
        campaignId: 'fund_100',
        description: 'Broken transaction',
        actorUid: 'usr_admin',
        entries: [
          { account: 'asset:cash', type: 'DEBIT', amountBDT: 5000 },
          { account: 'liability:escrow', type: 'CREDIT', amountBDT: 4000 } // Unbalanced!
        ]
      });
    } catch (err) {
      threw = true;
      if (!err.message.includes('Double-entry balance mismatch')) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
    if (!threw) throw new Error('Unbalanced transaction failed to throw error');
  });

  assert('DoubleEntryLedger records balanced donation transaction', () => {
    const tx = DoubleEntryLedger.recordDonation({
      transactionId: 'tx_don_1',
      campaignId: 'fund_100',
      amountBDT: 1500,
      donorUid: 'user_donor_1',
      donorName: 'Tanvir Hossain'
    });

    if (tx.totalAmountBDT !== 1500 || tx.entries.length !== 2) {
      throw new Error('Invalid transaction payload');
    }
    if (tx.entries[0].account !== 'asset:mfs_clearing' || tx.entries[0].type !== 'DEBIT') {
      throw new Error('Entry 0 must be DEBIT to asset:mfs_clearing');
    }
    if (tx.entries[1].account !== 'liability:campaign_escrow:fund_100' || tx.entries[1].type !== 'CREDIT') {
      throw new Error('Entry 1 must be CREDIT to liability:campaign_escrow');
    }
    if (!tx.hash || tx.hash.length !== 64) {
      throw new Error('Transaction must contain SHA-256 integrity hash');
    }
  });

  // 2. BMDC Doctor Registration Validation
  assert('BMDC regex validates Bangladesh Medical Council registration numbers', () => {
    if (!BMDC_REGEX.test('A54219')) throw new Error('Valid BMDC A54219 rejected');
    if (!BMDC_REGEX.test('a1234')) throw new Error('Valid lowercase a1234 rejected');
    if (BMDC_REGEX.test('INVALID_123')) throw new Error('Invalid BMDC format accepted');
    if (BMDC_REGEX.test('12345')) throw new Error('Number without prefix accepted');
  });

  // 3. 4-Eyes Review Workflow
  const sampleCampaign = {
    campaignId: 'fund_999',
    patientName: 'Baby Ayan',
    status: 'under_review',
    hospitalName: 'Dhaka Shishu Hospital',
    targetAmountBDT: 200000,
    raisedAmountBDT: 0,
    milestones: [
      { id: 1, title: 'Surgery', amountBDT: 100000, status: 'pending' },
      { id: 2, title: 'ICU Post-Op', amountBDT: 100000, status: 'pending' }
    ],
    reviews: { firstReview: null, seniorReview: null }
  };

  let campaignAfterFirstReview;

  await assertAsync('First-eye medical review sets status to medical_verified', async () => {
    campaignAfterFirstReview = await reviewFundraiserHandler({
      campaign: sampleCampaign,
      reviewerUid: 'reviewer_doc_1',
      reviewerRole: 'fundraiser_reviewer',
      reviewStep: 'first_review',
      decision: 'approve',
      notes: 'Doctor BMDC and hospital estimate confirmed'
    });

    if (campaignAfterFirstReview.status !== 'medical_verified') {
      throw new Error(`Expected medical_verified status, got ${campaignAfterFirstReview.status}`);
    }
  });

  await assertAsync('Four-eyes rule blocks same reviewer from performing senior review', async () => {
    let blocked = false;
    try {
      await reviewFundraiserHandler({
        campaign: campaignAfterFirstReview,
        reviewerUid: 'reviewer_doc_1', // SAME REVIEWER!
        reviewerRole: 'senior_reviewer',
        reviewStep: 'senior_review',
        decision: 'approve'
      });
    } catch (err) {
      blocked = true;
      if (!err.message.includes('second-eye approval MUST be performed by a different reviewer')) {
        throw new Error(`Unexpected error message: ${err.message}`);
      }
    }
    if (!blocked) throw new Error('Same reviewer was able to perform second eye approval!');
  });

  let activeCampaign;

  await assertAsync('Second-eye approval by different senior reviewer activates campaign', async () => {
    activeCampaign = await reviewFundraiserHandler({
      campaign: campaignAfterFirstReview,
      reviewerUid: 'senior_reviewer_finance_2', // DIFFERENT REVIEWER!
      reviewerRole: 'senior_reviewer',
      reviewStep: 'senior_review',
      decision: 'approve',
      notes: 'Beneficiary bank details and budget verified'
    });

    if (activeCampaign.status !== 'active') {
      throw new Error(`Expected active status, got ${activeCampaign.status}`);
    }
  });

  // 4. Donations & Milestone Payouts with Ledger Balancing
  const testLedgerStore = [];

  await assertAsync('recordFundraiserDonation credits escrow and increments raisedAmountBDT', async () => {
    const res1 = await recordFundraiserDonation({
      campaign: activeCampaign,
      amountBDT: 70000,
      donorUid: 'donor_01',
      donorName: 'Sadia Rahman',
      ledgerStore: testLedgerStore
    });

    activeCampaign = res1.campaign;
    if (activeCampaign.raisedAmountBDT !== 70000 || activeCampaign.donorsCount !== 1) {
      throw new Error('Campaign raised amount or donor count failed to update');
    }

    const currentEscrow = DoubleEntryLedger.computeEscrowBalance(testLedgerStore, activeCampaign.campaignId);
    if (currentEscrow !== 70000) {
      throw new Error(`Expected ৳70,000 in escrow, got ৳${currentEscrow}`);
    }
  });

  await assertAsync('approveMilestonePayoutHandler prevents overdraw when requested > escrow', async () => {
    let overdrawBlocked = false;
    try {
      // Milestone 1 requires ৳100,000, but escrow currently only has ৳70,000
      await approveMilestonePayoutHandler({
        campaign: activeCampaign,
        milestoneIndex: 0,
        adminUid: 'admin_fin_1',
        ledgerStore: testLedgerStore
      });
    } catch (err) {
      overdrawBlocked = true;
      if (!err.message.includes('Insufficient escrow funds')) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
    if (!overdrawBlocked) throw new Error('Overdraw payout was unexpectedly permitted!');
  });

  await assertAsync('approveMilestonePayoutHandler disburses milestone when escrow is sufficient', async () => {
    // Add additional donation of ৳50,000 -> Total escrow becomes ৳120,000
    const res2 = await recordFundraiserDonation({
      campaign: activeCampaign,
      amountBDT: 50000,
      donorUid: 'donor_02',
      donorName: 'Anonymous Donor',
      ledgerStore: testLedgerStore
    });
    activeCampaign = res2.campaign;

    // Disburse Milestone 1 (৳100,000)
    const payoutRes = await approveMilestonePayoutHandler({
      campaign: activeCampaign,
      milestoneIndex: 0,
      adminUid: 'admin_fin_1',
      ledgerStore: testLedgerStore
    });

    activeCampaign = payoutRes.campaign;
    if (activeCampaign.milestones[0].status !== 'disbursed') {
      throw new Error('Milestone 0 status failed to update to disbursed');
    }

    // Remaining escrow must now be ৳120,000 - ৳100,000 = ৳20,000
    const remainingEscrow = DoubleEntryLedger.computeEscrowBalance(testLedgerStore, activeCampaign.campaignId);
    if (remainingEscrow !== 20000) {
      throw new Error(`Expected remaining escrow ৳20,000, got ৳${remainingEscrow}`);
    }
  });

  // 10. Automated Fraud Signal Detection
  assert('analyzeFundraiserFraudSignals detects duplicate document hashes and flags risk', () => {
    const existing = [
      {
        campaignId: 'fund_prior_01',
        patientName: 'Kazi Nazrul',
        documentHashes: ['hash_doc_alpha_123', 'hash_doc_beta_456']
      }
    ];

    const suspectApp = {
      campaignId: 'fund_new_02',
      patientName: 'Different Name',
      documentHashes: ['hash_doc_alpha_123'], // Recycled hospital certificate!
      targetAmountBDT: 200000
    };

    const analysis = analyzeFundraiserFraudSignals(suspectApp, existing);
    if (!analysis.flags.some(f => f.code === 'DUPLICATE_DOCUMENT_HASH')) {
      throw new Error('Failed to flag duplicate document hash');
    }
    if (analysis.riskScore < 40) {
      throw new Error('Risk score too low for duplicate document');
    }
  });

  assert('analyzeFundraiserFraudSignals blocks campaigns with reused payout bank accounts', () => {
    const existing = [
      {
        campaignId: 'fund_prior_01',
        patientName: 'Patient Alice',
        payoutAccount: { accountNumber: '1234567890' }
      }
    ];

    const suspiciousApp = {
      campaignId: 'fund_fraud_99',
      patientName: 'Patient Bob', // Different patient reusing same bank account!
      payoutAccount: { accountNumber: '1234567890' },
      documentHashes: ['unique_hash_xyz'],
      documents: [{ fileName: 'estimate.pdf', sizeBytes: 1200 }], // Also tiny PDF!
      targetAmountBDT: 300000
    };

    const analysis = analyzeFundraiserFraudSignals(suspiciousApp, existing);
    if (!analysis.flags.some(f => f.code === 'REUSED_PAYOUT_ACCOUNT')) {
      throw new Error('Failed to flag reused payout bank account');
    }
    if (!analysis.flags.some(f => f.code === 'PDF_SIZE_ANOMALY')) {
      throw new Error('Failed to flag PDF size anomaly');
    }
  });

  return results;
}
