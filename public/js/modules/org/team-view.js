/**
 * @file team-view.js
 * @description Organization Team Roles, Multi-Branch Management, and Duty Rosters.
 */

import { toast } from '../../core/toast.js';

export class TeamView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.branches = [
      { id: 'b_main', name: 'Main Hospital Branch (Panchlaish)', units: 98, isMain: true },
      { id: 'b_agrabad', name: 'Agrabad Diagnostic Blood Center', units: 44, isMain: false }
    ];
    this.members = [
      { name: 'Dr. Anisur Rahman', email: 'anis@cmch.gov.bd', role: 'Owner', branch: 'Main Hospital' },
      { name: 'Nasrin Sultana', email: 'nasrin@cmch.gov.bd', role: 'Inventory Staff', branch: 'Main Hospital' },
      { name: 'Tareq Aziz', email: 'tareq@cmch.gov.bd', role: 'Coordinator', branch: 'Agrabad Center' }
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
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:4px;">Team Roles & Multi-Branch Network</h1>
          </div>

          <button type="button" class="btn btn-primary btn-sm" id="btnInviteMember">+ Invite Staff Member</button>
        </div>

        <!-- Branches Overview -->
        <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Hospital Branches</h2>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-8);">
          ${this.branches.map(b => `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <h3 style="font-size:var(--font-size-base); font-weight:700; margin:0;">${b.name}</h3>
                  ${b.isMain ? '<span class="badge badge-available" style="font-size:9px;">MAIN</span>' : ''}
                </div>
                <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:4px;">Stock: <b>${b.units} Bags</b> in blood bank</div>
              </div>
              <button type="button" class="btn btn-outline btn-sm" onclick="alert('Inter-branch transfer mode active.')">Transfer Units</button>
            </div>
          `).join('')}
        </div>

        <!-- Team Roster -->
        <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Authorized Personnel & Access Matrix</h2>
        <div class="card" style="padding:0; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); text-align:left;">
            <thead>
              <tr style="background:var(--color-bg-subtle); border-bottom:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted); text-transform:uppercase;">
                <th style="padding:12px;">Staff Member</th>
                <th style="padding:12px;">Email</th>
                <th style="padding:12px;">Assigned Role</th>
                <th style="padding:12px;">Primary Branch</th>
                <th style="padding:12px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.members.map(m => `
                <tr style="border-bottom:1px solid var(--color-border-subtle);">
                  <td style="padding:12px; font-weight:700;">${m.name}</td>
                  <td style="padding:12px; color:var(--color-text-secondary);">${m.email}</td>
                  <td style="padding:12px;">
                    <span class="badge" style="background:var(--color-bg-subtle); border:1px solid var(--color-border); font-size:11px;">
                      ${m.role}
                    </span>
                  </td>
                  <td style="padding:12px; color:var(--color-text-secondary);">${m.branch}</td>
                  <td style="padding:12px; text-align:right;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Editing permissions for ${m.name}')">Edit Role</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btnInviteMember')?.addEventListener('click', () => {
      const email = prompt('Enter staff member official email address:');
      if (email) {
        this.members.push({
          name: email.split('@')[0],
          email,
          role: 'Inventory Staff',
          branch: 'Main Hospital'
        });
        toast.success(`Invitation dispatched to ${email}! Custom claim will sync on signup.`);
        this.render();
      }
    });
  }
}
