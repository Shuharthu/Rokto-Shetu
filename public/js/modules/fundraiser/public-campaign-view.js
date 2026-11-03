/**
 * @file public-campaign-view.js
 * @description Patient Campaign Details, Staged Cost Breakdown, and Donation Simulator.
 */

import { toast } from '../../core/toast.js';

export class PublicCampaignView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.campaign = {
      id: 'fund_101',
      patientName: 'Baby Ayan Hossain',
      patientAge: '4 yrs',
      diagnosis: 'Congenital Heart Defect (Tetralogy of Fallot)',
      hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
      doctorName: 'Prof. Dr. M. A. Karim',
      bmdcNumber: 'A54219',
      targetBDT: 350000,
      raisedBDT: 245000,
      donorsCount: 142,
      story: `Ayan is a vibrant 4-year-old boy from Comilla diagnosed with complex cyanotic congenital heart disease. Over the last three months, his oxygen saturation has frequently dropped below 70%, making total surgical repair urgently necessary. His father, a CNG driver, has exhausted all family savings for pre-operative cardiac catheterization. All funds raised here will be disbursed in milestones directly to NICVD hospital billing for his surgery and ICU stay.`,
      milestones: [
        { title: 'Tranche 1: Pre-Op Diagnostics & Hospital Admission', amountBDT: 105000, status: 'disbursed', proof: 'admission_receipt_nicvd.pdf' },
        { title: 'Tranche 2: Corrective Surgery & Cardiopulmonary Bypass', amountBDT: 175000, status: 'in_review', proof: 'surgical_estimate_nicvd.pdf' },
        { title: 'Tranche 3: Post-Op ICU Care & Anti-Arrhythmic Medications', amountBDT: 70000, status: 'pending', proof: null }
      ],
      recentDonors: [
        { name: 'Dr. Tanvir Rahman', amountBDT: 5000, time: '20 mins ago', message: 'May Allah grant quick recovery to little Ayan.' },
        { name: 'Kind Supporter (Anon)', amountBDT: 2000, time: '1 hour ago', message: 'Praying for a successful surgery.' },
        { name: 'Nabila Chowdhury', amountBDT: 10000, time: '3 hours ago', message: 'Sending strength to the family.' }
      ]
    };
  }

  render() {
    if (!this.container) return;

    const pct = Math.min(100, Math.round((this.campaign.raisedBDT / this.campaign.targetBDT) * 100));

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1040px;">
        <div style="margin-bottom:var(--space-4);">
          <a href="#/fundraisers" class="btn btn-outline" style="font-size:12px; padding:4px 8px;">← All Emergency Fundraisers</a>
        </div>

        <div style="display:grid; grid-template-columns:2fr 1fr; gap:var(--space-8);">
          <!-- Left Main Column: Medical Details, Story, Milestones -->
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-weight:800; font-size:11px;">
                PEDIATRIC CARDIAC SURGERY
              </span>
              <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:700; font-size:11px;">
                ✓ BMDC ${this.campaign.bmdcNumber} VERIFIED
              </span>
            </div>

            <h1 style="font-size:var(--font-size-2xl); font-weight:900; margin-bottom:8px;">${this.campaign.patientName} (${this.campaign.patientAge})</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-bottom:var(--space-6);">
              Diagnosis: <strong style="color:var(--color-text-primary);">${this.campaign.diagnosis}</strong>
            </p>

            <!-- Hospital Accreditation Box -->
            <div class="card" style="margin-bottom:var(--space-6); background:var(--color-bg-base); border-left:4px solid var(--color-teal);">
              <div style="font-weight:800; font-size:var(--font-size-sm);">Verified Treatment Center & Attending Physician</div>
              <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:4px; line-height:1.6;">
                🏥 <strong>${this.campaign.hospitalName}</strong><br>
                👨‍⚕️ <strong>${this.campaign.doctorName}</strong> &bull; Registration: BMDC <code>#${this.campaign.bmdcNumber}</code> (Active Registry)
              </div>
            </div>

            <!-- Patient Story -->
            <div class="card" style="margin-bottom:var(--space-6);">
              <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:12px;">Patient Emergency Story</h2>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.7;">
                ${this.campaign.story}
              </p>
            </div>

            <!-- Staged Milestone Transparency Table -->
            <div class="card" style="margin-bottom:var(--space-6);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h2 style="font-size:var(--font-size-md); font-weight:800;">Staged Cost Breakdown & Invoices</h2>
                <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:10px;">Double-Entry Escrow</span>
              </div>
              <p style="font-size:11px; color:var(--color-text-secondary); margin-bottom:14px;">
                Funds are released in tranches against audited hospital invoices only.
              </p>

              <div style="display:flex; flex-direction:column; gap:10px;">
                ${this.campaign.milestones.map((m, idx) => `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--color-bg-base); border-radius:var(--radius-sm); border:1px solid var(--color-border); flex-wrap:wrap; gap:8px;">
                    <div>
                      <div style="font-weight:700; font-size:13px;">${m.title}</div>
                      <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">
                        ${m.proof ? `📄 Proof of use: <span style="color:var(--color-teal);">${m.proof}</span>` : 'Pending medical invoice submission'}
                      </div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-weight:900; font-size:14px;">৳ ${m.amountBDT.toLocaleString()}</div>
                      <span class="badge" style="font-size:10px; ${m.status === 'disbursed' ? 'background:var(--color-teal-subtle); color:var(--color-teal);' : m.status === 'in_review' ? 'background:#FFF3CD; color:#856404;' : 'background:var(--color-bg-surface);'}">
                        ${m.status === 'disbursed' ? '✓ DISBURSED' : m.status === 'in_review' ? 'UNDER AUDIT' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Recent Donors Wall -->
            <div class="card">
              <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:12px;">Kind Supporters (${this.campaign.donorsCount})</h2>
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${this.campaign.recentDonors.map(d => `
                  <div style="border-bottom:1px solid var(--color-border); padding-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px;">
                      <strong>${d.name}</strong>
                      <strong style="color:var(--color-crimson);">৳ ${d.amountBDT.toLocaleString()}</strong>
                    </div>
                    <div style="font-size:11px; color:var(--color-text-secondary); margin-top:2px;">${d.message}</div>
                    <div style="font-size:10px; color:var(--color-text-muted); margin-top:2px;">${d.time}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Sidebar: Donation Panel -->
          <div>
            <div class="card" style="position:sticky; top:24px; border:2px solid var(--color-crimson);">
              <div style="font-size:12px; font-weight:800; color:var(--color-text-secondary); text-transform:uppercase; margin-bottom:4px;">Raised So Far</div>
              <div style="font-size:2.2rem; font-weight:900; color:var(--color-crimson); margin-bottom:4px;">
                ৳ ${this.campaign.raisedBDT.toLocaleString()}
              </div>
              <div style="font-size:12px; color:var(--color-text-secondary); margin-bottom:16px;">
                Goal: <strong>৳ ${this.campaign.targetBDT.toLocaleString()}</strong> (${pct}% funded)
              </div>

              <!-- Progress Bar -->
              <div style="width:100%; height:10px; background:var(--color-bg-surface); border-radius:5px; overflow:hidden; border:1px solid var(--color-border); margin-bottom:20px;">
                <div style="width:${pct}%; height:100%; background:var(--color-crimson); border-radius:5px;"></div>
              </div>

              <!-- Preset Donation Amounts -->
              <div style="font-size:12px; font-weight:700; margin-bottom:8px;">Choose Donation Amount (BDT):</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
                <button type="button" class="btn btn-outline btn-preset" data-amount="500">৳ 500</button>
                <button type="button" class="btn btn-outline btn-preset" data-amount="1000">৳ 1,000</button>
                <button type="button" class="btn btn-primary btn-preset" data-amount="2500">৳ 2,500</button>
                <button type="button" class="btn btn-outline btn-preset" data-amount="5000">৳ 5,000</button>
              </div>

              <div style="margin-bottom:16px;">
                <label style="font-size:11px; font-weight:700; display:block; margin-bottom:4px;">Or Custom Amount (৳)</label>
                <input type="number" id="inputCustomDonation" class="input" value="2500" style="width:100%; font-weight:800; font-size:14px;">
              </div>

              <!-- Payment Method Select -->
              <div style="margin-bottom:16px;">
                <label style="font-size:11px; font-weight:700; display:block; margin-bottom:4px;">Select Payment Gateway</label>
                <div style="display:flex; gap:6px;">
                  <button type="button" class="btn btn-outline btn-sm" style="flex:1; border-color:#D8236C; color:#D8236C; font-weight:800;">bKash</button>
                  <button type="button" class="btn btn-outline btn-sm" style="flex:1; border-color:#F58220; color:#F58220; font-weight:800;">Nagad</button>
                  <button type="button" class="btn btn-outline btn-sm" style="flex:1;">Cards</button>
                </div>
              </div>

              <button type="button" class="btn btn-primary btn-block" id="btnConfirmDonation" style="padding:14px; font-size:14px; font-weight:900;">
                Donate with bKash / Card
              </button>

              <div style="text-align:center; font-size:10px; color:var(--color-text-secondary); margin-top:12px;">
                🔒 SSL Encrypted &bull; 0% Platform Fee &bull; Audited Double-Entry Escrow
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('.btn-preset').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-outline');
        });
        e.currentTarget.classList.remove('btn-outline');
        e.currentTarget.classList.add('btn-primary');
        const amt = e.currentTarget.getAttribute('data-amount');
        const customInput = document.getElementById('inputCustomDonation');
        if (customInput) customInput.value = amt;
      });
    });

    const btnDonate = document.getElementById('btnConfirmDonation');
    if (btnDonate) {
      btnDonate.addEventListener('click', () => {
        const amtInput = document.getElementById('inputCustomDonation');
        const amount = Number(amtInput?.value) || 2500;

        this.campaign.raisedBDT += amount;
        this.campaign.donorsCount += 1;
        this.campaign.recentDonors.unshift({
          name: 'Generous Donor (You)',
          amountBDT: amount,
          time: 'Just now',
          message: 'Wishing speedy recovery and healing.'
        });

        toast.show(`Thank you! ৳${amount.toLocaleString()} received into audited escrow for ${this.campaign.patientName}.`, 'success', 8000);
        this.render();
      });
    }
  }
}
