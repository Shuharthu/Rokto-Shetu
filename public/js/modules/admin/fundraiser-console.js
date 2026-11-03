/**
 * @file fundraiser-console.js
 * @description Admin 4-Eyes Review Console & Milestone Payout Approval Workflow.
 */

import { toast } from '../../core/toast.js';

export class FundraiserAdminConsole {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.queue = [
      {
        id: 'fund_201',
        patientName: 'Tamim Iqbal',
        age: '12 yrs',
        diagnosis: 'Severe Aplastic Anemia (Bone Marrow Transplant)',
        hospitalName: 'Dhaka Medical College Hospital (Hematology Unit)',
        doctorName: 'Prof. Dr. Akhter Hossain',
        bmdcNumber: 'A48102',
        targetBDT: 500000,
        currentStep: 'first_review', // 'first_review' | 'senior_review'
        documents: ['dmch_bmt_estimate.pdf', 'prescription_akhter.jpg'],
        submittedAt: '2026-11-02'
      },
      {
        id: 'fund_202',
        patientName: 'Rokeya Begum',
        age: '54 yrs',
        diagnosis: 'Triple Vessel Coronary Artery Disease (CABG Surgery)',
        hospitalName: 'National Heart Foundation Hospital',
        doctorName: 'Dr. Shahabuddin Ahmed',
        bmdcNumber: 'A29415',
        targetBDT: 320000,
        currentStep: 'senior_review', // Eye 1 approved; waiting for Eye 2
        firstReviewBy: 'reviewer_doc_12',
        documents: ['nhf_angiogram_report.pdf', 'cost_estimate.pdf'],
        submittedAt: '2026-11-01'
      }
    ];

