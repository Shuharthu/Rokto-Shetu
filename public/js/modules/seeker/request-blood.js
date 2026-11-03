/**
 * @file request-blood.js
 * @description Blood Request Creation form with hospital autocomplete and lifecycle state tracking.
 */

import { BANGLADESH_HOSPITALS } from './hospitals-data.js';
import { toast } from '../../core/toast.js';
import { evaluateCommercialContent, showAntiCommercialBlockedModal } from '../../core/anti-commercial.js';

export class RequestBloodModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeRequest = null;
  }

  render() {
    if (!this.container) return;

    if (this.activeRequest) {
      this.renderTrackingView();
    } else {
      this.renderCreationForm();
    }
  }

  renderCreationForm() {
    this.container.innerHTML = `
      <div class="container" style="max-width:700px; padding:var(--space-8) var(--space-4);">
        <div class="card">
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:var(--space-6);">
            <div style="width:44px; height:44px; border-radius:50%; background:var(--color-crimson-subtle); color:var(--color-crimson); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:20px;">
              🩸
            </div>
            <div>
              <h1 style="font-size:var(--font-size-2xl); font-weight:800;">Create Blood Request</h1>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">Broadcast an immediate request to verified donors matching the patient's location and urgency.</p>
            </div>
          </div>

          <form id="formBloodRequest">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
              <div class="form-group">
                <label class="form-label">Patient Name <span class="required">*</span></label>
                <input type="text" class="form-input" id="reqPatientName" placeholder="e.g. Mrs. Fatema Begum" required>
              </div>

              <div class="form-group">
                <label class="form-label">Patient Age <span class="required">*</span></label>
                <input type="number" class="form-input" id="reqPatientAge" min="0" max="120" placeholder="e.g. 35" required>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:var(--space-3);">
              <div class="form-group">
                <label class="form-label">Blood Group <span class="required">*</span></label>
                <select class="form-select" id="reqBloodGroup" required>
                  <option value="B+">B+</option>
                  <option value="A+">A+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="B-">B-</option>
                  <option value="A-">A-</option>
                  <option value="O-">O-</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Units Needed <span class="required">*</span></label>
                <input type="number" class="form-input" id="reqUnits" min="1" max="10" value="1" required>
              </div>

              <div class="form-group">
                <label class="form-label">Component</label>
                <select class="form-select" id="reqComponent">
                  <option value="whole_blood">Whole Blood</option>
                  <option value="platelets">Platelets (প্লাটিলেট)</option>
                  <option value="plasma">Plasma (প্লাজমা)</option>
                </select>
              </div>
            </div>

            <!-- Hospital Autocomplete -->
            <div class="form-group" style="position:relative;">
              <label class="form-label">Hospital / Medical Center <span class="required">*</span></label>
              <input type="text" class="form-input" id="reqHospital" placeholder="Type hospital name (e.g. Chittagong Medical, DMCH)" autocomplete="off" required>
              <div id="hospitalSuggestions" style="position:absolute; top:100%; left:0; right:0; background:var(--color-bg-surface-elevated); border:1px solid var(--color-border); border-radius:var(--radius-md); box-shadow:var(--shadow-lg); max-height:200px; overflow-y:auto; z-index:100; display:none;"></div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-4);">
              <div class="form-group">
                <label class="form-label">Required By (Date & Time) <span class="required">*</span></label>
                <input type="datetime-local" class="form-input" id="reqRequiredBy" required>
              </div>

              <div class="form-group">
                <label class="form-label">Urgency Level <span class="required">*</span></label>
                <select class="form-select" id="reqUrgency">
                  <option value="normal">Normal (Scheduled surgery)</option>
                  <option value="urgent" selected>Urgent (Within 6 hours)</option>
                  <option value="critical_sos">Critical SOS (Immediate - Accident / ICU)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Contact Mobile Number <span class="required">*</span></label>
              <input type="tel" class="form-input" id="reqPhone" placeholder="+8801XXXXXXXXX" value="+8801819283746" required>
              <span class="form-hint">Shared with matched donors only after they click Accept.</span>
            </div>

            <div class="form-group">
              <label class="form-label">Reason / Clinical Notes</label>
              <textarea class="form-textarea" id="reqReason" rows="2" placeholder="e.g. Emergency C-Section delivery, Ward 4, Bed 12"></textarea>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:var(--space-6);">
              <a href="#/map" class="btn btn-outline">Cancel</a>
              <button type="submit" class="btn btn-primary" id="btnSubmitRequest">Broadcast Blood Request</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.attachCreationEvents();
  }

  attachCreationEvents() {
    const form = document.getElementById('formBloodRequest');
    const inputHosp = document.getElementById('reqHospital');
    const suggestions = document.getElementById('hospitalSuggestions');

    if (inputHosp && suggestions) {
      inputHosp.addEventListener('input', () => {
        const query = inputHosp.value.trim().toLowerCase();
        if (query.length < 2) {
          suggestions.style.display = 'none';
          return;
        }

        const matches = BANGLADESH_HOSPITALS.filter(h => 
          h.name.toLowerCase().includes(query) || h.nameBN.includes(query) || h.district.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
          suggestions.innerHTML = matches.map(h => `
            <div class="hosp-item" style="padding:10px 14px; cursor:pointer; border-bottom:1px solid var(--color-border-subtle);" data-name="${h.name}">
              <div style="font-weight:700; font-size:var(--font-size-sm);">${h.name}</div>
              <div style="font-size:11px; color:var(--color-text-secondary);">${h.address}</div>
            </div>
          `).join('');
          suggestions.style.display = 'block';

          suggestions.querySelectorAll('.hosp-item').forEach(item => {
            item.addEventListener('click', () => {
              inputHosp.value = item.dataset.name;
              suggestions.style.display = 'none';
            });
          });
        } else {
          suggestions.style.display = 'none';
        }
      });

      document.addEventListener('click', (e) => {
        if (!inputHosp.contains(e.target) && !suggestions.contains(e.target)) {
          suggestions.style.display = 'none';
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const patientName = document.getElementById('reqPatientName')?.value;
        const bloodGroup = document.getElementById('reqBloodGroup')?.value;
        const hospital = document.getElementById('reqHospital')?.value;
        const urgency = document.getElementById('reqUrgency')?.value;
        const reason = document.getElementById('reqReason')?.value || '';

        // Anti-commercialization check on notes
        if (reason.trim()) {
          const check = evaluateCommercialContent(reason, 'blood_request');
          if (!check.allowed) {
            showAntiCommercialBlockedModal(check, reason, (appealData) => {
              console.log('[ANTI-COMMERCIAL REQUEST APPEAL]', appealData);
              toast.info('False positive report received for review.');
            });
            return;
          }
        }

        this.activeRequest = {
          id: 'REQ_' + Math.floor(100000 + Math.random() * 900000),
          patientName,
          bloodGroup,
          hospital,
          urgency,
          status: 'open',
          verificationCode: '849201',
          matchedDonor: 'Donor A. (Gold Hero)',
          createdAt: new Date().toLocaleTimeString()
        };

        toast.success(`Request ${this.activeRequest.id} broadcast to matching donors!`);
        this.renderTrackingView();
      });
    }
  }

  renderTrackingView() {
    const r = this.activeRequest;

    this.container.innerHTML = `
      <div class="container" style="max-width:720px; padding:var(--space-8) var(--space-4);">
        <div class="card" style="margin-bottom:var(--space-6);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-6); border-bottom:1px solid var(--color-border-subtle); padding-bottom:var(--space-4);">
            <div>
              <span class="badge ${r.urgency === 'critical_sos' ? 'badge-urgent' : 'badge-available'}">
                ${r.urgency.toUpperCase()}
              </span>
              <h2 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:8px;">${r.bloodGroup} Blood Needed for ${r.patientName}</h2>
              <div style="color:var(--color-text-secondary); font-size:var(--font-size-xs); margin-top:4px;">Request ID: ${r.id} • Hospital: ${r.hospital}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:var(--font-size-xs); color:var(--color-text-muted);">Hospital Verification Code</div>
              <div style="font-size:1.5rem; font-weight:800; letter-spacing:2px; color:var(--color-crimson);">${r.verificationCode}</div>
            </div>
          </div>

          <!-- Lifecycle Status Bar -->
          <div style="display:flex; justify-content:space-between; margin-bottom:var(--space-8); position:relative;">
            <div style="text-align:center;">
              <div style="width:32px; height:32px; border-radius:50%; background:var(--color-success); color:white; display:flex; align-items:center; justify-content:center; margin:0 auto 4px; font-weight:700;">✓</div>
              <div style="font-size:11px; font-weight:700;">Open</div>
            </div>
            <div style="text-align:center;">
              <div style="width:32px; height:32px; border-radius:50%; background:var(--color-crimson); color:white; display:flex; align-items:center; justify-content:center; margin:0 auto 4px; font-weight:700;">2</div>
              <div style="font-size:11px; font-weight:700; color:var(--color-crimson);">Accepted</div>
            </div>
            <div style="text-align:center;">
              <div style="width:32px; height:32px; border-radius:50%; background:var(--color-border); color:var(--color-text-muted); display:flex; align-items:center; justify-content:center; margin:0 auto 4px; font-weight:700;">3</div>
              <div style="font-size:11px; color:var(--color-text-muted);">On the way</div>
            </div>
            <div style="text-align:center;">
              <div style="width:32px; height:32px; border-radius:50%; background:var(--color-border); color:var(--color-text-muted); display:flex; align-items:center; justify-content:center; margin:0 auto 4px; font-weight:700;">4</div>
              <div style="font-size:11px; color:var(--color-text-muted);">Completed</div>
            </div>
          </div>

          <!-- Matched Donor Alert Card -->
          <div class="card" style="background:var(--color-bg-subtle); display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
            <div>
              <div style="font-size:11px; color:var(--color-teal); font-weight:700;">DONOR ACCEPTED YOUR REQUEST</div>
              <div style="font-size:var(--font-size-base); font-weight:800; margin-top:2px;">${r.matchedDonor}</div>
              <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">Phone: +8801712-984729 (Unlocked)</div>
            </div>
            <div style="display:flex; gap:8px;">
              <a href="#/chat" class="btn btn-outline btn-sm">Open Chat</a>
              <button type="button" class="btn btn-primary btn-sm" id="btnConfirmDonation">Confirm Donated</button>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between;">
            <button type="button" class="btn btn-outline btn-sm" id="btnNewRequest">Create Another Request</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btnCancelRequest" style="color:var(--color-danger);">Cancel Request</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmDonation')?.addEventListener('click', () => {
      toast.success('Donation confirmed! Donor rewarded with +1 donation count and level points.');
      r.status = 'completed';
      this.renderTrackingView();
    });

    document.getElementById('btnNewRequest')?.addEventListener('click', () => {
      this.activeRequest = null;
      this.render();
    });

    document.getElementById('btnCancelRequest')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to cancel this blood request?')) {
        this.activeRequest = null;
        toast.info('Blood request cancelled.');
        this.render();
      }
    });
  }
}
