/**
 * @file referral.js
 * @description Non-cash referral program: Invite donors, track signups, earn community hero badges.
 */

import { toast } from '../../core/toast.js';

export class ReferralView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.inviteCode = 'HERO-RAFI-BD';
    this.referralStats = {
      invitedCount: 8,
      verifiedDonors: 5,
      impactLivesSaved: 15
    };
  }

  render() {
    if (!this.container) return;

    const inviteUrl = `https://roktosetu.org/#/register?ref=${this.inviteCode}`;

    this.container.innerHTML = `
      <div class="container" style="max-width:760px; padding:var(--space-8) var(--space-4);">
        <div class="card" style="margin-bottom:var(--space-6); text-align:center;">
          <div style="font-size:40px; margin-bottom:8px;">🤝</div>
          <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-bottom:6px;">Invite Friends & Multiply Lifesavers</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); max-width:540px; margin:0 auto var(--space-6); line-height:1.6;">
            Every friend you bring into the RoktoSetu network expands our emergency coverage. Blood is never sold or paid for — our referral rewards are recognition badges and community honors.
          </p>

          <!-- Unique Referral Link Box -->
          <div style="background:var(--color-bg-subtle); padding:16px; border-radius:var(--radius-lg); border:1px solid var(--color-border); display:flex; gap:10px; max-width:520px; margin:0 auto var(--space-6);">
            <input type="text" class="form-input" value="${inviteUrl}" id="refLinkInput" readonly style="font-size:12px;">
            <button type="button" class="btn btn-primary btn-sm" id="btnCopyRef">Copy Link</button>
          </div>

          <!-- Impact Stats Grid -->
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:var(--space-6); border-top:1px solid var(--color-border-subtle); padding-top:var(--space-6);">
            <div>
              <div style="font-size:1.75rem; font-weight:900; color:var(--color-crimson);">${this.referralStats.invitedCount}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Friends Joined</div>
            </div>
            <div>
              <div style="font-size:1.75rem; font-weight:900; color:var(--color-teal);">${this.referralStats.verifiedDonors}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Verified Donors</div>
            </div>
            <div>
              <div style="font-size:1.75rem; font-weight:900; color:#D4AF37;">~${this.referralStats.impactLivesSaved}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">Lives Touched</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnCopyRef')?.addEventListener('click', () => {
      const input = document.getElementById('refLinkInput');
      if (input) {
        input.select();
        navigator.clipboard.writeText(input.value);
        toast.success('Referral invite link copied to clipboard!');
      }
    });
  }
}
