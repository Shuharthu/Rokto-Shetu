/**
 * @file section17.test.js
 * @description Automated Unit Tests for Section 17: Donor Certification, Digital ID Card & Achievement Sharing.
 */

import {
  issueCertificate,
  verifyCertificate,
  revokeCertificate,
  reissueCertificate,
  issueDigitalDonorCard,
  verifyDigitalCard,
  createSocialShareRecord,
  computeHmac
} from '../../functions/src/services/certificationService.js';

export async function runSection17Tests() {
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

  // 1. Certification Threshold Enforcement
  await assertAsync('Certificate issuance rejects donors with fewer than 3 verified donations', async () => {
    try {
      await issueCertificate({
        donorId: 'donor_unmet',
        donorDisplayName: 'Imran K.',
        bloodGroup: 'B+',
        type: 'certified_donor',
        verifiedDonationsCount: 2 // Less than minimum 3!
      });
      throw new Error('Should have thrown an error for insufficient donations');
    } catch (err) {
      if (!err.message.includes('Insufficient verified donations')) {
        throw err;
      }
    }
  });

  // 2. Automatic Issuance on 3rd Verified Donation
  let issuedCert = null;
  await assertAsync('Issues "Certified Blood Donor" certificate when verified count reaches 3', async () => {
    issuedCert = await issueCertificate({
      donorId: 'donor_hero_123',
      donorDisplayName: 'Rafi S.',
      bloodGroup: 'B+',
      type: 'certified_donor',
      verifiedDonationsCount: 3,
      donorLevel: 'bronze',
      template: 'classic'
    });

    if (!issuedCert.certId || !issuedCert.certId.startsWith('CERT-')) {
      throw new Error(`Invalid certificate ID format: ${issuedCert.certId}`);
    }
    if (!issuedCert.hmacSignature) {
      throw new Error('Missing anti-forgery HMAC signature');
    }
    if (issuedCert.status !== 'valid') {
      throw new Error(`Expected status valid, got ${issuedCert.status}`);
    }
  });

  // 3. Privacy-Preserving Public Certificate Verification
  await assertAsync('Public certificate verification returns valid projection without leaking PII', async () => {
    const verified = await verifyCertificate(issuedCert.certId, null, issuedCert);

    if (!verified.valid || verified.status !== 'valid') {
      throw new Error('Valid certificate failed verification');
    }
    if (verified.donorDisplayName !== 'Rafi S.') {
      throw new Error('Mismatch in donor display name');
    }

    // Critical Privacy checks
    if (verified.phone || verified.contactPhone || verified.nid || verified.address || verified.email) {
      throw new Error('CRITICAL PRIVACY VIOLATION: PII leaked in public certificate verification response!');
    }
  });

  // 4. Anti-forgery HMAC Tamper Detection
  await assertAsync('Detects tampered certificate payload and rejects signature', async () => {
    const tampered = { ...issuedCert, verifiedDonationsCount: 50 }; // Faked count!
    const verified = await verifyCertificate(tampered.certId, null, tampered);

    if (verified.valid || verified.status !== 'tampered') {
      throw new Error('Failed to catch forged/tampered certificate data');
    }
  });

  // 5. Revocation of Certificate
  await assertAsync('Admin can revoke certificate and public verification reflects revocation', async () => {
    const revoked = await revokeCertificate(issuedCert.certId, 'admin_super', 'Fraudulent donation audit', null);
    if (revoked.status !== 'revoked' || !revoked.revokedAt) {
      throw new Error('Failed to set revocation metadata');
    }

    const updatedCert = { ...issuedCert, ...revoked };
    const verified = await verifyCertificate(updatedCert.certId, null, updatedCert);

    if (verified.valid !== false || verified.status !== 'revoked') {
      throw new Error('Revoked certificate should return valid: false and status: revoked');
    }
  });

  // 6. Reissuing Certificate (Superseding Old)
  await assertAsync('Reissuing certificate supersedes old ID and creates new valid certificate', async () => {
    const res = await reissueCertificate(issuedCert.certId, 'admin_super', 'Rafi Siddiqui (Updated)', null, issuedCert);

    if (res.oldCertificate.status !== 'superseded') {
      throw new Error('Old certificate was not marked as superseded');
    }
    if (res.oldCertificate.supersededBy !== res.newCertificate.certId) {
      throw new Error('Old certificate does not reference new certificate ID');
    }
    if (res.newCertificate.certId === issuedCert.certId) {
      throw new Error('New certificate must have a distinct random ID');
    }
    if (res.newCertificate.donorDisplayName !== 'Rafi Siddiqui (Updated)') {
      throw new Error('New certificate did not apply updated display name');
    }
  });

  // 7. Digital Donor ID Card Gating: Verified Donors Only
  await assertAsync('Digital ID Card issuance is blocked for unverified donors', async () => {
    try {
      await issueDigitalDonorCard({
        donorId: 'unverified_user',
        displayName: 'Unverified John',
        bloodGroup: 'A+',
        isVerified: false // Not verified!
      });
      throw new Error('Should have blocked card issuance for unverified donor');
    } catch (err) {
      if (!err.message.includes('VERIFIED donors only')) {
        throw err;
      }
    }
  });

  // 8. Digital Donor ID Card Issuance for Verified Donors
  let issuedCard = null;
  await assertAsync('Issues Digital Donor ID Card with RS-YYYY-XXXXXX format and 1-year expiry', async () => {
    issuedCard = await issueDigitalDonorCard({
      donorId: 'donor_verified_456',
      displayName: 'Tania Ahmed',
      bloodGroup: 'AB+',
      level: 'gold',
      isVerified: true
    });

    if (!issuedCard.cardId.startsWith('RS-')) {
      throw new Error(`Invalid card ID format: ${issuedCard.cardId}`);
    }
    if (!issuedCard.token || issuedCard.token.length < 32) {
      throw new Error('Missing secure token on digital card');
    }

    // Verify 1-year expiry
    const diffDays = Math.round((new Date(issuedCard.validThrough) - new Date(issuedCard.memberSince)) / (1000 * 60 * 60 * 24));
    if (diffDays < 360 || diffDays > 370) {
      throw new Error(`Expected 1 year validity, got ${diffDays} days`);
    }
  });

  // 9. Digital Card Public Verification
  await assertAsync('Verifies Digital Card via token without exposing donor contact or NID', async () => {
    const verified = await verifyDigitalCard(issuedCard.token, null, issuedCard);

    if (!verified.valid || verified.status !== 'active') {
      throw new Error('Valid card failed token verification');
    }
    if (verified.displayName !== 'Tania Ahmed' || verified.bloodGroup !== 'AB+') {
      throw new Error('Card projection mismatch');
    }

    // Critical Privacy checks
    if (verified.phone || verified.contactPhone || verified.nid || verified.address) {
      throw new Error('CRITICAL PRIVACY VIOLATION: PII leaked in digital card public verification response!');
    }
  });

  // 10. Social Achievement Share Card Generation & Privacy Toggles
  await assertAsync('Generates social achievement share record respecting donor privacy controls', async () => {
    const share = await createSocialShareRecord({
      donorId: 'donor_hero_123',
      displayName: 'Rafi S.', // Custom privacy display
      bloodGroup: null, // Donor opted to hide blood group
      verifiedDonationsCount: 10,
      badgeType: 'level_gold',
      cardType: 'level_up'
    });

    if (!share.shareId || !share.shareId.startsWith('sh_')) {
      throw new Error(`Invalid share ID: ${share.shareId}`);
    }
    if (share.bloodGroup !== null) {
      throw new Error('Expected blood group to remain hidden per donor toggle');
    }
    if (!share.openGraph || !share.openGraph.title.includes('Rafi S.')) {
      throw new Error('OpenGraph title missing donor privacy display name');
    }
  });

  return results;
}