    this.pendingPayouts = [
      {
        payoutId: 'pay_claim_881',
        campaignId: 'fund_101',
        patientName: 'Baby Ayan Hossain',
        hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
        milestoneTitle: 'Tranche 2: Corrective Surgery & Cardiopulmonary Bypass',
        amountBDT: 140000,
        invoiceDoc: 'nicvd_surgical_invoice_verified.pdf',
        requestedBy: 'applicant_guardian_hossain'
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1120px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/admin" class="btn btn-outline" style="font-size:12px; padding:4px 8px;">← Admin Center</a>
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Fundraiser 4-Eyes Review & Payout Sign-Off</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Strict two-reviewer mandate: Medical Doctor review followed by Senior Finance Officer sign-off.
            </p>
          </div>
          <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:800; padding:6px 12px;">
            Dual Control Active (4-Eyes)
          </span>
        </div>

        <!-- Section 1: Campaign Review Queue -->
        <div class="card" style="margin-bottom:var(--space-8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <h2 style="font-size:var(--font-size-md); font-weight:800;">Campaign Ingestion & Document Verification Queue</h2>
            <span style="font-size:11px; color:var(--color-text-secondary);">${this.queue.length} pending campaigns</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:14px;">
            ${this.queue.map(c => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
                <div style="max-width:620px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span class="badge" style="font-size:10px; font-weight:800; ${c.currentStep === 'first_review' ? 'background:#FFF3CD; color:#856404;' : 'background:var(--color-teal-subtle); color:var(--color-teal);'}">
                      ${c.currentStep === 'first_review' ? 'EYE 1: MEDICAL AUDIT' : 'EYE 2: SENIOR SIGN-OFF'}
                    </span>
                    <h3 style="font-size:var(--font-size-sm); font-weight:800;">${c.patientName} (${c.age})</h3>
                  </div>

                  <div style="font-size:12px; color:var(--color-text-secondary); margin-top:6px; line-height:1.6;">
                    Diagnosis: <strong>${c.diagnosis}</strong><br>
                    Hospital: <strong>${c.hospitalName}</strong> &bull; Physician: <strong>${c.doctorName}</strong> (BMDC: <code>${c.bmdcNumber}</code>)<br>
                    Target Goal: <strong style="color:var(--color-crimson);">৳ ${c.targetBDT.toLocaleString()}</strong> &bull; Documents: ${c.documents.join(', ')}
                  </div>
                </div>

                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <button type="button" class="btn btn-secondary btn-sm btn-inspect-docs" data-id="${c.id}">
                    🔍 Inspect Documents (60s Watermarked)
                  </button>
                  ${c.currentStep === 'first_review' ? `
                    <button type="button" class="btn btn-outline btn-sm btn-approve-eye1" data-id="${c.id}">
                      Pass Medical Audit (Eye 1)
                    </button>
                  ` : `
                    <button type="button" class="btn btn-primary btn-sm btn-approve-eye2" data-id="${c.id}" style="font-weight:800;">
                      Final Approval & Publish (Eye 2)
                    </button>
                  `}
                  <button type="button" class="btn btn-outline btn-sm" style="color:var(--color-crimson);">Reject</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 2: Milestone Payout Authorization -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <h2 style="font-size:var(--font-size-md); font-weight:800;">Hospital Milestone Payout Authorization</h2>
            <span class="badge" style="background:var(--color-bg-surface); border:1px solid var(--color-border); font-size:10px;">
              Double-Entry Escrow Verification
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px;">
            ${this.pendingPayouts.map(p => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div>
                  <div style="font-weight:800; font-size:13px;">${p.milestoneTitle}</div>
                  <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">
                    Patient: <strong>${p.patientName}</strong> &bull; Destination: <strong>${p.hospitalName}</strong><br>
                    Attached Bill: <span style="color:var(--color-teal);">${p.invoiceDoc}</span>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="font-weight:900; font-size:1.25rem; color:var(--color-crimson);">
                    ৳ ${p.amountBDT.toLocaleString()}
                  </div>
                  <button type="button" class="btn btn-primary btn-sm btn-approve-payout" data-id="${p.payoutId}" style="font-weight:800;">
                    Release Tranche to Hospital
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.btn-inspect-docs').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const c = this.queue.find(x => x.id === id);
        if (c) this.openWatermarkedDocViewer(c);
      });
    });

    this.container.querySelectorAll('.btn-approve-eye1').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const c = this.queue.find(x => x.id === id);
        if (c) {
          c.currentStep = 'senior_review';
          toast.show(`Medical review passed for ${c.patientName}! Queued for Eye 2 Senior Sign-off.`, 'info');
          this.render();
        }
      });
    });

    this.container.querySelectorAll('.btn-approve-eye2').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.queue = this.queue.filter(x => x.id !== id);
        toast.show(`Campaign ${id} approved by Senior Reviewer! Now live on public directory.`, 'success');
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-approve-payout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.pendingPayouts = this.pendingPayouts.filter(p => p.payoutId !== id);
        toast.show(`Milestone payout ${id} authorized and dispatched to hospital bank!`, 'success');
        this.render();
      });
    });
  }

  openWatermarkedDocViewer(c) {
    document.getElementById('watermarkedDocModal')?.remove();

    let timeLeft = 60;
    const reviewerId = 'REV_DOC_ADMIN_44';
    const timestamp = new Date().toISOString();

    const modal = document.createElement('div');
    modal.id = 'watermarkedDocModal';
    modal.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,0.85);
      display:flex; align-items:center; justify-content:center;
      z-index:10000; padding:16px; animation:fadeIn 0.15s ease-out;
    `;

    modal.innerHTML = `
      <div class="card" style="max-width:840px; width:100%; height:85vh; display:flex; flex-direction:column; padding:0; overflow:hidden; position:relative; border:2px solid var(--color-crimson); box-shadow:var(--shadow-lg);">
        <!-- Header -->
        <div style="padding:14px 20px; background:var(--color-bg-surface-elevated); border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:800; font-size:14px; display:flex; align-items:center; gap:8px;">
              🛡️ Watermarked Document Inspection • Patient: ${c.patientName}
            </div>
            <div style="font-size:11px; color:var(--color-text-secondary);">
              Hospital: ${c.hospitalName} • Attending: ${c.doctorName} (BMDC: ${c.bmdcNumber})
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:rgba(220,38,38,0.15); color:var(--color-crimson); font-weight:800; font-size:13px; padding:4px 12px; border-radius:12px; border:1px solid var(--color-crimson);" id="docTimerDisplay">
              ⏱ Session Expiring in: 60s
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btnCloseDocViewer">Close</button>
          </div>
        </div>

        <!-- Fraud Signal Summary Bar -->
        <div style="padding:8px 20px; background:rgba(42,157,143,0.1); border-bottom:1px solid var(--color-border-subtle); display:flex; justify-content:space-between; align-items:center; font-size:11px;">
          <div style="display:flex; gap:16px;">
            <span>🔍 <strong>Hash Check:</strong> SHA-256 Unique (0 Duplicates)</span>
            <span>🏥 <strong>BMDC:</strong> Verified Licensed Practitioner</span>
            <span>💳 <strong>Escrow Account:</strong> Verified Direct Hospital Desk</span>
          </div>
          <span class="badge badge-available" style="font-size:10px;">AUTOMATED FRAUD SCORE: 0/100 (CLEAN)</span>
        </div>

        <!-- Watermarked Document Preview Area -->
        <div style="flex:1; background:#F8FAFC; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px;">
          <!-- Moving Forensic Diagonal Watermarks -->
          <div style="position:absolute; inset:0; pointer-events:none; display:flex; flex-direction:column; justify-content:space-around; opacity:0.18; transform:rotate(-22deg) scale(1.2); user-select:none;">
            ${Array(6).fill(0).map(() => `
              <div style="font-size:20px; font-weight:900; color:#DC2626; white-space:nowrap; letter-spacing:3px;">
                CONFIDENTIAL • REVIEWER: ${reviewerId} • ${timestamp} • ROKTOSETU AUDIT
              </div>
            `).join('')}
          </div>

          <!-- Document Content Simulation -->
          <div style="background:white; width:90%; height:90%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1); border:1px solid #CBD5E1; padding:32px; display:flex; flex-direction:column; justify-content:space-between; z-index:2; position:relative; color:#1E293B;">
            <div style="border-bottom:2px solid #0F172A; padding-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <h3 style="margin:0; font-size:18px; font-weight:800; color:#0F172A;">${c.hospitalName.toUpperCase()}</h3>
                <div style="font-size:11px; color:#64748B;">Department of Cardiovascular & Thoracic Surgery • Official Clinical Estimate</div>
              </div>
              <div style="text-align:right; font-size:11px;">
                <strong>Date:</strong> March 01, 2026<br>
                <strong>Ref:</strong> EST-2026-NICVD-941
              </div>
            </div>

            <div style="font-size:13px; line-height:1.7; margin:16px 0;">
              <strong>Patient Name:</strong> ${c.patientName} &nbsp;|&nbsp; <strong>Age:</strong> ${c.age}<br>
              <strong>Clinical Diagnosis:</strong> ${c.diagnosis}<br>
              <strong>Procedure Planned:</strong> Corrective Intracardiac Repair with Hypothermic Bypass<br>
              <strong>Attending Surgeon:</strong> ${c.doctorName} (BMDC Reg: ${c.bmdcNumber})
              <div style="margin-top:12px; background:#F1F5F9; padding:10px 14px; border-radius:6px; font-size:12px;">
                <strong>Total Clinical Estimate:</strong> ৳ ${c.targetBDT.toLocaleString()} BDT (Including OT charges, anesthesia, consumables, and 5-day pediatric ICU monitoring).
              </div>
            </div>

            <div style="border-top:1px solid #CBD5E1; padding-top:12px; display:flex; justify-content:space-between; align-items:flex-end; font-size:11px;">
              <div>
                <em>Generated under signed, temporary 60-second read token.</em>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700; font-style:italic;">${c.doctorName}</div>
                <div style="color:#64748B;">Chief Pediatric Cardiac Surgeon</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const timer = setInterval(() => {
      timeLeft--;
      const display = document.getElementById('docTimerDisplay');
      if (display) {
        display.textContent = `⏱ Session Expiring in: ${timeLeft}s`;
      }
      if (timeLeft <= 0) {
        clearInterval(timer);
        toast.info('Secure watermarked document inspection session expired.');
        modal.remove();
      }
    }, 1000);

    document.getElementById('btnCloseDocViewer')?.addEventListener('click', () => {
      clearInterval(timer);
      modal.remove();
    });
  }
}
