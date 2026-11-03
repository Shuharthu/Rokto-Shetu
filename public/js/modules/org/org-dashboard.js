/**
 * @file org-dashboard.js
 * @description B2B Organization SaaS Workspace Dashboard for Hospitals & Blood Banks.
 */

export class OrgDashboardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.org = {
      name: 'Chittagong Medical Blood Bank & Transfusion Center',
      orgId: 'org_cmch_01',
      plan: 'Org Pro',
      branchesCount: 2,
      totalUnits: 142,
      expiringWithin48h: 4,
      criticalStockGroups: ['O-', 'AB-'],
      fulfilledToday: 18
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);">
        <!-- Top Workspace Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:var(--space-8);">
          <div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span class="badge" style="background:#2A9D8F; color:white; font-size:10px; font-weight:800;">HOSPITAL B2B</span>
              <span class="badge" style="background:var(--color-bg-subtle); border:1px solid var(--color-border); font-size:10px;">${this.org.plan}</span>
            </div>
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:4px;">${this.org.name}</h1>
          </div>

          <!-- Quick Navigation Tabs -->
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="#/org/inventory" class="btn btn-primary btn-sm">Manage Inventory</a>
            <a href="#/org/campaigns" class="btn btn-outline btn-sm">Camps & Drives</a>
            <a href="#/org/crm" class="btn btn-outline btn-sm">Donor CRM</a>
            <a href="#/org/team" class="btn btn-outline btn-sm">Team & Roles</a>
            <a href="#/org/api-keys" class="btn btn-outline btn-sm">API & Webhooks</a>
            <a href="#/org/white-label" class="btn btn-outline btn-sm">White-Label</a>
            <a href="#/pricing" class="btn btn-outline btn-sm" style="color:var(--color-crimson); border-color:var(--color-crimson);">Upgrade Plan</a>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-8);">
          <div class="card" style="border-left:4px solid var(--color-teal);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Active Inventory</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-text-primary); margin-top:4px;">${this.org.totalUnits} <span style="font-size:14px; font-weight:600; color:var(--color-text-muted);">Bags</span></div>
            <div style="font-size:11px; color:var(--color-teal); font-weight:600; margin-top:4px;">Tested & Cleared for Transfusion</div>
          </div>

          <div class="card" style="border-left:4px solid var(--color-crimson);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Expiring Soon (&lt; 48h)</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">${this.org.expiringWithin48h} <span style="font-size:14px; font-weight:600;">Units</span></div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:4px;">Prioritize via FEFO issuance</div>
          </div>

          <div class="card" style="border-left:4px solid #E9C46A;">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Critical Low Stock</div>
            <div style="font-size:2rem; font-weight:900; color:#E9C46A; margin-top:4px;">${this.org.criticalStockGroups.join(', ')}</div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:4px;">Trigger recall campaign to donors</div>
          </div>

          <div class="card" style="border-left:4px solid #3B82F6;">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Issued / Transfused Today</div>
            <div style="font-size:2rem; font-weight:900; color:#3B82F6; margin-top:4px;">${this.org.fulfilledToday} <span style="font-size:14px; font-weight:600;">Units</span></div>
            <div style="font-size:11px; color:var(--color-text-muted); margin-top:4px;">Average cross-match: 22 mins</div>
          </div>
        </div>

        <!-- Live Stock by Blood Group Breakdown -->
        <div class="card" style="margin-bottom:var(--space-8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <h2 style="font-size:var(--font-size-lg); font-weight:800;">Real-Time Stock by Blood Group</h2>
            <span style="font-size:11px; color:var(--color-text-secondary);">Updated 2 mins ago</span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:12px;">
            ${[
              { group: 'A+', units: 28, status: 'safe' },
              { group: 'B+', units: 42, status: 'safe' },
              { group: 'O+', units: 36, status: 'safe' },
              { group: 'AB+', units: 18, status: 'safe' },
              { group: 'A-', units: 6, status: 'warning' },
              { group: 'B-', units: 7, status: 'warning' },
              { group: 'O-', units: 2, status: 'critical' },
              { group: 'AB-', units: 3, status: 'critical' }
            ].map(b => `
              <div class="card" style="text-align:center; padding:12px; background:var(--color-bg-subtle); border-top:3px solid ${b.status === 'safe' ? '#2A9D8F' : b.status === 'warning' ? '#E9C46A' : '#D90429'};">
                <div style="font-size:18px; font-weight:900; color:var(--color-text-primary);">${b.group}</div>
                <div style="font-size:1.5rem; font-weight:800; color:${b.status === 'critical' ? 'var(--color-crimson)' : 'var(--color-text-primary)'}; margin:4px 0;">${b.units}</div>
                <div style="font-size:10px; font-weight:700; color:${b.status === 'safe' ? '#2A9D8F' : b.status === 'warning' ? '#B8860B' : '#D90429'}; text-transform:uppercase;">${b.status}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- FEFO Priority Recommendation Queue -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <div>
              <h2 style="font-size:var(--font-size-lg); font-weight:800;">FEFO Recommended Issuance Queue</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">First-Expired First-Out blood units suggested for immediate surgical allocation to prevent wastage.</p>
            </div>
            <a href="#/org/inventory" class="btn btn-outline btn-sm">Full Inventory Table</a>
          </div>

          <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted); text-transform:uppercase;">
                <th style="padding:10px;">Bag / RFID</th>
                <th style="padding:10px;">Group</th>
                <th style="padding:10px;">Component</th>
                <th style="padding:10px;">Expiry Countdown</th>
                <th style="padding:10px;">Location</th>
                <th style="padding:10px; text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid var(--color-border-subtle); background:rgba(217,4,41,0.04);">
                <td style="padding:10px; font-family:monospace; font-weight:700;">BAG-2026-B812</td>
                <td style="padding:10px;"><span style="font-weight:800; color:var(--color-crimson);">B+</span></td>
                <td style="padding:10px;">Whole Blood</td>
                <td style="padding:10px;"><span class="badge badge-urgent" style="font-size:10px;">Expires in 28 hrs</span></td>
                <td style="padding:10px; color:var(--color-text-secondary);">Fridge A2, Shelf 1</td>
                <td style="padding:10px; text-align:right;"><button class="btn btn-primary btn-sm" onclick="alert('Assigned to Surgery Ward 3 via FEFO!')">Issue Unit</button></td>
              </tr>
              <tr style="border-bottom:1px solid var(--color-border-subtle); background:rgba(217,4,41,0.04);">
                <td style="padding:10px; font-family:monospace; font-weight:700;">BAG-2026-A109</td>
                <td style="padding:10px;"><span style="font-weight:800; color:#2A9D8F;">A+</span></td>
                <td style="padding:10px;">Platelets</td>
                <td style="padding:10px;"><span class="badge badge-urgent" style="font-size:10px;">Expires in 36 hrs</span></td>
                <td style="padding:10px; color:var(--color-text-secondary);">Agitator B1</td>
                <td style="padding:10px; text-align:right;"><button class="btn btn-primary btn-sm" onclick="alert('Assigned to ICU Bed 4 via FEFO!')">Issue Unit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
