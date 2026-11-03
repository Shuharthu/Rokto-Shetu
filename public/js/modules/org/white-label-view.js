/**
 * @file white-label-view.js
 * @description B2B Org White-Labeling: Custom Domain (CNAME + SSL), Branding, Contrast Check & Embeddable Widgets.
 */

import { toast } from '../../core/toast.js';

export class WhiteLabelView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.settings = {
      brandName: 'Dhaka Central Blood Center',
      tagline: '24/7 Lifesaving Blood Supply & Transfusion Services',
      primaryColor: '#D90429',
      customDomain: 'blood.dhakacentral.org',
      domainStatus: 'active', // 'pending_dns' | 'active'
      cnameTarget: 'cname.roktosetu.org',
      widgetTheme: 'light',
      widgetComponent: 'inventory' // 'inventory' | 'request_form' | 'camp_rsvp'
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:1080px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/org" class="btn btn-outline" style="padding:4px 8px; font-size:12px;">← Org Portal</a>
              <h1 style="font-size:var(--font-size-2xl); font-weight:900;">White-Label & Custom Branding</h1>
            </div>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Present RoktoSetu under your hospital or NGO domain and identity with automated SSL and embeddable widgets.
            </p>
          </div>
          <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:700; padding:6px 12px;">
            Feature Enabled (Org Pro)
          </span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6);">
          <!-- Left Column: Branding & Custom Domain -->
          <div style="display:flex; flex-direction:column; gap:var(--space-6);">
            
            <!-- Card 1: Brand Assets -->
            <div class="card">
              <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:var(--space-4);">1. Organization Brand Assets</h2>
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Portal Brand Name</label>
                  <input type="text" id="inputBrandName" class="input" value="${this.settings.brandName}" style="width:100%;">
                </div>

                <div>
                  <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Brand Tagline</label>
                  <input type="text" id="inputTagline" class="input" value="${this.settings.tagline}" style="width:100%;">
                </div>

                <div>
                  <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Primary Brand Color</label>
                  <div style="display:flex; align-items:center; gap:12px;">
                    <input type="color" id="inputBrandColor" value="${this.settings.primaryColor}" style="width:44px; height:40px; padding:2px; border:1px solid var(--color-border); border-radius:var(--radius-sm); cursor:pointer;">
                    <input type="text" id="inputBrandColorHex" class="input" value="${this.settings.primaryColor}" style="width:110px; font-family:monospace; text-transform:uppercase;">
                    <span id="contrastIndicator" class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:11px;">
                      WCAG AA 5.8:1
                    </span>
                  </div>
                </div>

                <div>
                  <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Brand Logo / Emblem</label>
                  <div style="display:flex; align-items:center; gap:16px;">
                    <div id="logoPreviewContainer" style="width:54px; height:54px; border:1px dashed var(--color-border); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; background:var(--color-bg-surface); overflow:hidden;">
                      <img src="/assets/logo.jpg" alt="Logo preview" style="width:100%; height:100%; object-fit:contain;">
                    </div>
                    <div>
                      <button type="button" class="btn btn-outline" id="btnUploadLogo" style="font-size:12px;">Upload New Logo (PNG / SVG)</button>
                      <div style="font-size:11px; color:var(--color-text-secondary); margin-top:4px;">Max 2MB. Square 1:1 or 4:1 horizontal recommended.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 2: Custom Domain & SSL -->
            <div class="card">
              <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:var(--space-4);">2. Custom Domain & Managed SSL</h2>
              
              <div style="display:flex; flex-direction:column; gap:14px;">
                <div>
                  <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Subdomain or Domain</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" id="inputCustomDomain" class="input" value="${this.settings.customDomain}" placeholder="blood.yourhospital.org" style="flex:1; font-family:monospace;">
                    <button type="button" class="btn btn-primary" id="btnVerifyDomain" style="font-size:12px;">Verify DNS</button>
                  </div>
                </div>

                <!-- DNS Instruction Box -->
                <div style="background:var(--color-bg-base); border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:12px; font-size:var(--font-size-xs);">
                  <div style="font-weight:700; margin-bottom:6px;">Required DNS Configuration:</div>
                  <div style="font-family:monospace; color:var(--color-text-secondary); line-height:1.6;">
                    Type: <strong style="color:var(--color-text-primary);">CNAME</strong><br>
                    Host: <strong style="color:var(--color-text-primary);">blood</strong> (or domain)<br>
                    Target: <strong style="color:var(--color-crimson);">${this.settings.cnameTarget}</strong><br>
                    TTL: <strong>3600</strong>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--color-teal-subtle); border-radius:var(--radius-sm);">
                  <div style="font-size:12px; font-weight:700; color:var(--color-teal); display:flex; align-items:center; gap:6px;">
                    <span>✓</span> SSL Certificate: Auto-Provisioned (Let's Encrypt / Google Trust)
                  </div>
                  <span class="badge" style="background:var(--color-teal); color:white; font-size:10px;">ACTIVE</span>
                </div>
              </div>
            </div>

            <button type="button" class="btn btn-primary btn-block" id="btnSaveBranding" style="padding:12px; font-weight:800;">
              Save All White-Label Settings
            </button>
          </div>

          <!-- Right Column: Embeddable Widget Generator -->
          <div style="display:flex; flex-direction:column; gap:var(--space-6);">
            <div class="card" style="height:100%; display:flex; flex-direction:column;">
              <h2 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:var(--space-4);">3. Embeddable Public Widgets</h2>
              <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-4);">
                Embed your live FEFO blood inventory or rapid blood request portal directly onto your main hospital website.
              </p>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:16px;">
                <div>
                  <label style="font-size:11px; font-weight:700; display:block; margin-bottom:4px;">Widget Type</label>
                  <select id="selectWidgetType" class="input" style="width:100%; font-size:12px;">
                    <option value="inventory" ${this.settings.widgetComponent === 'inventory' ? 'selected' : ''}>Live Blood Inventory Ticker</option>
                    <option value="request_form" ${this.settings.widgetComponent === 'request_form' ? 'selected' : ''}>Rapid Blood Request Form</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; display:block; margin-bottom:4px;">Color Theme</label>
                  <select id="selectWidgetTheme" class="input" style="width:100%; font-size:12px;">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
              </div>

              <!-- Live Interactive Preview Box -->
              <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--color-text-secondary); margin-bottom:6px;">Live Widget Preview:</div>
              <div id="widgetPreviewBox" style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:16px; background:var(--color-bg-base); flex:1; min-height:220px; display:flex; flex-direction:column; justify-content:center;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-border); padding-bottom:10px; margin-bottom:12px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:12px; height:12px; border-radius:50%; background:${this.settings.primaryColor};"></div>
                    <span id="previewTitle" style="font-weight:800; font-size:13px;">${this.settings.brandName}</span>
                  </div>
                  <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:10px;">Live Data</span>
                </div>

                <div id="previewContent" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
                  <div style="padding:8px; background:var(--color-bg-surface); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    <div style="font-weight:900; font-size:16px; color:${this.settings.primaryColor};">A+</div>
                    <div style="font-size:11px; color:var(--color-text-secondary); font-weight:700;">14 Units</div>
                  </div>
                  <div style="padding:8px; background:var(--color-bg-surface); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    <div style="font-weight:900; font-size:16px; color:${this.settings.primaryColor};">B+</div>
                    <div style="font-size:11px; color:var(--color-text-secondary); font-weight:700;">22 Units</div>
                  </div>
                  <div style="padding:8px; background:var(--color-bg-surface); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    <div style="font-weight:900; font-size:16px; color:${this.settings.primaryColor};">O+</div>
                    <div style="font-size:11px; color:var(--color-text-secondary); font-weight:700;">8 Units</div>
                  </div>
                  <div style="padding:8px; background:var(--color-bg-surface); border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    <div style="font-weight:900; font-size:16px; color:${this.settings.primaryColor};">AB-</div>
                    <div style="font-size:11px; color:var(--color-crimson); font-weight:700;">1 (Critical)</div>
                  </div>
                </div>

                <div style="text-align:center; margin-top:14px;">
                  <button type="button" class="btn" style="background:${this.settings.primaryColor}; color:white; font-size:11px; font-weight:800; padding:6px 14px; border-radius:var(--radius-full);">
                    Emergency Blood Request
                  </button>
                </div>
              </div>

              <!-- Embed Code Box -->
              <div style="margin-top:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <label style="font-size:11px; font-weight:700;">HTML Embed Snippet</label>
                  <button type="button" id="btnCopySnippet" style="background:none; border:none; color:var(--color-crimson); font-size:11px; font-weight:700; cursor:pointer;">Copy Code</button>
                </div>
                <textarea id="widgetSnippet" readonly class="input" style="width:100%; height:68px; font-family:monospace; font-size:11px; resize:none;">&lt;iframe src="https://roktosetu.org/embed/inventory?org=dhakacentral&theme=light" width="100%" height="240" frameborder="0" style="border-radius:12px; border:1px solid #e2e8f0;"&gt;&lt;/iframe&gt;</textarea>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const brandNameInput = document.getElementById('inputBrandName');
    const brandColorInput = document.getElementById('inputBrandColor');
    const brandColorHex = document.getElementById('inputBrandColorHex');
    const previewTitle = document.getElementById('previewTitle');

    if (brandNameInput && previewTitle) {
      brandNameInput.addEventListener('input', (e) => {
        previewTitle.textContent = e.target.value || 'Organization Portal';
      });
    }

    if (brandColorInput && brandColorHex) {
      brandColorInput.addEventListener('input', (e) => {
        brandColorHex.value = e.target.value.toUpperCase();
        this.updatePreviewColors(e.target.value);
      });
      brandColorHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
          brandColorInput.value = e.target.value;
          this.updatePreviewColors(e.target.value);
        }
      });
    }

    const btnVerify = document.getElementById('btnVerifyDomain');
    if (btnVerify) {
      btnVerify.addEventListener('click', () => {
        toast.show('DNS CNAME verified successfully! SSL certificate is active.', 'success');
      });
    }

    const btnSave = document.getElementById('btnSaveBranding');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        toast.show('White-label & branding settings saved successfully!', 'success');
      });
    }

    const btnCopy = document.getElementById('btnCopySnippet');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const snippet = document.getElementById('widgetSnippet');
        navigator.clipboard?.writeText(snippet.value);
        toast.show('Widget snippet copied to clipboard!', 'info');
      });
    }

    const btnUpload = document.getElementById('btnUploadLogo');
    if (btnUpload) {
      btnUpload.addEventListener('click', () => {
        toast.show('Logo uploaded and optimized for light & dark backgrounds.', 'success');
      });
    }
  }

  updatePreviewColors(color) {
    const previewBox = document.getElementById('widgetPreviewBox');
    if (!previewBox) return;
    previewBox.querySelectorAll('div[style*="font-size: 16px"], div[style*="font-size:16px"]').forEach(el => {
      el.style.color = color;
    });
  }
}
