/**
 * @file env.js
 * @description Secure environment variable configuration and validation for RoktoSetu Cloud Functions.
 */

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'roktosetu-dev',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'roktosetu-dev.appspot.com',
  },

  kms: {
    keyName: process.env.KMS_KEY_NAME || 'projects/roktosetu-dev/locations/asia-south1/keyRings/roktosetu-keyring/cryptoKeys/pii-encryption-key',
    fallbackSecret: process.env.KMS_FALLBACK_SECRET || 'dev_local_mock_symmetric_key_32_bytes_len!!',
  },

  limits: {
    defaultDonationGapMaleDays: parseInt(process.env.DEFAULT_DONATION_GAP_DAYS_MALE || '90', 10),
    defaultDonationGapFemaleDays: parseInt(process.env.DEFAULT_DONATION_GAP_DAYS_FEMALE || '120', 10),
    maxActiveFundraisersPerPatient: parseInt(process.env.MAX_ACTIVE_FUNDRAISERS_PER_PATIENT || '1', 10),
    maxActiveFundraisersPerApplicant: parseInt(process.env.MAX_ACTIVE_FUNDRAISERS_PER_APPLICANT || '2', 10),
    maxFundraiserDeadlineDays: parseInt(process.env.MAX_FUNDRAISER_DEADLINE_DAYS || '90', 10),
    fourEyesThresholdBDT: parseInt(process.env.FOUR_EYES_PAYOUT_THRESHOLD_BDT || '50000', 10),
  },

  security: {
    appCheckEnforced: process.env.NODE_ENV === 'production',
    rateLimitWindowMs: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 60,
  }
};
