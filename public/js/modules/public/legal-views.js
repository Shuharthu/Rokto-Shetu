/**
 * @file legal-views.js
 * @description Terms of Service, Privacy Policy & Medical Disclaimer for RoktoSetu.
 */

export class LegalViews {
  constructor(containerId, initialTab = 'terms') {
    this.container = document.getElementById(containerId);
    this.activeTab = initialTab; // 'terms' | 'privacy' | 'disclaimer'
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:880px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:var(--space-8);">
          <span class="badge" style="background:var(--color-bg-base); border:1px solid var(--color-border); font-size:11px; font-weight:800; margin-bottom:8px;">
            LEGAL, ETHICS & COMPLIANCE
          </span>
          <h1 style="font-size:var(--font-size-3xl); font-weight:900;">Legal Terms & Ethics Charter</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
            Effective Date: November 2026 &bull; Compliant with Bangladesh ICT Act & WHO Blood Transfusion Guidelines
          </p>

          <!-- Tab Switcher -->
          <div style="display:inline-flex; gap:8px; margin-top:var(--space-6); background:var(--color-bg-surface); padding:4px; border-radius:var(--radius-full); border:1px solid var(--color-border);">
            <button type="button" class="btn ${this.activeTab === 'terms' ? 'btn-primary' : 'btn-outline'} btn-sm legal-tab" data-tab="terms" style="border-radius:var(--radius-full);">Terms of Service</button>
            <button type="button" class="btn ${this.activeTab === 'privacy' ? 'btn-primary' : 'btn-outline'} btn-sm legal-tab" data-tab="privacy" style="border-radius:var(--radius-full);">Privacy Policy</button>
            <button type="button" class="btn ${this.activeTab === 'disclaimer' ? 'btn-primary' : 'btn-outline'} btn-sm legal-tab" data-tab="disclaimer" style="border-radius:var(--radius-full);">Medical Disclaimer</button>
          </div>
        </div>

        <div class="card" style="padding:var(--space-8); line-height:1.8; font-size:var(--font-size-sm); color:var(--color-text-secondary);">
          ${this.renderActiveTab()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderActiveTab() {
    switch (this.activeTab) {
      case 'terms':
        return `
          <h2 style="font-size:var(--font-size-xl); font-weight:900; color:var(--color-text-primary); margin-bottom:16px;">1. Strict Anti-Commercialization Rule</h2>
          <p style="color:var(--color-crimson); font-weight:800; background:var(--color-crimson-subtle); padding:12px; border-radius:var(--radius-sm); margin-bottom:16px;">
            CRITICAL ETHICS CLAUSE: Under the laws of Bangladesh and international humanitarian law, blood is a gift of life and must NEVER be bought, sold, or demanded for monetary compensation.
          </p>
          <p>
            Any user attempting to charge a fee, demand cash payments, or act as an unlicensed blood broker will be immediately and permanently banned from RoktoSetu. Our automated moderation filters scan all chats and requests, and confirmed violations are forwarded to law enforcement authorities.
          </p>

          <h2 style="font-size:var(--font-size-xl); font-weight:900; color:var(--color-text-primary); margin:24px 0 16px;">2. User Conduct & Verification</h2>
          <p>
            You agree to provide true, accurate, and current information during the 5-step registration process, including valid National ID (NID) or Passport records. Impersonation of doctors, hospitals, or patients will result in account termination and legal action.
          </p>

          <h2 style="font-size:var(--font-size-xl); font-weight:900; color:var(--color-text-primary); margin:24px 0 16px;">3. Critical Patient Fundraisers</h2>
          <p>
            Fundraisers hosted on RoktoSetu are strictly for verified hospital medical treatment costs and are completely decoupled from blood donation matching. All campaign proceeds are held in audited escrow and released in tranches against hospital invoices.
          </p>
        `;

      case 'privacy':
        return `
          <h2 style="font-size:var(--font-size-xl); font-weight:900; color:var(--color-text-primary); margin-bottom:16px;">Privacy & Cryptographic Data Protection</h2>
          <p>
            RoktoSetu adheres to the highest global data privacy standards, applying privacy-by-design principles throughout our technical architecture.
          </p>

          <h3 style="font-size:var(--font-size-md); font-weight:800; color:var(--color-text-primary); margin:18px 0 8px;">1. National ID (NID) Encryption via Cloud KMS</h3>
          <p>
            Raw identification document numbers are encrypted immediately upon submission using Google Cloud KMS with hardware-backed AES-256-GCM encryption. De-identified salted SHA-256 hashes are used strictly for duplicate account detection.
          </p>

          <h3 style="font-size:var(--font-size-md); font-weight:800; color:var(--color-text-primary); margin:18px 0 8px;">2. Geohash Fuzzing & Donor Location Security</h3>
          <p>
            Your exact GPS coordinates are NEVER exposed to seekers or public viewers. The live map uses geohash precision 6 (~500m grid fuzzing). Your exact telephone number is ONLY revealed to a verified seeker after you explicitly accept their transfusion request.
          </p>
        `;

      case 'disclaimer':
        return `
          <h2 style="font-size:var(--font-size-xl); font-weight:900; color:var(--color-text-primary); margin-bottom:16px;">Medical Transfusion Disclaimer</h2>
          <p style="background:var(--color-bg-base); border-left:4px solid var(--color-teal); padding:12px; border-radius:var(--radius-sm); margin-bottom:16px;">
            <strong>RoktoSetu is a technology platform connecting voluntary donors with patients in need. RoktoSetu is not a medical clinic, hospital, or blood testing laboratory.</strong>
          </p>
          <p>
            All blood transfusions, pre-transfusion screenings (HIV, Hepatitis B/C, Syphilis, Malaria), cross-matching, and apheresis collections must strictly take place at authorized, licensed hospital facilities and government-registered blood transfusion centers.
          </p>
          <p>
            Neither RoktoSetu nor its developer team assumes liability for clinical transfusion reactions or medical complications. Both donors and recipients must comply with hospital attending physician directives.
          </p>
        `;
    }
  }

  attachEventListeners() {
    this.container.querySelectorAll('.legal-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.getAttribute('data-tab');
        this.render();
      });
    });
  }
}
