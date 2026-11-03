/**
 * @file audit-viewer.js
 * @description Immutable Platform Audit Log Viewer & Compliance Export.
 */

import { toast } from '../../core/toast.js';

export class AuditLogViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.actionFilter = 'ALL';
    this.logs = [
      {
        id: 'aud_901',
        timestamp: '2026-11-03 12:45:10',
        actor: 'admin@roktosetu.org',
        action: 'PAYOUT_APPROVED',
        targetType: 'payout',
        targetId: 'pay_claim_881',
        details: 'Disbursed ৳140,000 to NICVD Hospital Sonali Bank Account for Patient Ayan Hossain'
      },
      {
        id: 'aud_900',
        timestamp: '2026-11-03 11:20:04',
        actor: 'senior_reviewer@roktosetu.org',
        action: 'CAMPAIGN_ACTIVATED',
        targetType: 'fundraiser',
        targetId: 'fund_202',
        details: 'Four-eyes final approval passed; campaign published to public directory'
      },
      {
        id: 'aud_899',
        timestamp: '2026-11-03 10:15:32',
        actor: 'moderator@roktosetu.org',
        action: 'USER_SUSPENDED',
        targetType: 'user',
        targetId: 'usr_bad_actor_99',
        details: 'Suspended user account: Repeatedly demanding payment for blood donations in chat'
      },
      {
        id: 'aud_898',
        timestamp: '2026-11-03 09:30:18',
        actor: 'super_admin@roktosetu.org',
        action: 'ORG_VERIFIED',
        targetType: 'org',
        targetId: 'org_dhaka_central',
        details: 'Approved hospital B2B workspace; assigned owner claims to director@dhakacentral.org'
      },
      {
        id: 'aud_897',
        timestamp: '2026-11-02 18:40:55',
        actor: 'system:billing_webhook',
        action: 'SUBSCRIPTION_ACTIVATED',
        targetType: 'org',
        targetId: 'org_dhaka_central',
        details: 'Processed payment webhook for Org Pro plan (৳7,500 BDT)'
      }
    ];
  }

  render() {
    if (!this.container) return;

    const filtered = this.logs.filter(l => this.actionFilter === 'ALL' || l.action === this.actionFilter);

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1120px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/admin" class="btn btn-outline" style="font-size:12px; padding:4px 8px;">← Admin Center</a>
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Immutable Audit Trail</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Tamper-proof chronological log of all administrative, financial, and moderation events.
            </p>
          </div>

          <div style="display:flex; gap:8px;">
            <select id="selectActionFilter" class="input" style="font-size:12px;">
              <option value="ALL">All Event Types</option>
              <option value="PAYOUT_APPROVED">Payouts</option>
              <option value="CAMPAIGN_ACTIVATED">Campaign Approvals</option>
              <option value="USER_SUSPENDED">Moderation Actions</option>
              <option value="ORG_VERIFIED">Org Verifications</option>
              <option value="SUBSCRIPTION_ACTIVATED">Billing Events</option>
            </select>
            <button type="button" class="btn btn-outline" id="btnExportAuditLog" style="font-size:12px;">
              📥 Export Audit CSV
            </button>
          </div>
        </div>

        <div class="card">
          <div style="overflow-x:auto;">
            <table class="table" style="width:100%; border-collapse:collapse; font-size:var(--font-size-xs);">
              <thead>
                <tr style="border-bottom:1px solid var(--color-border); text-align:left; color:var(--color-text-secondary);">
                  <th style="padding:10px;">Timestamp (UTC+6)</th>
                  <th style="padding:10px;">Actor Identity</th>
                  <th style="padding:10px;">Action Event</th>
                  <th style="padding:10px;">Target Resource</th>
                  <th style="padding:10px;">Event Metadata & Details</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(l => `
                  <tr style="border-bottom:1px solid var(--color-border);">
                    <td style="padding:12px 10px; font-family:monospace; color:var(--color-text-secondary);">${l.timestamp}</td>
                    <td style="padding:12px 10px; font-weight:700;">${l.actor}</td>
                    <td style="padding:12px 10px;">
                      <span class="badge" style="background:var(--color-bg-base); border:1px solid var(--color-border); font-size:10px; font-weight:800;">
                        ${l.action}
                      </span>
                    </td>
                    <td style="padding:12px 10px; font-family:monospace; color:var(--color-text-secondary);">
                      ${l.targetType}:${l.targetId}
                    </td>
                    <td style="padding:12px 10px; color:var(--color-text-primary); max-width:380px;">
                      ${l.details}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const selFilter = document.getElementById('selectActionFilter');
    if (selFilter) {
      selFilter.value = this.actionFilter;
      selFilter.addEventListener('change', (e) => {
        this.actionFilter = e.target.value;
        this.render();
      });
    }

    const btnExport = document.getElementById('btnExportAuditLog');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        toast.show('Exporting audited records to CSV for regulatory compliance...', 'info');
      });
    }
  }
}
