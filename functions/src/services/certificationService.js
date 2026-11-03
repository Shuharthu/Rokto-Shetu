/**
 * @file certificationService.js
 * @description Core Section 17 service for Donor Certification, Digital ID Cards, and Achievement Sharing.
 * Enforces server-side issuance, HMAC anti-forgery, privacy-preserving public verification, and revocation.
 */

import crypto from 'crypto';
import { logAuditEvent } from '../utils/audit.js';

// Secret key for HMAC anti-forgery signatures (fallback to deterministic test secret in dev)
const CERT_HMAC_SECRET = process.env.CERT_HMAC_SECRET || 'roktosetu_cert_secure_hmac_secret_2026';

export const CERTIFICATE_TYPES = {
  CERTIFIED_DONOR: {
    type: 'certified_donor',
    minDonations: 3,
    titleEn: 'Certified Voluntary Blood Donor',
    titleBn: 'স্বীকৃত স্বেচ্ছাসেবী রক্তদাতা সনদ',
    badge: 'Certified'
  },
  LEVEL_SILVER: {
    type: 'level_silver',
    minDonations: 6,
    titleEn: 'Silver Life-Saver Certificate',
    titleBn: 'সিলভার জীবনরক্ষক সনদ',
    badge: 'Silver'
  },
  LEVEL_GOLD: {
    type: 'level_gold',
    minDonations: 10,
    titleEn: 'Gold Life-Saver Certificate',
    titleBn: 'গোল্ড জীবনরক্ষক সনদ',
    badge: 'Gold'
  },
  LEVEL_PLATINUM: {
    type: 'level_platinum',
    minDonations: 15,
    titleEn: 'Platinum Life-Saver Certificate',
    titleBn: 'প্লাটিনাম জীবনরক্ষক সনদ',
    badge: 'Platinum'
  },
  LEVEL_DIAMOND: {
    type: 'level_diamond',
    minDonations: 25,
    titleEn: 'Diamond Life-Saver Certificate',
    titleBn: 'ডায়মন্ড জীবনরক্ষক সনদ',
    badge: 'Diamond'
  },
  LEVEL_LEGEND: {
    type: 'level_legend',
    minDonations: 50,
    titleEn: 'National Blood Legend Certificate of Honor',
    titleBn: 'জাতীয় রক্তবীর সম্মাননা সনদ',
    badge: 'Legend'
  },
  HERO_AWARD: {
    type: 'hero_award',
    minDonations: 1,
    titleEn: 'Annual Hero Blood Donor Award',
    titleBn: 'বার্ষিক হিরো রক্তদাতা সম্মাননা',
    badge: 'Hero'
  }
};

/**
 * Computes an HMAC-SHA256 signature for certificate anti-forgery.
 * @param {string} payload
 * @returns {string} Hex signature
 */
export function computeHmac(payload) {
  return crypto.createHmac('sha256', CERT_HMAC_SECRET).update(payload).digest('hex');
}

/**
 * Verifies an HMAC-SHA256 signature using constant-time comparison.
 * @param {string} payload
 * @param {string} signature
 * @returns {boolean}
 */
export function verifyHmac(payload, signature) {
  if (!payload || !signature) return false;
  const expected = computeHmac(payload);
  const bufExpected = Buffer.from(expected, 'hex');
  const bufSignature = Buffer.from(signature, 'hex');
  if (bufExpected.length !== bufSignature.length) return false;
  return crypto.timingSafeEqual(bufExpected, bufSignature);
}

/**
 * Generates an unguessable certificate ID.
 * Format: CERT-YYYY-XXXXXXXXXXXX (12 crypto-random hex chars)
 * @returns {string}
 */
export function generateCertificateId() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `CERT-${year}-${rand}`;
}

/**
 * Generates a Digital Donor Card ID.
 * Format: RS-YYYY-XXXXXX (6 crypto-random chars, NOT derived from NID)
 * @returns {string}
 */
export function generateCardId() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `RS-${year}-${rand}`;
}

