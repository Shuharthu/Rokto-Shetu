/**
 * @file availability.js
 * @description Donor Availability Scheduler, Away Mode, and Privacy Controls.
 */

import { toast } from '../../core/toast.js';

export class DonorAvailabilityModule {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.status = 'available_now';
    this.privacy = {
      hidePhone: true,
      approximateLocation: true
    };
    this.eligibleDaysLeft = 34;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="max-width:720px; padding:var(--space-8) var(--space-4);">
        <div class="card" style="margin-bottom:var(--space-6);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); border-bottom:1px solid var(--color-border-subtle); padding-bottom:var(--space-4);">
            <div>
              <h1 style="font-size:var(--font-size-2xl); font-weight:800;">Donor Availability & Privacy</h1>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">Manage when you appear on the emergency map and control who can contact you.</p>
            </div>
            <!-- Next Eligible Badge (Matching uploaded screenshot) -->
            <div style="background:var(--color-teal-subtle); padding:8px 16px; border-radius:var(--radius-lg); text-align:center;">
              <div style="font-size:10px; color:var(--color-text-secondary);">Next eligible date</div>
              <div style="font-size:var(--font-size-base); font-weight:800; color:var(--color-teal);">in ${this.eligibleDaysLeft} days</div>
            </div>
          </div>

          <!-- Availability State Selector -->
          <div class="form-group" style="margin-bottom:var(--space-6);">
            <label class="form-label">Current Availability Status</label>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:var(--space-3);">
              <label class="card" style="cursor:pointer; padding:var(--space-4); border: 2px solid ${this.status === 'available_now' ? 'var(--color-teal)' : 'var(--color-border)'}; background: ${this.status === 'available_now' ? 'var(--color-teal-subtle)' : 'var(--color-bg-subtle)'};">
                <input type="radio" name="availStatus" value="available_now" ${this.status === 'available_now' ? 'checked' : ''} style="margin-right:8px;">
                <span style="font-weight:700; color:var(--color-teal);">Available Now</span>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Appear on live map immediately for all urgent requests.</div>
              </label>

              <label class="card" style="cursor:pointer; padding:var(--space-4); border: 2px solid ${this.status === 'emergency_only' ? 'var(--color-crimson)' : 'var(--color-border)'}; background: ${this.status === 'emergency_only' ? 'var(--color-crimson-subtle)' : 'var(--color-bg-subtle)'};">
                <input type="radio" name="availStatus" value="emergency_only" ${this.status === 'emergency_only' ? 'checked' : ''} style="margin-right:8px;">
                <span style="font-weight:700; color:var(--color-crimson);">Emergency SOS Only</span>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Alert me only for Critical/ICU/Accident emergencies.</div>
              </label>

              <label class="card" style="cursor:pointer; padding:var(--space-4); border: 2px solid ${this.status === 'unavailable' ? 'var(--color-text-primary)' : 'var(--color-border)'};">
                <input type="radio" name="availStatus" value="unavailable" ${this.status === 'unavailable' ? 'checked' : ''} style="margin-right:8px;">
                <span style="font-weight:700;">Unavailable (Away)</span>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Pause all notifications and hide pin from the map.</div>
              </label>
            </div>
          </div>

          <!-- Weekly Schedule -->
          <div class="form-group" style="margin-bottom:var(--space-6);">
            <label class="form-label">Weekly Recurring Free Hours</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-3);">
              <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs);">
                <input type="checkbox" checked> Weekday Evenings (6:00 PM – 9:00 PM)
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs);">
                <input type="checkbox" checked> Friday Full Day (Jumma / Holiday)
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs);">
                <input type="checkbox" checked> Saturday Morning (8:00 AM – 1:00 PM)
              </label>
              <label style="display:flex; align-items:center; gap:8px; font-size:var(--font-size-xs);">
                <input type="checkbox"> Available 24/7 on Call
              </label>
            </div>
          </div>

          <!-- Privacy Safeguards -->
          <div class="card" style="background:var(--color-bg-subtle); margin-bottom:var(--space-6);">
            <h3 style="font-size:var(--font-size-sm); font-weight:700; margin-bottom:var(--space-3);">Privacy Safeguards</h3>
            
            <div style="display:flex; flex-direction:column; gap:var(--space-3);">
              <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                <input type="checkbox" id="chkHidePhone" checked style="margin-top:3px;">
                <div>
                  <span style="font-weight:600; font-size:var(--font-size-sm);">Hide phone number until I explicitly accept a request</span>
                  <div style="font-size:11px; color:var(--color-text-secondary);">Seekers coordinate via in-app chat until mutual acceptance.</div>
                </div>
              </label>

              <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                <input type="checkbox" id="chkApproxLoc" checked style="margin-top:3px;">
                <div>
                  <span style="font-weight:600; font-size:var(--font-size-sm);">Use fuzzed approximate location (~500m geohash)</span>
                  <div style="font-size:11px; color:var(--color-text-secondary);">Your home or office address is never revealed to seekers or map viewers.</div>
                </div>
              </label>
            </div>
          </div>

          <button type="button" class="btn btn-primary" id="btnSaveAvailability">
            Save Preferences
          </button>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    document.querySelectorAll('input[name="availStatus"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.status = e.target.value;
        this.render();
      });
    });

    document.getElementById('btnSaveAvailability')?.addEventListener('click', () => {
      toast.success('Availability and privacy settings saved successfully!');
    });
  }
}
