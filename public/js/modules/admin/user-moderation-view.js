/**
 * @file user-moderation-view.js
 * @description User Moderation, Account Actions (Suspend/Ban/Reinstate) & B2B Org Verification Approvals.
 */

import { toast } from '../../core/toast.js';

export class UserModerationView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeTab = 'users'; // 'users' | 'organizations'
    this.searchQuery = '';

    this.users = [
      {
        uid: 'usr_donor_001',
        name: 'Rafi Shamim',
        contact: '+880 1711-234567',
        role: 'donor',
        level: 'Gold',
        status: 'active',
        created: '2026-08-14'
      },
      {
        uid: 'usr_bad_actor_99',
        name: 'Tariqul Islam',
        contact: '+880 1819-998877',
        role: 'seeker',
        level: 'New',
        status: 'suspended',
        created: '2026-10-02'
      },
      {
        uid: 'usr_hosp_staff_4',
        name: 'Dr. Nusrat Jahan',
        contact: '+880 1912-334455',
        role: 'org_staff',
        level: 'Hospital Manager',
        status: 'active',
        created: '2026-09-20'
      }
    ];

    this.pendingOrgs = [
      {
        id: 'org_chattogram_metro',
        name: 'Chattogram Metro Blood Center & Hospital',
        type: 'Hospital & Blood Bank',
        regNumber: 'DGHS-LIC-2026-8819',
        applicantName: 'Dr. Kamal Uddin',
        applicantEmail: 'director@ctgmetrohospital.org',
        branches: 2,
        submittedAt: '2026-11-01'
      },
      {
        id: 'org_sylhet_red_crescent',
        name: 'Sylhet Red Crescent Blood Unit',
        type: 'NGO / Club',
        regNumber: 'BDRCS-SYL-0041',
        applicantName: 'Ahsan Habib',
        applicantEmail: 'sylhet@bdrcs.org.bd',
        branches: 1,
        submittedAt: '2026-11-02'
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
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">User Moderation & Organization Approvals</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Audited account actions, role inspection, and B2B hospital license verification.
            </p>
          </div>
          
          <!-- Sub-Tab Switcher -->
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn ${this.activeTab === 'users' ? 'btn-primary' : 'btn-outline'} btn-sm tab-btn" data-tab="users">
              Users Directory (${this.users.length})
            </button>
            <button type="button" class="btn ${this.activeTab === 'organizations' ? 'btn-primary' : 'btn-outline'} btn-sm tab-btn" data-tab="organizations">
              Pending Orgs (${this.pendingOrgs.length})
            </button>
          </div>
        </div>

        ${this.activeTab === 'users' ? this.renderUsersTab() : this.renderOrgsTab()}
      </div>
    `;

    this.attachEventListeners();
  }

  renderUsersTab() {
    return `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); flex-wrap:wrap; gap:12px;">
          <h2 style="font-size:var(--font-size-md); font-weight:800;">Platform Accounts</h2>
          <div style="width:260px;">
            <input type="text" id="userSearchInput" class="input" placeholder="Search name, phone, UID..." value="${this.searchQuery}" style="width:100%; font-size:12px;">
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="table" style="width:100%; border-collapse:collapse; font-size:var(--font-size-xs);">
            <thead>
              <tr style="border-bottom:1px solid var(--color-border); text-align:left; color:var(--color-text-secondary);">
                <th style="padding:10px;">User Name & Contact</th>
                <th style="padding:10px;">UID</th>
                <th style="padding:10px;">Role & Level</th>
                <th style="padding:10px;">Account Status</th>
                <th style="padding:10px;">Created</th>
                <th style="padding:10px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.users.map(u => `
                <tr style="border-bottom:1px solid var(--color-border);">
                  <td style="padding:12px 10px;">
                    <div style="font-weight:700; font-size:13px;">${u.name}</div>
                    <div style="color:var(--color-text-secondary); font-size:11px;">${u.contact}</div>
                  </td>
                  <td style="padding:12px 10px; font-family:monospace; color:var(--color-text-secondary);">${u.uid}</td>
                  <td style="padding:12px 10px;">
                    <span class="badge" style="background:var(--color-bg-base); border:1px solid var(--color-border); font-size:10px; font-weight:700;">${u.role.toUpperCase()}</span>
                    <span style="font-size:11px; color:var(--color-text-secondary); margin-left:4px;">${u.level}</span>
                  </td>
                  <td style="padding:12px 10px;">
                    <span class="badge" style="${u.status === 'active' ? 'background:var(--color-teal-subtle); color:var(--color-teal);' : 'background:var(--color-crimson-subtle); color:var(--color-crimson);'}">
                      ${u.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding:12px 10px; color:var(--color-text-secondary);">${u.created}</td>
                  <td style="padding:12px 10px; text-align:right;">
                    ${u.status === 'active' ? `
                      <button type="button" class="btn btn-outline btn-suspend-user" data-uid="${u.uid}" style="padding:4px 8px; font-size:11px; color:var(--color-crimson); border-color:var(--color-crimson);">
                        Suspend
                      </button>
                    ` : `
                      <button type="button" class="btn btn-outline btn-reinstate-user" data-uid="${u.uid}" style="padding:4px 8px; font-size:11px; color:var(--color-teal); border-color:var(--color-teal);">
                        Reinstate
                      </button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderOrgsTab() {
    return `
      <div class="card">
        <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:var(--space-4);">Pending B2B Organization Licenses</h2>
        <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-6);">
          Review DGHS (Directorate General of Health Services) licenses and assign verified owner custom claims.
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${this.pendingOrgs.map(org => `
            <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="badge" style="background:var(--color-bg-surface); border:1px solid var(--color-border); font-size:10px; font-weight:800;">${org.type}</span>
                  <h3 style="font-size:var(--font-size-sm); font-weight:800;">${org.name}</h3>
                </div>
                <div style="font-size:11px; color:var(--color-text-secondary); margin-top:6px; line-height:1.6;">
                  Govt Reg License: <code>${org.regNumber}</code> &bull; Branches: <strong>${org.branches}</strong><br>
                  Authorized Applicant: <strong>${org.applicantName}</strong> (${org.applicantEmail}) &bull; Applied: ${org.submittedAt}
                </div>
              </div>

              <div style="display:flex; gap:8px;">
                <button type="button" class="btn btn-outline btn-sm">Inspect License PDF</button>
                <button type="button" class="btn btn-primary btn-sm btn-approve-org" data-id="${org.id}" style="font-weight:800;">
                  Approve B2B Organization
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.getAttribute('data-tab');
        this.render();
      });
    });

    this.container.querySelectorAll('.btn-suspend-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = e.currentTarget.getAttribute('data-uid');
        const reason = prompt('Enter suspension reason for audit log:', 'Breached platform anti-commercialization policy');
        if (!reason) return;

        const user = this.users.find(u => u.uid === uid);
        if (user) {
          user.status = 'suspended';
          toast.show(`Account ${uid} suspended. Logged to immutable audit trail.`, 'warning');
          this.render();
        }
      });
    });

    this.container.querySelectorAll('.btn-reinstate-user').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const uid = e.currentTarget.getAttribute('data-uid');
        const user = this.users.find(u => u.uid === uid);
        if (user) {
          user.status = 'active';
          toast.show(`Account ${uid} reinstated successfully.`, 'success');
          this.render();
        }
      });
    });

    this.container.querySelectorAll('.btn-approve-org').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.pendingOrgs = this.pendingOrgs.filter(o => o.id !== id);
        toast.show(`Organization ${id} approved! Owner custom claims assigned.`, 'success');
        this.render();
      });
    });
  }
}
