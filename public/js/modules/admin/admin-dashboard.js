/**
 * @file admin-dashboard.js
 * @description Central Unified Platform Administration Console for RoktoSetu Platform Staff.
 */

export class PlatformAdminDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.kpis = {
      totalDonors: '14,820',
      verifiedDonors: '12,450',
      activeRequests: '48',
      activeHospitals: '84',
      totalInventoryUnits: '3,420',
      activeFundraisers: '16',
      totalEscrowBalanceBDT: '4,850,000'
    };
    this.divisions = [
      { name: 'Dhaka', donors: 6240, requests: 28, inventory: 1820, status: 'high_demand' },
      { name: 'Chattogram', donors: 3120, requests: 12, inventory: 740, status: 'balanced' },
      { name: 'Rajshahi', donors: 1450, requests: 4, inventory: 310, status: 'surplus' },
      { name: 'Khulna', donors: 1180, requests: 3, inventory: 240, status: 'surplus' },
      { name: 'Barishal', donors: 720, requests: 2, inventory: 95, status: 'surplus' },
      { name: 'Sylhet', donors: 980, requests: 5, inventory: 115, status: 'balanced' },
      { name: 'Rangpur', donors: 610, requests: 2, inventory: 60, status: 'surplus' },
      { name: 'Mymensingh', donors: 520, requests: 1, inventory: 40, status: 'surplus' }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1180px;">
        <!-- Top Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background:var(--color-crimson); color:white; font-size:11px; font-weight:800;">
                SUPER-ADMIN CONSOLE
              </span>
              <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:11px; font-weight:700;">
                Production Health: 99.98%
              </span>
            </div>
            <h1 style="font-size:var(--font-size-3xl); font-weight:900; margin-top:6px;">RoktoSetu National Operations Center</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:2px;">
              Cross-pillar oversight for community blood donors, B2B hospital networks, and audited patient fundraisers.
            </p>
          </div>

          <!-- Quick Navigation Bar -->
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <a href="#/admin/moderation" class="btn btn-outline btn-sm">User & Org Moderation</a>
            <a href="#/verify-queue" class="btn btn-outline btn-sm">ID Verifier Queue</a>
            <a href="#/verify/CERT-2026-DEMO01" class="btn btn-outline btn-sm">Cert Registry</a>
            <a href="#/admin/fundraisers" class="btn btn-outline btn-sm">4-Eyes Fundraiser Queue</a>
            <a href="#/admin/audit" class="btn btn-outline btn-sm">Audit Trail</a>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-8);">
          <div class="card" style="border-left:4px solid var(--color-crimson);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">National Donors</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">${this.kpis.totalDonors}</div>
            <div style="font-size:11px; color:var(--color-teal); font-weight:700; margin-top:4px;">${this.kpis.verifiedDonors} NID Verified (84%)</div>
          </div>

          <div class="card" style="border-left:4px solid var(--color-teal);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Hospital Network</div>
            <div style="font-size:2rem; font-weight:900; color:var(--color-teal); margin-top:4px;">${this.kpis.activeHospitals}</div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">${this.kpis.totalInventoryUnits} Units Tracked via FEFO</div>
          </div>

          <div class="card" style="border-left:4px solid #3B82F6);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Critical Fundraisers</div>
            <div style="font-size:2rem; font-weight:900; color:#3B82F6; margin-top:4px;">${this.kpis.activeFundraisers} Active</div>
            <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">৳ ${this.kpis.totalEscrowBalanceBDT} in audited escrow</div>
          </div>

          <div class="card" style="border-left:4px solid #F59E0B);">
            <div style="font-size:11px; color:var(--color-text-secondary); text-transform:uppercase; font-weight:700;">Urgent Seekers</div>
            <div style="font-size:2rem; font-weight:900; color:#F59E0B; margin-top:4px;">${this.kpis.activeRequests}</div>
            <div style="font-size:11px; color:var(--color-teal); font-weight:700; margin-top:4px;">Avg Match Velocity: 8.4 mins</div>
          </div>
        </div>

        <!-- Heatmap: 8 Divisions Supply vs Demand -->
        <div class="card" style="margin-bottom:var(--space-8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); flex-wrap:wrap; gap:8px;">
            <div>
              <h2 style="font-size:var(--font-size-lg); font-weight:800;">Bangladesh 8-Division Supply vs Demand Heatmap</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:2px;">
                Real-time regional blood availability and active patient transfusion requests.
              </p>
            </div>
            <span class="badge" style="background:var(--color-bg-base); border:1px solid var(--color-border); font-size:11px;">
              Live Geo-Clustering Active
            </span>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
            ${this.divisions.map(d => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:14px; background:var(--color-bg-base); display:flex; flex-direction:column; justify-content:space-between;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <strong style="font-size:14px;">${d.name} Division</strong>
                  <span class="badge" style="font-size:10px; font-weight:800; ${
                    d.status === 'high_demand' ? 'background:var(--color-crimson-subtle); color:var(--color-crimson);' :
                    d.status === 'balanced' ? 'background:#FFF3CD; color:#856404;' :
                    'background:var(--color-teal-subtle); color:var(--color-teal);'
                  }">
                    ${d.status === 'high_demand' ? 'HIGH DEMAND' : d.status === 'balanced' ? 'BALANCED' : 'SAFE SURPLUS'}
                  </span>
                </div>
                
                <div style="margin-top:12px; display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px;">
                  <div>
                    <span style="color:var(--color-text-secondary); font-size:10px; display:block;">Donors</span>
                    <strong>${d.donors.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-secondary); font-size:10px; display:block;">Active Requests</span>
                    <strong style="color:var(--color-crimson);">${d.requests}</strong>
                  </div>
                  <div style="grid-column:1/-1; padding-top:6px; border-top:1px dashed var(--color-border); display:flex; justify-content:space-between;">
                    <span style="color:var(--color-text-secondary); font-size:11px;">Hospital Inventory:</span>
                    <span style="font-weight:700; font-size:11px; color:var(--color-teal);">${d.inventory} Bags</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Infrastructure & Security Health Cards -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6);">
          <div class="card">
            <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:12px;">Infrastructure & Telephony Health</h3>
            <div style="display:flex; flex-direction:column; gap:10px; font-size:var(--font-size-xs);">
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--color-bg-base); border-radius:var(--radius-sm);">
                <span>SMS Gateway Balance (Banglalink / Grameenphone):</span>
                <strong style="color:var(--color-teal);">48,250 Credits Available</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--color-bg-base); border-radius:var(--radius-sm);">
                <span>App Check (reCAPTCHA Enterprise):</span>
                <strong style="color:var(--color-teal);">Enforced (99.8% valid tokens)</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--color-bg-base); border-radius:var(--radius-sm);">
                <span>Cloud KMS Key State:</span>
                <strong style="color:var(--color-teal);">AES-256-GCM Active & Audited</strong>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:12px;">Staff Quick Actions</h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <a href="#/verify-queue" class="btn btn-outline" style="font-size:12px; text-align:left;">
                🛡️ Review Pending NID & Identity Documents (8 in queue)
              </a>
              <a href="#/verify/CERT-2026-DEMO01" class="btn btn-outline" style="font-size:12px; text-align:left;">
                📜 Certificate Registry & Anti-Forgery QR Verification
              </a>
              <a href="#/admin/fundraisers" class="btn btn-outline" style="font-size:12px; text-align:left;">
                🏥 Review Medical Fundraisers (4-Eyes Approval Queue)
              </a>
              <a href="#/admin/moderation" class="btn btn-outline" style="font-size:12px; text-align:left;">
                👥 Manage User Roles & Organization Permissions
              </a>
              <a href="#/admin/audit" class="btn btn-outline" style="font-size:12px; text-align:left;">
                📜 View Tamper-Proof Audit Trail
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
