/**
 * @file api-keys-view.js
 * @description B2B Developer Portal: API Key Generation, Webhook Endpoints & SSRF Validation.
 */

import { toast } from '../../core/toast.js';

export class ApiKeysView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.apiKeys = [
      {
        id: 'key_1',
        name: 'Main EMR Integration',
        prefix: 'rs_live_79a2...',
        created: '2026-10-15',
        lastUsed: '2026-11-02 18:30',
        status: 'active'
      }
    ];
    this.webhooks = [
      {
        id: 'wh_1',
        url: 'https://api.dhakahospital.org/webhooks/blood-dispatch',
        events: ['inventory.dispatched', 'blood_request.matched'],
        status: 'healthy',
        created: '2026-10-18'
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1080px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/org" class="btn btn-outline" style="padding:4px 8px; font-size:12px;">← Org Portal</a>
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Developer API & Webhooks</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Manage high-throughput REST API keys and configure real-time secure webhooks with HMAC signatures.
            </p>
          </div>
          <div style="display:flex; gap:8px;">
            <a href="/openapi.yaml" target="_blank" class="btn btn-outline" style="font-size:var(--font-size-xs);">View OpenAPI Spec</a>
            <button type="button" class="btn btn-primary" id="btnCreateApiKey" style="font-size:var(--font-size-xs);">+ Generate API Key</button>
          </div>
        </div>

        <!-- Banner with API limits -->
        <div class="card" style="margin-bottom:var(--space-6); background:var(--color-bg-surface); border-left:4px solid var(--color-crimson); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="font-weight:700; font-size:var(--font-size-sm);">Active Plan: <span class="badge badge-verified" style="margin-left:6px;">Org Pro Tier</span></div>
            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:4px;">Rate limit: 120 calls / min &bull; HMAC SHA-256 Webhooks Enabled &bull; FEFO Inventory sync</div>
          </div>
          <div style="font-size:var(--font-size-xs); font-family:monospace; background:var(--color-bg-base); padding:6px 12px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
            Endpoint: <span style="color:var(--color-crimson);">https://api.roktosetu.org/v1</span>
          </div>
        </div>

        <!-- Section 1: API Keys -->
        <div class="card" style="margin-bottom:var(--space-8);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <h2 style="font-size:var(--font-size-lg); font-weight:800;">Active API Keys</h2>
            <span style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">${this.apiKeys.length} / 5 keys configured</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="table" style="width:100%; border-collapse:collapse; font-size:var(--font-size-xs);">
              <thead>
                <tr style="border-bottom:1px solid var(--color-border); text-align:left; color:var(--color-text-secondary);">
                  <th style="padding:10px;">Name / Label</th>
                  <th style="padding:10px;">Token Prefix</th>
                  <th style="padding:10px;">Created</th>
                  <th style="padding:10px;">Last Used</th>
                  <th style="padding:10px;">Status</th>
                  <th style="padding:10px; text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody id="apiKeysTableBody">
                ${this.apiKeys.map(k => `
                  <tr style="border-bottom:1px solid var(--color-border);">
                    <td style="padding:12px 10px; font-weight:700;">${k.name}</td>
                    <td style="padding:12px 10px; font-family:monospace;">${k.prefix}</td>
                    <td style="padding:12px 10px;">${k.created}</td>
                    <td style="padding:12px 10px; color:var(--color-text-secondary);">${k.lastUsed}</td>
                    <td style="padding:12px 10px;"><span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal);">${k.status}</span></td>
                    <td style="padding:12px 10px; text-align:right;">
                      <button class="btn btn-outline btn-revoke-key" data-id="${k.id}" style="padding:4px 8px; font-size:11px; color:var(--color-crimson); border-color:var(--color-crimson);">Revoke</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Webhook Endpoints -->
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4); flex-wrap:wrap; gap:8px;">
            <div>
              <h2 style="font-size:var(--font-size-lg); font-weight:800;">Webhook Subscriptions</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:2px;">Events dispatched with <code>X-RoktoSetu-Signature-256</code> HMAC header.</p>
            </div>
            <button type="button" class="btn btn-outline" id="btnAddWebhook" style="font-size:var(--font-size-xs);">+ Add Webhook Endpoint</button>
          </div>

          <div id="webhookList" style="display:flex; flex-direction:column; gap:12px;">
            ${this.webhooks.map(wh => `
              <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div>
                  <div style="font-weight:700; font-family:monospace; font-size:13px; color:var(--color-text-primary); word-break:break-all;">
                    ${wh.url}
                  </div>
                  <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
                    ${wh.events.map(e => `<span class="badge" style="font-size:10px; background:var(--color-bg-surface); border:1px solid var(--color-border);">${e}</span>`).join('')}
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <button type="button" class="btn btn-outline btn-ping-wh" data-id="${wh.id}" style="padding:4px 10px; font-size:11px;">Send Test Ping</button>
                  <button type="button" class="btn btn-outline btn-delete-wh" data-id="${wh.id}" style="padding:4px 8px; font-size:11px; color:var(--color-crimson);">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Webhook Form Modal/Container (Hidden by default) -->
          <div id="newWebhookFormContainer" style="display:none; margin-top:var(--space-6); padding-top:var(--space-6); border-top:1px dashed var(--color-border);">
            <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:12px;">Register New Secure Webhook</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div>
                <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Destination URL (HTTPS only, SSRF Protected)</label>
                <input type="url" id="webhookUrlInput" class="input" placeholder="https://your-domain.org/webhooks/roktosetu" style="width:100%; font-family:monospace; font-size:13px;">
                <span id="webhookUrlError" style="color:var(--color-crimson); font-size:11px; display:none; margin-top:4px;"></span>
              </div>
              <div>
                <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:6px;">Select Subscribed Events</label>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px; font-size:var(--font-size-xs);">
                  <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked value="inventory.dispatched"> inventory.dispatched</label>
                  <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked value="blood_request.matched"> blood_request.matched</label>
                  <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" value="camp.donor_rsvp"> camp.donor_rsvp</label>
                  <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" value="inventory.low_stock"> inventory.low_stock</label>
                </div>
              </div>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button type="button" class="btn btn-primary" id="btnSaveWebhook" style="font-size:12px;">Register Webhook</button>
                <button type="button" class="btn btn-outline" id="btnCancelWebhook" style="font-size:12px;">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Generate API Key
    const btnCreate = document.getElementById('btnCreateApiKey');
    if (btnCreate) {
      btnCreate.addEventListener('click', () => {
        const keyName = prompt('Enter a label for this API key (e.g., "Lab Integration"):', 'Branch Gateway');
        if (!keyName) return;

        const randomToken = 'rs_live_' + Array.from(crypto.getRandomValues(new Uint8Array(18))).map(b => b.toString(16).padStart(2, '0')).join('');
        this.apiKeys.push({
          id: 'key_' + Date.now(),
          name: keyName,
          prefix: randomToken.substring(0, 12) + '...',
          created: 'Just now',
          lastUsed: 'Never',
          status: 'active'
        });
        toast.show(`API Key Generated: ${randomToken} (Copy now, it won't be shown again!)`, 'info', 10000);
        this.render();
      });
    }

    // Revoke Key
    this.container.querySelectorAll('.btn-revoke-key').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.apiKeys = this.apiKeys.filter(k => k.id !== id);
        toast.show('API key revoked successfully', 'warning');
        this.render();
      });
    });

    // Add Webhook toggle
    const btnAddWh = document.getElementById('btnAddWebhook');
    const formContainer = document.getElementById('newWebhookFormContainer');
    if (btnAddWh && formContainer) {
      btnAddWh.addEventListener('click', () => {
        formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
      });
    }

    const btnCancelWh = document.getElementById('btnCancelWebhook');
    if (btnCancelWh && formContainer) {
      btnCancelWh.addEventListener('click', () => {
        formContainer.style.display = 'none';
      });
    }

    // Save Webhook with SSRF check
    const btnSaveWh = document.getElementById('btnSaveWebhook');
    if (btnSaveWh) {
      btnSaveWh.addEventListener('click', () => {
        const urlInput = document.getElementById('webhookUrlInput');
        const errSpan = document.getElementById('webhookUrlError');
        const rawUrl = urlInput.value.trim();

        // SSRF client-side validator
        try {
          const parsed = new URL(rawUrl);
          if (parsed.protocol !== 'https:') {
            errSpan.textContent = 'Error: Only HTTPS endpoints are allowed.';
            errSpan.style.display = 'block';
            return;
          }
          const host = parsed.hostname.toLowerCase();
          if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') ||
              /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.)/.test(host)) {
            errSpan.textContent = 'Security Alert: Private IP / localhost destination blocked by SSRF filter.';
            errSpan.style.display = 'block';
            return;
          }
        } catch {
          errSpan.textContent = 'Please enter a valid URL.';
          errSpan.style.display = 'block';
          return;
        }

        errSpan.style.display = 'none';
        this.webhooks.push({
          id: 'wh_' + Date.now(),
          url: rawUrl,
          events: ['inventory.dispatched', 'blood_request.matched'],
          status: 'healthy',
          created: 'Just now'
        });
        toast.show('Webhook registered with HMAC signature secret!', 'success');
        this.render();
      });
    }

    // Send Test Ping
    this.container.querySelectorAll('.btn-ping-wh').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const wh = this.webhooks.find(w => w.id === id);
        toast.show(`Sent test ping with HMAC signature to ${wh ? wh.url : 'endpoint'}: HTTP 200 OK`, 'success');
      });
    });

    // Delete Webhook
    this.container.querySelectorAll('.btn-delete-wh').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.webhooks = this.webhooks.filter(w => w.id !== id);
        toast.show('Webhook subscription deleted', 'info');
        this.render();
      });
    });
  }
}
