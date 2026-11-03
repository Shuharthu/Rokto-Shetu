/**
 * @file verify-queue.js
 * @description Identity Verifier Queue with side-by-side comparison, transient watermarking, and SLA timers.
 */

import { toast } from '../../core/toast.js';

export class IdentityVerifierQueue {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding: var(--space-8) var(--space-4);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-6);">
          <div>
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-bottom:4px;">Identity Verification Queue</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm);">Review submitted government IDs and live selfies with transient watermarking.</p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; background:var(--color-bg-surface); padding:8px 16px; border-radius:var(--radius-full); border:1px solid var(--color-border);">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2A9D8F;"></span>
            <span style="font-size:var(--font-size-xs); font-weight:700;">Reviewer SLA: <span id="slaTimer" style="color:var(--color-crimson);">14:38</span></span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr; gap:var(--space-6);" id="reviewCard">
          <div class="card" style="position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-6); border-bottom:1px solid var(--color-border-subtle); padding-bottom:var(--space-4);">
              <div>
                <span class="badge badge-urgent" style="margin-bottom:6px;">Under Review</span>
                <h2 style="font-size:var(--font-size-xl); font-weight:700;">Rafi S. (Applicant UID: u_987214)</h2>
                <div style="font-size:var(--font-size-xs); color:var(--color-text-muted); margin-top:2px;">Submitted: 6 minutes ago • Blood Group: B+ • Weight: 68 kg • Chattogram</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">ID Document Type:</div>
                <div style="font-size:var(--font-size-sm); font-weight:700;">National ID (NID 17-digit)</div>
              </div>
            </div>

            <!-- Side-by-Side Comparison -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:var(--space-6); margin-bottom:var(--space-8);">
              <!-- Live Selfie Frame -->
              <div>
                <div style="font-size:var(--font-size-sm); font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between;">
                  <span>1. Live Capture Selfie</span>
                  <span style="color:var(--color-text-teal); font-size:var(--font-size-xs);">Liveness: Verified</span>
                </div>
                <div style="position:relative; width:100%; height:260px; background:#1B1B1F; border-radius:var(--radius-lg); overflow:hidden; border:2px solid var(--color-border); display:flex; align-items:center; justify-content:center;">
                  <!-- Simulated Selfie Image -->
                  <div style="text-align:center;">
                    <div style="width:110px; height:110px; border-radius:50%; background:#2A9D8F; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; color:white; font-size:32px; font-weight:800;">
                      RS
                    </div>
                    <span style="color:white; font-size:var(--font-size-xs); font-weight:600;">Rafi S. • Live Webcam</span>
                  </div>
                  <!-- Transient Watermark Overlay -->
                  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transform:rotate(-25deg); color:rgba(255,255,255,0.18); font-size:18px; font-weight:800; pointer-events:none; user-select:none;">
                    ROKTOSETU VERIFIER • 60s EXPIRES
                  </div>
                </div>
              </div>

              <!-- Uploaded NID Document -->
              <div>
                <div style="font-size:var(--font-size-sm); font-weight:600; margin-bottom:8px; display:flex; justify-content:space-between;">
                  <span>2. National ID Card (Front)</span>
                  <span style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">KMS Encrypted Storage</span>
                </div>
                <div style="position:relative; width:100%; height:260px; background:#18181D; border-radius:var(--radius-lg); overflow:hidden; border:2px solid var(--color-border); display:flex; align-items:center; justify-content:center; padding:16px;">
                  <div style="width:100%; height:100%; border:1px solid #333; border-radius:var(--radius-md); padding:16px; background:#222; color:white;">
                    <div style="font-size:10px; color:#aaa;">PEOPLE'S REPUBLIC OF BANGLADESH / NATIONAL ID</div>
                    <div style="display:flex; gap:12px; margin-top:12px;">
                      <div style="width:50px; height:60px; background:#444; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px;">PHOTO</div>
                      <div style="font-size:11px;">
                        <div>Name: Rafi Shuharthu</div>
                        <div>DOB: 12 May 1996</div>
                        <div style="color:#E9C46A; margin-top:4px;">NID: 19962384729104829</div>
                      </div>
                    </div>
                  </div>
                  <!-- Transient Watermark -->
                  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; transform:rotate(-25deg); color:rgba(255,255,255,0.18); font-size:18px; font-weight:800; pointer-events:none; user-select:none;">
                    ROKTOSETU VERIFIER • 60s EXPIRES
                  </div>
                </div>
              </div>
            </div>

            <!-- Reviewer Checklist -->
            <div style="background:var(--color-bg-subtle); padding:var(--space-5); border-radius:var(--radius-md); margin-bottom:var(--space-6);">
              <div style="font-size:var(--font-size-sm); font-weight:700; margin-bottom:var(--space-3);">Verification Checklist</div>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-3);">
                <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs); cursor:pointer;">
                  <input type="checkbox" id="chkPhotoMatch" checked> Selfie matches NID photograph
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs); cursor:pointer;">
                  <input type="checkbox" id="chkNidClear" checked> Document text is crisp and unedited
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs); cursor:pointer;">
                  <input type="checkbox" id="chkAgeEligible" checked> Age is between 18 and 60 years
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs); cursor:pointer;">
                  <input type="checkbox" id="chkDuplicatePass" checked> Salted hash duplicate check passed
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div style="display:flex; justify-content:flex-end; gap:var(--space-3);">
              <button type="button" class="btn btn-outline" id="btnReject" style="border-color:var(--color-danger); color:var(--color-danger);">
                Reject with Reason Code
              </button>
              <button type="button" class="btn btn-primary" id="btnApprove">
                Approve & Grant Verified Donor Status
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btnApprove = document.getElementById('btnApprove');
    const btnReject = document.getElementById('btnReject');

    if (btnApprove) {
      btnApprove.addEventListener('click', () => {
        toast.success('User verified successfully! Role custom claim updated to verified_donor.');
        const card = document.getElementById('reviewCard');
        if (card) {
          card.innerHTML = `
            <div class="card" style="text-align:center; padding:var(--space-12);">
              <div style="color:var(--color-teal); font-size:40px; margin-bottom:12px;">✓</div>
              <h3>Queue is clear!</h3>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:6px;">No pending identity verification requests remaining in this batch.</p>
            </div>
          `;
        }
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', () => {
        const reason = prompt('Select Rejection Code:\n1. UNCLEAR_IMAGE\n2. UNDERAGE_APPLICANT\n3. NAME_MISMATCH\n4. TAMPERED_DOCUMENT', '1');
        if (reason) {
          toast.error(`Application rejected with code: ${reason}. Notification dispatched to applicant.`);
        }
      });
    }
  }
}
