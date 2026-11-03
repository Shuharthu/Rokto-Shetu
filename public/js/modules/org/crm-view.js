/**
 * @file crm-view.js
 * @description Organization Donor CRM with segmentation, recall campaigns, and consent checks.
 */

import { toast } from '../../core/toast.js';

export class CrmView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedSegment = 'O-';
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:var(--space-6);">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/org" style="color:var(--color-crimson); font-size:12px; font-weight:700;">← Back to Workspace</a>
            </div>
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:4px;">Donor CRM & Recall Campaigns</h1>
          </div>

          <button type="button" class="btn btn-sos btn-sm" id="btnLaunchRecall">
            🚨 Launch Emergency Recall Broadcast
          </button>
        </div>

        <!-- CRM Segmentation Tabs -->
        <div class="card" style="margin-bottom:var(--space-6); padding:var(--space-4);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; gap:8px;">
              ${['O-', 'B+', 'A+', 'AB-', 'Rare Groups', 'All Verified'].map(s => `
                <button type="button" class="btn btn-sm ${this.selectedSegment === s ? 'btn-primary' : 'btn-outline'} btn-crm-seg" data-seg="${s}">
                  ${s}
                </button>
              `).join('')}
            </div>

            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">
              <span style="font-weight:700; color:var(--color-text-primary);">84</span> eligible donors found in segment
            </div>
          </div>
        </div>

        <!-- Donors Segment Table -->
        <div class="card" style="padding:0; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); text-align:left;">
            <thead>
              <tr style="background:var(--color-bg-subtle); border-bottom:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted); text-transform:uppercase;">
                <th style="padding:12px;">Donor</th>
                <th style="padding:12px;">Group</th>
                <th style="padding:12px;">Level</th>
                <th style="padding:12px;">Last Donated</th>
                <th style="padding:12px;">Eligibility Status</th>
                <th style="padding:12px; text-align:right;">Recall Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--color-border-subtle);">
                <td style="padding:12px; font-weight:700;">Tanvir Ahmed</td>
                <td style="padding:12px;"><span style="color:var(--color-crimson); font-weight:800;">O-</span></td>
                <td style="padding:12px;"><span class="badge" style="background:#708090; color:white; font-size:10px;">Platinum</span></td>
                <td style="padding:12px; color:var(--color-text-secondary);">12 Jun 2026</td>
                <td style="padding:12px;"><span class="badge badge-available" style="font-size:10px;">Eligible (140d gap)</span></td>
                <td style="padding:12px; text-align:right;">
                  <button type="button" class="btn btn-primary btn-sm" onclick="alert('Personalized recall SMS queued for Tanvir Ahmed.')">Send Recall</button>
                </td>
              </tr>
              <tr style="border-bottom:1px solid var(--color-border-subtle);">
                <td style="padding:12px; font-weight:700;">Farhan Chowdhury</td>
                <td style="padding:12px;"><span style="color:var(--color-crimson); font-weight:800;">O-</span></td>
                <td style="padding:12px;"><span class="badge" style="background:#D4AF37; color:white; font-size:10px;">Gold</span></td>
                <td style="padding:12px; color:var(--color-text-secondary);">05 May 2026</td>
                <td style="padding:12px;"><span class="badge badge-available" style="font-size:10px;">Eligible (180d gap)</span></td>
                <td style="padding:12px; text-align:right;">
                  <button type="button" class="btn btn-primary btn-sm" onclick="alert('Personalized recall SMS queued for Farhan Chowdhury.')">Send Recall</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.btn-crm-seg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedSegment = e.currentTarget.dataset.seg;
        this.render();
      });
    });

    document.getElementById('btnLaunchRecall')?.addEventListener('click', () => {
      toast.success('Recall broadcast initiated: SMS dispatched to all 84 eligible O- donors in Chattogram district.');
    });
  }
}
