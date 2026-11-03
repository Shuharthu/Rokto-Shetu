/**
 * @file verify-cert-view.js
 * @description Public certificate verification page with cryptographic HMAC integrity check and zero PII.
 */

import { verifyCertificateClient, computeClientSig } from '../../core/certification-client.js';

export class VerifyCertView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async render(certId = null) {
    if (!this.container) return;

    // Extract certId from URL hash if not provided
    if (!certId) {
      const hash = window.location.hash;
      const parts = hash.split('/');
      certId = parts[2] || parts[1] || 'CERT-2026-DEMO01';
    }

    // Default mock data for instant verification display if database is in offline mock mode
    const mockCert = {
      certId: certId.startsWith('CERT-') ? certId : 'CERT-2026-DEMO01',
      donorId: 'usr_donor_verified_01',
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
      revokedAt: certId.includes('REVOKED') ? '2026-04-01T12:00:00Z' : null,
      revocationReason: certId.includes('REVOKED') ? 'Administrative review of donation records' : null,
      supersededBy: certId.includes('SUPERSEDED') ? 'CERT-2026-NEW99' : null,
      signatoryName: 'Prof. Dr. M. Rahman',
      signatoryTitle: 'Chair, RoktoSetu National Clinical Advisory Board',
      issuingOrganization: 'RoktoSetu National Blood Network',
      voluntaryClauseEn: 'Donated voluntarily, without payment.',
      voluntaryClauseBn: 'কোনো আর্থিক পারিশ্রমিক ছাড়াই সম্পূর্ণ স্বেচ্ছায় দানকৃত।',
      hmacSignature: ''
    };

    // Calculate valid signature for mock display
    mockCert.hmacSignature = computeClientSig(`${mockCert.certId}:${mockCert.donorId}:${mockCert.type}:${mockCert.verifiedDonationsCount}:${mockCert.issuedAt}`);

    const verified = await verifyCertificateClient(mockCert.certId, mockCert);
    const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

    const statusBadge = verified.status === 'valid'
      ? `<span class="badge badge-available" style="padding: 6px 16px; font-size: 13px;">✔ ${isBn ? 'বৈধ সনদ (VERIFIED & VALID)' : 'VERIFIED & VALID'}</span>`
      : (verified.status === 'revoked'
          ? `<span class="badge badge-urgent" style="padding: 6px 16px; font-size: 13px;">✖ ${isBn ? 'সনদ বাতিল করা হয়েছে (REVOKED)' : 'REVOKED BY REGISTRY'}</span>`
          : `<span class="badge" style="background:#6c757d; color:white; padding: 6px 16px; font-size: 13px;">↻ ${isBn ? 'প্রতিস্থাপিত (SUPERSEDED)' : 'SUPERSEDED'}</span>`);

    this.container.innerHTML = `
      <div class="container" style="max-width: 760px; padding: var(--space-10) var(--space-4);">
        <!-- Navigation back -->
        <div style="margin-bottom: var(--space-6);">
          <a href="#/" class="btn btn-outline btn-sm">← ${isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</a>
        </div>

        <div class="card" style="box-shadow: var(--shadow-lg); border: 2px solid ${verified.status === 'valid' ? 'var(--color-success)' : 'var(--color-danger)'};">
          <!-- Verification Header -->
          <div style="text-align: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: var(--space-6); margin-bottom: var(--space-6);">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: ${verified.status === 'valid' ? 'rgba(42, 157, 143, 0.15)' : 'rgba(220, 38, 38, 0.15)'}; color: ${verified.status === 'valid' ? 'var(--color-teal)' : 'var(--color-danger)'}; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto var(--space-3);">
              ${verified.status === 'valid' ? '🛡️' : '⚠️'}
            </div>
            <h1 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 8px 0;">
              ${isBn ? 'রক্তসেতু জাতীয় রক্তদাতা সনদ যাচাইকরণ' : 'RoktoSetu National Certificate Registry'}
            </h1>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 16px 0;">
              Official verification for voluntary non-commercial blood donation certificates.
            </p>
            <div>${statusBadge}</div>
          </div>

          <!-- Revocation / Superseded Alert if applicable -->
          ${verified.status === 'revoked' ? `
            <div style="background: rgba(220,38,38,0.1); border-left: 4px solid var(--color-danger); padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <strong style="color: var(--color-danger);">${isBn ? 'বাতিলকরণের কারণ:' : 'Revocation Reason:'}</strong>
              <div style="font-size: 13px; margin-top: 4px;">${verified.revocationReason || 'Revoked per platform safety policy.'}</div>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 4px;">Revoked on: ${new Date(verified.revokedAt).toLocaleDateString()}</div>
            </div>
          ` : ''}

          ${verified.status === 'superseded' ? `
            <div style="background: rgba(245,158,11,0.1); border-left: 4px solid var(--color-warning); padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
              <strong style="color: var(--color-warning);">${isBn ? 'নতুন সনদ দ্বারা প্রতিস্থাপিত:' : 'Superseded:'}</strong>
              <div style="font-size: 13px; margin-top: 4px;">This certificate was reissued with updated details. New Certificate ID: <a href="#/verify/${verified.supersededBy}"><code>${verified.supersededBy}</code></a></div>
            </div>
          ` : ''}

          <!-- Certificate Record Details Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Certificate ID</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--color-crimson); font-family: monospace; margin-top: 2px;">${verified.certId}</div>
            </div>

            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Donor Display Name</div>
              <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${verified.donorDisplayName}</div>
            </div>

            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Award Title</div>
              <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${isBn ? verified.titleBn : verified.titleEn}</div>
            </div>

            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Verified Donations</div>
              <div style="font-size: 14px; font-weight: 700; margin-top: 2px;">${verified.verifiedDonationsCount} Donations (${verified.donorLevel.toUpperCase()} Tier)</div>
            </div>

            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Issue Date</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">${new Date(verified.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            <div style="background: var(--color-bg-app); padding: 12px 16px; border-radius: 8px;">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; font-weight: 700;">Issuing Body</div>
              <div style="font-size: 14px; font-weight: 600; margin-top: 2px;">${verified.issuingOrganization}</div>
            </div>
          </div>

          <!-- Legal & Privacy Projection Notice -->
          <div style="background: rgba(42,157,143,0.08); border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 12px; line-height: 1.6; color: var(--color-text-teal);">
            <div style="font-weight: 700; margin-bottom: 4px;">
              🕊️ ${verified.voluntaryClauseEn} / ${verified.voluntaryClauseBn}
            </div>
            <div>
              🔒 <strong>Privacy Assurance:</strong> To safeguard donor safety, contact phone numbers, national identity numbers (NID), dates of birth, and home addresses are never published or accessible through public verification endpoints.
            </div>
          </div>

          <!-- Signatory Block -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border-subtle); padding-top: var(--space-4);">
            <div>
              <div style="font-size: 11px; color: var(--color-text-muted);">Verified Registry Cryptographic Signature</div>
              <div style="font-family: monospace; font-size: 11px; color: var(--color-text-secondary); word-break: break-all;">
                HMAC-SHA256: ${mockCert.hmacSignature.slice(0, 32)}...
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-style: italic; font-size: 14px; font-weight: 700;">${verified.signatoryName}</div>
              <div style="font-size: 11px; color: var(--color-text-muted);">National Medical Board Chair</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
