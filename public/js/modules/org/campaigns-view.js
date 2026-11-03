/**
 * @file campaigns-view.js
 * @description Blood Donation Camps, Targeted Donor Blasts, RSVP Tracking, and QR Check-in.
 */

import { toast } from '../../core/toast.js';

export class CampaignsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.camps = [
      {
        id: 'camp_01',
        title: 'Chittagong University Lifesaver Mega Camp',
        venue: 'CU Central Gymnasium, Chattogram',
        startDate: '10 Nov 2026',
        targetBags: 200,
        rsvps: 148,
        status: 'upcoming'
      },
      {
        id: 'camp_02',
        title: 'Agrabad Corporate Blood Drive',
        venue: 'World Trade Center Ground, Agrabad C/A',
        startDate: '18 Nov 2026',
        targetBags: 100,
        rsvps: 64,
        status: 'upcoming'
      }
    ];
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
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:4px;">Donation Camps & Community Drives</h1>
          </div>

          <button type="button" class="btn btn-primary btn-sm" id="btnNewCamp">+ Create Donation Camp</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:var(--space-6);">
          ${this.camps.map(c => `
            <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span class="badge badge-available" style="font-size:10px;">${c.status.toUpperCase()}</span>
                  <span style="font-size:11px; font-weight:700; color:var(--color-text-secondary);">${c.startDate}</span>
                </div>
                <h3 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:4px;">${c.title}</h3>
                <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:16px;">📍 ${c.venue}</div>

                <!-- Target Progress -->
                <div style="margin-bottom:16px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; margin-bottom:4px;">
                    <span>RSVP Progress: ${c.rsvps} of ${c.targetBags} bags</span>
                    <span style="color:var(--color-crimson);">${Math.round((c.rsvps / c.targetBags) * 100)}%</span>
                  </div>
                  <div style="height:8px; background:var(--color-border); border-radius:4px; overflow:hidden;">
                    <div style="width:${Math.round((c.rsvps / c.targetBags) * 100)}%; height:100%; background:var(--color-crimson);"></div>
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; gap:8px; border-top:1px solid var(--color-border-subtle); padding-top:12px;">
                <button type="button" class="btn btn-outline btn-sm btn-notify-donors" data-id="${c.id}">
                  📢 Blast SMS to Nearby Donors
                </button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Camp QR Check-in Terminal Launched.')">
                  QR Scanner
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    this.container.querySelectorAll('.btn-notify-donors').forEach(btn => {
      btn.addEventListener('click', () => {
        toast.success('Targeted alert dispatched to 340 verified donors within 10 km radius!');
      });
    });

    document.getElementById('btnNewCamp')?.addEventListener('click', () => {
      const title = prompt('Enter Camp Title:', 'CU Red Crescent Blood Camp');
      if (title) {
        this.camps.push({
          id: 'camp_' + Date.now(),
          title,
          venue: 'Medical Center Lawn',
          startDate: '25 Nov 2026',
          targetBags: 150,
          rsvps: 0,
          status: 'upcoming'
        });
        toast.success(`Campaign "${title}" created and published!`);
        this.render();
      }
    });
  }
}
