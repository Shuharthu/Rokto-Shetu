/**
 * @file ledger.js
 * @description Double-Entry Append-Only Financial Ledger for RoktoSetu Patient Fundraisers.
 * 
 * Strict Invariants:
 * 1. Debits == Credits for every transaction.
 * 2. Immutable: Entries cannot be modified or deleted.
 * 3. Asset and Liability balance preservation.
 */

import crypto from 'crypto';

export class DoubleEntryLedger {
  /**
   * Validates and creates a balanced double-entry transaction.
   * @param {object} params
   * @param {string} params.transactionId - Unique identifier
   * @param {string} params.campaignId - Associated fundraiser
   * @param {string} params.description - Transaction summary
   * @param {Array<{ account: string, type: 'DEBIT'|'CREDIT', amountBDT: number }>} params.entries
   * @param {string} params.actorUid - User or webhook initiating transaction
   * @param {object} [params.db] - Optional Firestore database
   * @returns {object} Balanced transaction record
   */
  static createTransaction({ transactionId, campaignId, description, entries, actorUid, db = null }) {
    if (!transactionId || !campaignId || !entries || !Array.isArray(entries) || entries.length < 2) {
      throw new Error('A double-entry transaction must contain a valid ID, campaign ID, and at least two entries.');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      if (typeof entry.amountBDT !== 'number' || entry.amountBDT <= 0 || !Number.isInteger(entry.amountBDT)) {
        throw new Error(`Invalid transaction amountBDT: must be a positive integer in poisha/BDT. Got: ${entry.amountBDT}`);
      }

      if (entry.type === 'DEBIT') {
        totalDebit += entry.amountBDT;
      } else if (entry.type === 'CREDIT') {
        totalCredit += entry.amountBDT;
      } else {
        throw new Error(`Invalid entry type: ${entry.type}. Must be DEBIT or CREDIT.`);
      }
    }

    if (totalDebit !== totalCredit) {
      throw new Error(`Double-entry balance mismatch! Total DEBIT (${totalDebit}) does not equal Total CREDIT (${totalCredit}).`);
    }

    const timestamp = new Date().toISOString();
    const transactionHash = crypto
      .createHash('sha256')
      .update(`${transactionId}:${campaignId}:${totalDebit}:${timestamp}`)
      .digest('hex');

    const transactionRecord = {
      transactionId,
      campaignId,
      description,
      totalAmountBDT: totalDebit,
      entries,
      actorUid,
      timestamp,
      hash: transactionHash,
      status: 'posted'
    };

    return transactionRecord;
  }

  /**
   * Helper to build a Patient Donation transaction:
   * - DEBIT: asset:mfs_clearing (bKash/Nagad received funds)
   * - CREDIT: liability:campaign_escrow:{campaignId} (Obligation to disburse for medical care)
   */
  static recordDonation({ transactionId, campaignId, amountBDT, donorUid = 'anonymous', donorName = 'Kind Supporter' }) {
    return this.createTransaction({
      transactionId,
      campaignId,
      description: `Donation of ৳${amountBDT} from ${donorName}`,
      actorUid: donorUid,
      entries: [
        {
          account: 'asset:mfs_clearing',
          type: 'DEBIT',
          amountBDT
        },
        {
          account: `liability:campaign_escrow:${campaignId}`,
          type: 'CREDIT',
          amountBDT
        }
      ]
    });
  }

  /**
   * Helper to build a Staged Milestone Payout transaction:
   * - DEBIT: liability:campaign_escrow:{campaignId} (Reduce obligation)
   * - CREDIT: asset:bank_disbursement (Funds transferred to hospital / beneficiary)
   */
  static recordMilestonePayout({ transactionId, campaignId, amountBDT, adminUid, hospitalName, milestoneNumber }) {
    return this.createTransaction({
      transactionId,
      campaignId,
      description: `Milestone #${milestoneNumber} Payout of ৳${amountBDT} to ${hospitalName}`,
      actorUid: adminUid,
      entries: [
        {
          account: `liability:campaign_escrow:${campaignId}`,
          type: 'DEBIT',
          amountBDT
        },
        {
          account: `asset:bank_disbursement`,
          type: 'CREDIT',
          amountBDT
        }
      ]
    });
  }

  /**
   * Computes the remaining escrow balance for a specific campaign from its ledger history.
   * @param {Array<object>} ledgerHistory
   * @param {string} campaignId
   * @returns {number} Available escrow balance in BDT
   */
  static computeEscrowBalance(ledgerHistory, campaignId) {
    const escrowAccount = `liability:campaign_escrow:${campaignId}`;
    let balance = 0;

    for (const tx of ledgerHistory) {
      if (tx.status !== 'posted') continue;
      for (const entry of tx.entries) {
        if (entry.account === escrowAccount) {
          if (entry.type === 'CREDIT') {
            balance += entry.amountBDT;
          } else if (entry.type === 'DEBIT') {
            balance -= entry.amountBDT;
          }
        }
      }
    }

    return balance;
  }
}