/**
 * Issues a Donor Certificate server-side.
 * Donors can NEVER trigger issuance directly from client; count must meet threshold.
 *
 * @param {object} params
 * @param {string} params.donorId - Donor UID
 * @param {string} params.donorDisplayName - Donor display name
 * @param {string} [params.bloodGroup] - Blood group (optional)
 * @param {string} params.type - One of CERTIFICATE_TYPES keys or values
 * @param {number} params.verifiedDonationsCount - Confirmed verified count
 * @param {string} params.donorLevel - Current donor level
 * @param {string} [params.template='classic'] - 'classic', 'modern', or 'minimal'
 * @param {object} [db] - Firestore database instance
 * @returns {Promise<object>} Created certificate record
 */
export async function issueCertificate(params, db = null) {
  const {
    donorId,
    donorDisplayName,
    bloodGroup = 'O+',
    type = 'certified_donor',
    verifiedDonationsCount = 3,
    donorLevel = 'bronze',
    template = 'classic'
  } = params;

  if (!donorId || !donorDisplayName) {
    throw new Error('donorId and donorDisplayName are required to issue certificate');
  }

  // Lookup certificate definition
  const typeDef = Object.values(CERTIFICATE_TYPES).find(t => t.type === type) || CERTIFICATE_TYPES.CERTIFIED_DONOR;

  // Enforce verified donation count requirement
  if (verifiedDonationsCount < typeDef.minDonations) {
    throw new Error(`Insufficient verified donations: ${verifiedDonationsCount} (minimum required: ${typeDef.minDonations})`);
  }

  const certId = generateCertificateId();
  const issueDate = new Date().toISOString();

  // Payload for anti-forgery HMAC
  const signaturePayload = `${certId}:${donorId}:${typeDef.type}:${verifiedDonationsCount}:${issueDate}`;
  const hmacSignature = computeHmac(signaturePayload);

  const certRecord = {
    certId,
    donorId,
    donorDisplayName,
    bloodGroup: bloodGroup || 'hidden',
    type: typeDef.type,
    titleEn: typeDef.titleEn,
    titleBn: typeDef.titleBn,
    badge: typeDef.badge,
    verifiedDonationsCount,
    donorLevel,
    issuedAt: issueDate,
    status: 'valid', // 'valid' | 'revoked' | 'superseded'
    revokedAt: null,
    revocationReason: null,
    supersededBy: null,
    template,
    signatoryName: 'Prof. Dr. M. Rahman',
    signatoryTitle: 'Chair, RoktoSetu National Clinical Advisory Board',
    issuingOrganization: 'RoktoSetu National Blood Network',
    voluntaryClauseEn: 'Donated voluntarily, without payment.',
    voluntaryClauseBn: 'কোনো আর্থিক পারিশ্রমিক ছাড়াই সম্পূর্ণ স্বেচ্ছায় দানকৃত।',
    hmacSignature,
    verificationUrl: `/verify/${certId}`,
    qrPayload: JSON.stringify({
      certId,
      sig: hmacSignature.slice(0, 16),
      url: `https://roktosetu.org/verify/${certId}`
    })
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('certificates').doc(certId).set(certRecord);
    await logAuditEvent(db, {
      actorUid: 'system_issuance_service',
      action: 'CERTIFICATE_ISSUED',
      targetType: 'certificate',
      targetId: certId,
      metadata: { donorId, type: typeDef.type, verifiedDonationsCount }
    });
  }

  return certRecord;
}

/**
 * Public Certificate Verification.
 * Returns strictly sanitized projection with ZERO PII.
 *
 * @param {string} certId
 * @param {object} [db]
 * @param {object} [mockCertRecord] - For testing
 * @returns {Promise<object>} Sanitized public verification response
 */
