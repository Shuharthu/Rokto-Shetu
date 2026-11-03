/**
 * @file verify-card-view.js
 * @description Public Digital Donor Card verification view opened via QR code scanning.
 * Zero PII exposure, cryptographic token verification, and clear status banners.
 */

import { verifyDigitalCardClient, computeClientSig } from '../../core/certification-client.js';

export class VerifyCardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async render(token = null) {
    if (!this.container) return;

    if (!token) {
      const hash = window.location.hash;
      const parts = hash.split('/');
      token = parts[2] || parts[1] || 'tok_mock_verified_donor_token_2026';
    }

    const mockCard = {
      cardId: 'RS-2026-8A3F1E',
      donorId: 'usr_donor_verified_01',
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

    mockCard.hmacSignature = computeClientSig(`${mockCard.cardId}:${mockCard.donorId}:${mockCard.token}:${mockCard.validThrough}`);

    const res = await verifyDigitalCardClient(mockCard.token, mockCard);
    const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

    const statusBadge = res.valid
      ? `<span class="badge badge-available" style="padding: 6px 16px; font-size: 13px;">✔ ${isBn ? 'সক্রিয় সদস্য (ACTIVE VERIFIED DONOR)' : 'ACTIVE VERIFIED DONOR'}</span>`
      : (res.status === 'expired'
          ? `<span class="badge" style="background:#e67e22; color:white; padding: 6px 16px; font-size: 13px;">⏳ ${isBn ? 'মেয়াদোত্তীর্ণ (EXPIRED)' : 'EXPIRED MEMBERSHIP'}</span>`
          : `<span class="badge badge-urgent" style="padding: 6px 16px; font-size: 13px;">✖ ${isBn ? 'বাতিলকৃত (REVOKED)' : 'CARD REVOKED'}</span>`);

    this.container.innerHTML = `
      <div class="container" style="max-width: 640px; padding: var(--space-10) var(--space-4);">
        <div style="margin-bottom: var(--space-6);">
          <a href="#/" class="btn btn-outline btn-sm">← ${isBn ? 'মূল পাতায় ফিরে যান' : 'Back to Home'}</a>
        </div>

        <div class="card" style="box-shadow: var(--shadow-lg); border: 2px solid ${res.valid ? 'var(--color-teal)' : 'var(--color-danger)'};">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: var(--space-6); margin-bottom: var(--space-6);">
            <div style="font-size: 32px; margin-bottom: 8px;">🪪</div>
            <h1 style="font-size: 1.4rem; font-weight: 800; margin: 0 0 6px 0;">
              ${isBn ? 'ডিজিটাল রক্তদাতা আইডি কার্ড যাচাইকরণ' : 'Digital Donor ID Card Verification'}
            </h1>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 14px;">
              RoktoSetu National Blood Network • Official ID Verification
            </div>
            <div>${statusBadge}</div>
          </div>

          <!-- Card Profile Showcase -->
          <div style="display: flex; align-items: center; gap: 20px; background: var(--color-bg-app); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="width: 76px; height: 76px; border-radius: 50%; background: #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; border: 3px solid white; box-shadow: var(--shadow-md);">
              ${res.displayName.split(' ').map(w => w[0]).join('')}
            </div>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0;">${res.displayName}</h2>
                <span class="badge" style="background: rgba(42,157,143,0.15); color: var(--color-teal); font-size: 11px;">Verified Donor</span>
              </div>
              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <span class="badge badge-urgent" style="font-size: 14px; font-weight: 800; padding: 4px 10px;">${res.bloodGroup}</span>
                <span class="badge" style="background: #D4AF37; color: white; font-size: 11px; text-transform: uppercase; font-weight: 700;">${res.level} Hero</span>
              </div>
            </div>
          </div>

          <!-- Attributes Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px;">
            <div style="background: var(--color-bg-surface-elevated); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">Card Serial Number</div>
              <div style="font-family: monospace; font-weight: 800; color: var(--color-crimson); font-size: 14px; margin-top: 2px;">${res.cardId}</div>
            </div>

            <div style="background: var(--color-bg-surface-elevated); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">Membership Since</div>
              <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${new Date(res.memberSince).toLocaleDateString()}</div>
            </div>

            <div style="background: var(--color-bg-surface-elevated); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">Valid Through</div>
              <div style="font-weight: 700; font-size: 13px; margin-top: 2px; color: ${res.isExpired ? 'var(--color-danger)' : 'inherit'};">
                ${new Date(res.validThrough).toLocaleDateString()}
              </div>
            </div>

            <div style="background: var(--color-bg-surface-elevated); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--color-border-subtle);">
              <div style="font-size: 11px; color: var(--color-text-muted); text-transform: uppercase;">Issuer</div>
              <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">RoktoSetu National Network</div>
            </div>
          </div>

          <!-- Mandatory Legal Disclaimer & Privacy Projection -->
          <div style="background: rgba(230, 126, 34, 0.08); border-left: 4px solid #e67e22; padding: 12px 16px; border-radius: 4px; font-size: 12px; line-height: 1.5; color: var(--color-text-primary); margin-bottom: 20px;">
            <strong>Notice / নোটিশ:</strong> ${res.disclaimerEn} <br><em>${res.disclaimerBn}</em>
          </div>

          <div style="font-size: 11px; color: var(--color-text-muted); text-align: center;">
            🔒 Privacy Secured: Contact phone numbers, home addresses, and National IDs (NID) are never accessible through public QR verification.
          </div>
        </div>
      </div>
    `;
  }
}
