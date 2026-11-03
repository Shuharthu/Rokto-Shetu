/**
 * @file payout-view.js
 * @description Patient Milestone Payout & Hospital Invoice Proof-of-Use Portal.
 */

import { toast } from '../../core/toast.js';

export class FundraiserPayoutView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.campaign = {
      id: 'fund_101',
      patientName: 'Baby Ayan Hossain',
      hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
      totalRaisedBDT: 245000,
      escrowAvailableBDT: 140000, // 245,000 raised - 105,000 disbursed
      disbursedBDT: 105000,
      milestones: [
        {
          id: 1,
          title: 'Tranche 1: Pre-Op Admission & Cardiac Catheterization',
          amountBDT: 105000,
          status: 'disbursed',
          invoiceFile: 'nicvd_admission_inv_0492.pdf',
          disbursedAt: '2026-10-28',
          txId: 'tx_pay_90812'
        },
        {
          id: 2,
          title: 'Tranche 2: Corrective Surgery & Cardiopulmonary Bypass Consumables',
          amountBDT: 140000,
          status: 'ready_to_claim', // escrow has 140k
          invoiceFile: null,
          disbursedAt: null,
          txId: null
        },
        {
          id: 3,
          title: 'Tranche 3: Post-Op Pediatric ICU Care & Medications',
          amountBDT: 105000,
          status: 'pending_funds',
          invoiceFile: null,
          disbursedAt: null,
          txId: null
        }
      ]
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:980px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/fundraisers" class="btn btn-outline" style="font-size:12px; padding:4px 8px;">← All Fundraisers</a>
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Milestone Invoices & Hospital Payouts</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Campaign: <strong>${this.campaign.patientName}</strong> &bull; Hospital: <strong>${this.campaign.hospitalName}</strong>
            </p>
          </div>
          <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:700; padding:6px 12px;">
            Audited Double-Entry Escrow
          </span>
        </div>

        <!-- Escrow Balance Metric Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-8);">
          <div class="card" style="border-left:4px solid var(--color-crimson);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Total Raised</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">৳ ${this.campaign.totalRaisedBDT.toLocaleString()}</div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">142 verified community donors</div>
          </div>

          <div class="card" style="border-left:4px solid var(--color-teal);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Available in Escrow</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-teal); margin-top:4px;">৳ ${this.campaign.escrowAvailableBDT.toLocaleString()}</div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Held in safe clearing asset account</div>
          </div>

          <div class="card" style="border-left:4px solid #3B82F6);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Disbursed to Hospital</div>
            <div style="font-size:2rem; font-weight:900; color:#3B82F6; margin-top:4px;">৳ ${this.campaign.disbursedBDT.toLocaleString()}</div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Direct bank clearance to NICVD billing</div>
          </div>
        </div>

        <!-- Staged Milestones Table -->
        <div class="card" style="margin-bottom:var(--space-8);">
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Treatment Milestones & Proof-of-Use</h2>
          
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${this.campaign.milestones.map((m, idx) => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div style="max-width:540px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge" style="font-size:11px; font-weight:800; background:var(--color-bg-surface); border:1px solid var(--color-border);">Milestone #${m.id}</span>
                    <h3 style="font-size:var(--font-size-sm); font-weight:800;">${m.title}</h3>
                  </div>
                  <div style="font-size:12px; color:var(--color-text-secondary); margin-top:6px;">
                    ${m.status === 'disbursed' ? 
                      `✓ Disbursed on ${m.disbursedAt} &bull; Invoice: <span style="color:var(--color-teal);">${m.invoiceFile}</span> &bull; Tx: <code>${m.txId}</code>` :
                      m.status === 'ready_to_claim' ?
                      `Available for claim. Attach hospital invoice to request release.` :
                      `Waiting for campaign donors to reach next target threshold.`
                    }
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:16px;">
                  <div style="text-align:right;">
                    <div style="font-size:1.25rem; font-weight:900;">৳ ${m.amountBDT.toLocaleString()}</div>
                    <span class="badge" style="font-size:10px; ${m.status === 'disbursed' ? 'background:var(--color-teal-subtle); color:var(--color-teal);' : m.status === 'ready_to_claim' ? 'background:#D8F3DC; color:#1B4332;' : 'background:var(--color-bg-surface);'}">
                      ${m.status === 'disbursed' ? 'DISBURSED' : m.status === 'ready_to_claim' ? 'READY TO CLAIM' : 'PENDING FUNDS'}
                    </span>
                  </div>

                  ${m.status === 'ready_to_claim' ? `
                    <button type="button" class="btn btn-primary btn-claim-milestone" data-id="${m.id}" style="font-size:12px; font-weight:800;">
                      Claim Tranche →
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Beneficiary Hospital Bank Details -->
        <div class="card" style="background:var(--color-bg-base); border:1px solid var(--color-border);">
          <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:8px;">Verified Payout Destination</h3>
          <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:12px;">
            In accordance with Bangladesh medical charity guidelines, all disbursements are routed directly to hospital institutional billing accounts.
          </p>
          <div style="font-size:var(--font-size-xs); font-family:monospace; line-height:1.7; background:var(--color-bg-surface); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
            Account Name: <strong>National Institute of Cardiovascular Diseases (NICVD) - Patient Fund</strong><br>
            Bank Name: <strong>Sonali Bank PLC (Sher-e-Bangla Nagar Branch)</strong><br>
            Routing Number: <strong>200261891</strong> &bull; Account: <strong>0119-34002819</strong> &bull; Status: <span style="color:var(--color-teal);">VERIFIED</span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.btn-claim-milestone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = Number(e.currentTarget.getAttribute('data-id'));
        const m = this.campaign.milestones.find(x => x.id === id);
        if (!m) return;

        m.status = 'disbursed';
        m.disbursedAt = new Date().toISOString().split('T')[0];
        m.invoiceFile = 'nicvd_surgical_receipt_final.pdf';
        m.txId = 'tx_pay_' + Date.now();
        this.campaign.escrowAvailableBDT -= m.amountBDT;
        this.campaign.disbursedBDT += m.amountBDT;

        toast.show(`Milestone #${id} (৳${m.amountBDT.toLocaleString()}) disbursed to NICVD billing account! Double-entry ledger updated.`, 'success', 8000);
        this.render();
      });
    });
  }
}