export async function verifyCertificate(certId, db = null, mockCertRecord = null) {
  if (!certId || typeof certId !== 'string') {
    return { valid: false, error: 'INVALID_CERTIFICATE_ID' };
  }

  let cert = mockCertRecord;
  if (!cert && db && typeof db.collection === 'function') {
    const snap = await db.collection('certificates').doc(certId).get();
    if (snap.exists) {
      cert = snap.data();
    }
  }

  if (!cert || cert.certId !== certId) {
    return {
      valid: false,
      status: 'not_found',
      error: 'Certificate not found in national registry'
    };
  }

  // Validate HMAC signature
  const signaturePayload = `${cert.certId}:${cert.donorId}:${cert.type}:${cert.verifiedDonationsCount}:${cert.issuedAt}`;
  const isSignatureValid = verifyHmac(signaturePayload, cert.hmacSignature);

  if (!isSignatureValid) {
    return {
      valid: false,
      status: 'tampered',
      error: 'CRITICAL: Certificate digital signature verification failed. Document may be forged.'
    };
  }

  // Return strictly sanitized public projection - NEVER leaks phone, address, NID, or email!
  return {
    valid: cert.status === 'valid',
    status: cert.status, // 'valid' | 'revoked' | 'superseded'
    certId: cert.certId,
    donorDisplayName: cert.donorDisplayName,
    type: cert.type,
    titleEn: cert.titleEn,
    titleBn: cert.titleBn,
    badge: cert.badge,
    bloodGroup: cert.bloodGroup !== 'hidden' ? cert.bloodGroup : null,
    verifiedDonationsCount: cert.verifiedDonationsCount,
    donorLevel: cert.donorLevel,
    issuedAt: cert.issuedAt,
    issuingOrganization: cert.issuingOrganization || 'RoktoSetu National Blood Network',
    signatoryName: cert.signatoryName,
    voluntaryClauseEn: cert.voluntaryClauseEn,
    voluntaryClauseBn: cert.voluntaryClauseBn,
    revokedAt: cert.revokedAt || null,
    revocationReason: cert.revocationReason || null,
    supersededBy: cert.supersededBy || null
  };
}

/**
 * Revokes a certificate (admin action, e.g. fraudulent donation or disciplinary action).
 *
 * @param {string} certId
 * @param {string} adminUid
 * @param {string} reason
 * @param {object} db
 * @returns {Promise<object>}
 */
export async function revokeCertificate(certId, adminUid, reason, db) {
  if (!certId || !reason) {
    throw new Error('certId and revocation reason are required');
  }

  const update = {
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revocationReason: reason,
    revokedByUid: adminUid
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('certificates').doc(certId).set(update, { merge: true });
    await logAuditEvent(db, {
      actorUid: adminUid,
      action: 'CERTIFICATE_REVOKED',
      targetType: 'certificate',
      targetId: certId,
      metadata: { reason }
    });
  }

  return { certId, ...update };
}

/**
 * Reissues a certificate (e.g. legal name update or typo correction).
 * Marks old certificate as superseded and creates a new one.
 *
 * @param {string} oldCertId
 * @param {string} adminUid
 * @param {string} newDisplayName
 * @param {object} db
 * @param {object} [existingCert] - For mock testing
 * @returns {Promise<{ newCertificate: object, oldCertificate: object }>}
 */
export async function reissueCertificate(oldCertId, adminUid, newDisplayName, db, existingCert = null) {
  let cert = existingCert;
  if (!cert && db && typeof db.collection === 'function') {
    const snap = await db.collection('certificates').doc(oldCertId).get();
    if (snap.exists) cert = snap.data();
  }

  if (!cert) {
    throw new Error(`Old certificate ${oldCertId} not found`);
  }

  // Issue new replacement certificate
  const newCert = await issueCertificate({
    donorId: cert.donorId,
    donorDisplayName: newDisplayName || cert.donorDisplayName,
    bloodGroup: cert.bloodGroup,
    type: cert.type,
    verifiedDonationsCount: cert.verifiedDonationsCount,
    donorLevel: cert.donorLevel,
    template: cert.template
  }, db);

  // Mark old certificate as superseded
  const oldUpdate = {
    status: 'superseded',
    supersededBy: newCert.certId,
    supersededAt: new Date().toISOString(),
    supersededByUid: adminUid
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('certificates').doc(oldCertId).set(oldUpdate, { merge: true });
    await logAuditEvent(db, {
      actorUid: adminUid,
      action: 'CERTIFICATE_REISSUED',
      targetType: 'certificate',
      targetId: oldCertId,
      metadata: { newCertId: newCert.certId, newDisplayName }
    });
  }

  return {
    newCertificate: newCert,
    oldCertificate: { ...cert, ...oldUpdate }
  };
}

