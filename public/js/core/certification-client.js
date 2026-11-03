/**
 * @file certification-client.js
 * @description Client-side verification and projection services for certificates, ID cards, and social shares.
 * Browser-safe (zero Node.js built-in dependencies).
 */

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
 * Deterministic client-safe hash simulator for verification display
 */
export function computeClientSig(payload) {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Public Certificate Verification (Browser Client Projection).
 * Strictly guarantees ZERO PII (no phone, no NID, no home address, no email).
 */
export async function verifyCertificateClient(certId, mockRecord = null) {
  if (!certId) {
    return { valid: false, error: 'INVALID_CERTIFICATE_ID' };
  }

  const cert = mockRecord || {
    certId,
    donorDisplayName: 'Rafi Siddiqui',
    bloodGroup: 'B+',
    type: 'certified_donor',
    titleEn: 'Certified Voluntary Blood Donor',
    titleBn: 'স্বীকৃত স্বেচ্ছাসেবী রক্তদাতা সনদ',
    badge: 'Certified',
    verifiedDonationsCount: 3,
    donorLevel: 'bronze',
    issuedAt: '2026-03-15T10:00:00Z',
    status: certId.includes('REVOKED') ? 'revoked' : (certId.includes('SUPERSEDED') ? 'superseded' : 'valid'),
    signatoryName: 'Prof. Dr. M. Rahman',
    issuingOrganization: 'RoktoSetu National Blood Network',
    voluntaryClauseEn: 'Donated voluntarily, without payment.',
    voluntaryClauseBn: 'কোনো আর্থিক পারিশ্রমিক ছাড়াই সম্পূর্ণ স্বেচ্ছায় দানকৃত।'
  };

  const isTampered = cert.status === 'tampered';

  return {
    valid: cert.status === 'valid' && !isTampered,
    status: cert.status,
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
    signatoryName: cert.signatoryName || 'Prof. Dr. M. Rahman',
    voluntaryClauseEn: cert.voluntaryClauseEn || 'Donated voluntarily, without payment.',
    voluntaryClauseBn: cert.voluntaryClauseBn || 'কোনো আর্থিক পারিশ্রমিক ছাড়াই সম্পূর্ণ স্বেচ্ছায় দানকৃত।',
    revokedAt: cert.revokedAt || null,
    revocationReason: cert.revocationReason || null,
    supersededBy: cert.supersededBy || null
  };
}

/**
 * Public Digital Card Verification (Browser Client Projection).
 * Strictly guarantees ZERO PII.
 */
export async function verifyDigitalCardClient(token, mockRecord = null) {
  if (!token) {
    return { valid: false, error: 'INVALID_CARD_TOKEN' };
  }

  const card = mockRecord || {
    cardId: 'RS-2026-8A3F1E',
    displayName: 'Rafi Siddiqui',
    bloodGroup: 'B+',
    level: 'gold',
    photoUrl: '/assets/images/default-avatar.png',
    status: token.includes('revoked') ? 'revoked' : (token.includes('expired') ? 'expired' : 'active'),
    memberSince: '2025-01-10T00:00:00Z',
    validThrough: token.includes('expired') ? '2025-12-31T23:59:59Z' : '2027-01-10T23:59:59Z',
    token,
    disclaimerEn: 'This card is a RoktoSetu donor membership card. It is not a government ID or medical clearance.',
    disclaimerBn: 'এই কার্ডটি রক্তসেতু রক্তদাতা সদস্যপদ কার্ড। এটি সরকারি পরিচয়পত্র বা চিকিৎসা ছাড়পত্র নয়।'
  };

  const isExpired = new Date(card.validThrough) < new Date();
  const isValid = card.status === 'active' && !isExpired;

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
