/**
 * @file rewards-view.js
 * @description Donor Rewards Catalog, Partner Perks, and Single-Use Coupon Redemption.
 */

import { toast } from '../../core/toast.js';

export class RewardsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.pointsBalance = 1200; // 100 points per donation x 12
    this.claimedCoupons = [
      {
        id: 1,
        partner: 'Popular Diagnostic Centre',
        offer: '25% Discount on Complete Blood Count (CBC) & Pathology',
        code: 'RS-POP-8492-X1',
        expiry: '31 Dec 2026'
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);">
        <!-- Top Points Header -->
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:var(--space-8); background:linear-gradient(135deg, var(--color-bg-surface-elevated) 0%, var(--color-bg-subtle) 100%);">
          <div>
            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Donor Impact Points</div>
            <div style="font-size:var(--font-size-3xl); font-weight:900; color:#D4AF37; margin-top:2px;">
              ${this.pointsBalance} <span style="font-size:var(--font-size-base); color:var(--color-text-primary);">PTS</span>
            </div>
            <div style="font-size:11px; color:var(--color-text-muted);">Earn 100 points per verified donation. Non-monetary healthcare perks only.</div>
          </div>

          <div style="display:flex; gap:10px;">
            <a href="#/donor/profile" class="btn btn-outline btn-sm">View Levels</a>
            <a href="#/certificate" class="btn btn-primary btn-sm">Download Certificate</a>
          </div>
        </div>

        <!-- Claimed Coupons Section -->
        <h2 style="font-size:var(--font-size-xl); font-weight:800; margin-bottom:var(--space-4);">My Active Partner Coupons</h2>
        <div style="margin-bottom:var(--space-8);">
          ${this.claimedCoupons.map(c => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-left:4px solid var(--color-teal); margin-bottom:var(--space-3);">
              <div>
                <span class="badge badge-available" style="font-size:10px; margin-bottom:4px;">${c.partner}</span>
                <div style="font-weight:700; font-size:var(--font-size-sm);">${c.offer}</div>
                <div style="font-size:11px; color:var(--color-text-muted);">Valid until ${c.expiry} • Single-use only</div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <code style="background:var(--color-bg-app); border:1px solid var(--color-border); padding:6px 12px; border-radius:6px; font-weight:800; font-size:13px; letter-spacing:1px; color:var(--color-crimson);">${c.code}</code>
                <button type="button" class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${c.code}'); alert('Coupon code copied to clipboard!')">Copy</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Available Rewards Catalog -->
        <h2 style="font-size:var(--font-size-xl); font-weight:800; margin-bottom:var(--space-4);">Redeem Partner Perks</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:var(--space-4);">
          <!-- Reward Item 1 -->
          <div class="card">
            <span class="badge" style="background:#FFF3CD; color:#856404; font-size:10px; margin-bottom:8px;">Healthcare Partner</span>
            <h3 style="font-size:var(--font-size-base); font-weight:700;">Ibn Sina Diagnostic Centre</h3>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:6px 0 12px;">30% Off on Full Executive Health Screening & Lipid Profile.</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:800; color:#D4AF37;">300 PTS</span>
              <button type="button" class="btn btn-primary btn-sm btn-claim" data-cost="300" data-partner="Ibn Sina">Redeem Coupon</button>
            </div>
          </div>

          <!-- Reward Item 2 -->
          <div class="card">
            <span class="badge" style="background:#E0F2FE; color:#0369A1; font-size:10px; margin-bottom:8px;">Vision Care</span>
            <h3 style="font-size:var(--font-size-base); font-weight:700;">Lions Eye Hospital & Optics</h3>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:6px 0 12px;">Complimentary Comprehensive Eye Exam + 20% Off Prescription Lenses.</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:800; color:#D4AF37;">200 PTS</span>
              <button type="button" class="btn btn-primary btn-sm btn-claim" data-cost="200" data-partner="Lions Eye">Redeem Coupon</button>
            </div>
          </div>

          <!-- Reward Item 3 -->
          <div class="card">
            <span class="badge" style="background:#DCFCE7; color:#15803D; font-size:10px; margin-bottom:8px;">Pharmacy</span>
            <h3 style="font-size:var(--font-size-base); font-weight:700;">Lazz Pharma</h3>
            <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin:6px 0 12px;">10% Discount on Vitamin Supplements & First-Aid Healthcare essentials.</p>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:800; color:#D4AF37;">150 PTS</span>
              <button type="button" class="btn btn-primary btn-sm btn-claim" data-cost="150" data-partner="Lazz Pharma">Redeem Coupon</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.btn-claim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cost = parseInt(e.currentTarget.dataset.cost, 10);
        const partner = e.currentTarget.dataset.partner;

        if (this.pointsBalance < cost) {
          toast.error('Insufficient impact points.');
          return;
        }

        const randomCode = 'RS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        this.pointsBalance -= cost;
        this.claimedCoupons.push({
          id: Date.now(),
          partner,
          offer: `Partner Voucher (${partner})`,
          code: randomCode,
          expiry: '31 Dec 2026'
        });

        toast.success(`Coupon for ${partner} claimed! Code: ${randomCode}`);
        this.render();
      });
    });
  }
}