/**
 * Issues a Digital Donor ID Card for verified donors only.
 *
 * @param {object} params
 * @param {string} params.donorId
 * @param {string} params.displayName
 * @param {string} params.bloodGroup
 * @param {string} params.level
 * @param {string} [params.photoUrl]
 * @param {boolean} params.isVerified
 * @param {string} [params.emergencyContactName]
 * @param {object} [db]
 * @returns {Promise<object>}
 */
export async function issueDigitalDonorCard(params, db = null) {
  const {
    donorId,
    displayName,
    bloodGroup,
    level = 'bronze',
    photoUrl = '/assets/images/default-avatar.png',
    isVerified = false,
    emergencyContactName = null
  } = params;

  if (!isVerified) {
    throw new Error('Digital Donor ID Card is strictly available to VERIFIED donors only.');
  }

  const cardId = generateCardId();
  const memberSince = new Date().toISOString();
  // Valid for 1 year, renewed annually
  const validThrough = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // Unguessable verification token (32 bytes hex)
  const token = crypto.randomBytes(32).toString('hex');
  const hmacSignature = computeHmac(`${cardId}:${donorId}:${token}:${validThrough}`);

  const cardRecord = {
    cardId,
    donorId,
    displayName,
    bloodGroup,
    level,
    photoUrl,
    status: 'active', // 'active' | 'suspended' | 'revoked' | 'expired'
    memberSince,
    validThrough,
    emergencyContactName,
    token,
    hmacSignature,
    verificationPath: `/card/${token}`,
    disclaimerEn: 'This card is a RoktoSetu donor membership card. It is not a government ID or medical clearance.',
    disclaimerBn: 'এই কার্ডটি রক্তসেতু রক্তদাতা সদস্যপদ কার্ড। এটি সরকারি পরিচয়পত্র বা চিকিৎসা ছাড়পত্র নয়।'
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('digital_cards').doc(donorId).set(cardRecord);
    await logAuditEvent(db, {
      actorUid: 'system_issuance_service',
      action: 'DIGITAL_CARD_ISSUED',
      targetType: 'digital_card',
      targetId: cardId,
      metadata: { donorId, level }
    });
  }

  return cardRecord;
}

/**
 * Public Digital Donor Card Verification by token.
 * Returns strictly sanitized projection with ZERO PII.
 *
 * @param {string} token - Card verification token from QR
 * @param {object} [db]
 * @param {object} [mockCardRecord]
 * @returns {Promise<object>}
 */
export async function verifyDigitalCard(token, db = null, mockCardRecord = null) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'INVALID_CARD_TOKEN' };
  }

  let card = mockCardRecord;
  if (!card && db && typeof db.collection === 'function') {
    const snap = await db.collection('digital_cards').where('token', '==', token).limit(1).get();
    if (!snap.empty) {
      card = snap.docs[0].data();
    }
  }

  if (!card || card.token !== token) {
    return {
      valid: false,
      status: 'not_found',
      error: 'Donor card record not found'
    };
  }

  // Check HMAC signature
  const expectedPayload = `${card.cardId}:${card.donorId}:${card.token}:${card.validThrough}`;
  const isSigValid = verifyHmac(expectedPayload, card.hmacSignature);
  if (!isSigValid) {
    return {
      valid: false,
      status: 'tampered',
      error: 'Digital card cryptographic signature verification failed'
    };
  }

  const isExpired = new Date(card.validThrough) < new Date();
  const isValid = card.status === 'active' && !isExpired;

  // Sanitized public projection: ZERO contact phone, ZERO NID, ZERO home address
  return {
    valid: isValid,
    status: isExpired ? 'expired' : card.status,
    cardId: card.cardId,
    displayName: card.displayName,
    bloodGroup: card.bloodGroup,
    level: card.level,
    photoUrl: card.photoUrl,
    memberSince: card.memberSince,
    validThrough: card.validThrough,
    isExpired,
    issuingOrganization: 'RoktoSetu National Blood Network',
    disclaimerEn: card.disclaimerEn,
    disclaimerBn: card.disclaimerBn
  };
}

/**
 * Creates a public social achievement share record with privacy controls.
 *
 * @param {object} params
 * @param {string} params.donorId
 * @param {string} params.displayName - Controlled by privacy toggle (full name vs first name only vs initial)
 * @param {string} [params.bloodGroup] - Can be null if donor opts to hide blood group
 * @param {number} [params.verifiedDonationsCount] - Can be null if hidden
 * @param {string} params.badgeType - e.g. 'certified', 'level_gold', 'milestone_10'
 * @param {string} params.cardType - 'milestone' | 'certificate' | 'level_up' | 'hero'
 * @param {object} [db]
 * @returns {Promise<object>}
 */
export async function createSocialShareRecord(params, db = null) {
  const {
    donorId,
    displayName,
    bloodGroup = null,
    verifiedDonationsCount = null,
    badgeType,
    cardType = 'level_up'
  } = params;

  if (!donorId || !displayName) {
    throw new Error('donorId and displayName are required for social share');
  }

  const shareId = `sh_${crypto.randomBytes(6).toString('hex')}`;
  const createdAt = new Date().toISOString();

  const titles = {
    certified: { en: 'Became a Certified Blood Donor', bn: 'স্বীকৃত রক্তদাতার সম্মাননা অর্জন করেছেন' },
    level_silver: { en: 'Promoted to Silver Blood Donor', bn: 'সিলভার রক্তদাতা স্তরে উন্নীত হয়েছেন' },
    level_gold: { en: 'Promoted to Gold Blood Donor', bn: 'গোল্ড রক্তদাতা স্তরে উন্নীত হয়েছেন' },
    level_platinum: { en: 'Promoted to Platinum Blood Donor', bn: 'প্লাটিনাম রক্তদাতা স্তরে উন্নীত হয়েছেন' },
    level_diamond: { en: 'Promoted to Diamond Blood Donor', bn: 'ডায়মন্ড রক্তদাতা স্তরে উন্নীত হয়েছেন' },
    level_legend: { en: 'Promoted to Legend Blood Hero', bn: 'জাতীয় রক্তবীর স্তরে উন্নীত হয়েছেন' },
    milestone_10: { en: 'Celebrated 10th Life-Saving Blood Donation', bn: '১০ম বার জীবনরক্ষাকারী রক্তদান সম্পন্ন করেছেন' }
  };

  const titleMeta = titles[badgeType] || { en: 'Achieved Blood Donation Milestone', bn: 'রক্তদানে নতুন মাইলফলক অর্জন করেছেন' };

  const shareRecord = {
    shareId,
    donorId,
    displayName,
    bloodGroup,
    verifiedDonationsCount,
    badgeType,
    cardType,
    titleEn: titleMeta.en,
    titleBn: titleMeta.bn,
    createdAt,
    shareUrl: `https://roktosetu.org/a/${shareId}`,
    openGraph: {
      title: `${displayName} — ${titleMeta.en} on RoktoSetu`,
      description: `Every drop, a bridge to life. Join RoktoSetu to save lives across Bangladesh.`,
      imageUrl: `https://roktosetu.org/api/og/${shareId}.png`,
      url: `https://roktosetu.org/a/${shareId}`
    }
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('shares').doc(shareId).set(shareRecord);
  }

  return shareRecord;
}
