/**
 * @file auth-view.js
 * @description Accessible Authentication Modal & Form (Email/Password, Phone OTP, Google).
 */

import { t } from '../../core/i18n.js';
import { toast } from '../../core/toast.js';
import { modal } from '../../core/modal.js';
import { store } from '../../core/store.js';

export class AuthView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="modal-overlay" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="modal-content" style="max-width:440px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="/assets/logo-icon.svg" alt="RoktoSetu" style="height:32px; width:auto;">
              <h2 id="authTitle" style="font-size:var(--font-size-xl); font-weight:800;">Log in to RoktoSetu</h2>
            </div>
            <button type="button" class="btn-icon" id="btnCloseAuth" aria-label="Close dialog">&times;</button>
          </div>

          <!-- Auth Mode Tabs -->
          <div style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:var(--space-6);">
            <button type="button" class="tab-btn active" id="tabEmail" style="flex:1; padding:10px; font-weight:700; border-bottom:2px solid var(--color-crimson); color:var(--color-crimson);">
              Email
            </button>
            <button type="button" class="tab-btn" id="tabPhone" style="flex:1; padding:10px; font-weight:600; color:var(--color-text-secondary);">
              Phone OTP
            </button>
          </div>

          <!-- Email Login Form -->
          <form id="formEmailAuth">
            <div class="form-group">
              <label class="form-label">Email address</label>
              <input type="email" class="form-input" id="authEmail" placeholder="yourname@domain.com" required>
            </div>

            <div class="form-group">
              <div style="display:flex; justify-content:space-between;">
                <label class="form-label">Password</label>
                <a href="#/forgot-password" style="font-size:var(--font-size-xs); color:var(--color-crimson);">Forgot?</a>
              </div>
              <input type="password" class="form-input" id="authPassword" placeholder="••••••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block" style="margin-top:var(--space-4);">
              Log in
            </button>
          </form>

          <!-- Phone OTP Form (Hidden initially) -->
          <form id="formPhoneAuth" style="display:none;">
            <div class="form-group" id="phoneInputGroup">
              <label class="form-label">Mobile Number</label>
              <input type="tel" class="form-input" id="authPhone" placeholder="+88017XXXXXXXX" value="+8801712345678">
              <button type="button" class="btn btn-secondary btn-block" id="btnSendOtp" style="margin-top:8px;">
                Send 6-Digit OTP
              </button>
            </div>

            <div class="form-group" id="otpGroup" style="display:none;">
              <label class="form-label">Enter Verification Code</label>
              <input type="text" class="form-input" id="authOtp" placeholder="123456" maxlength="6" style="letter-spacing:4px; text-align:center; font-size:1.25rem;">
              <button type="submit" class="btn btn-primary btn-block" style="margin-top:8px;">
                Verify & Log in
              </button>
            </div>
          </form>

          <!-- Social Divider -->
          <div style="display:flex; align-items:center; gap:12px; margin:var(--space-6) 0;">
            <div style="flex:1; height:1px; background:var(--color-border);"></div>
            <span style="font-size:var(--font-size-xs); color:var(--color-text-muted);">OR</span>
            <div style="flex:1; height:1px; background:var(--color-border);"></div>
          </div>

          <!-- Google Auth Button -->
          <button type="button" class="btn btn-outline btn-block" id="btnGoogleAuth" style="gap:10px;">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
            Continue with Google
          </button>

          <!-- Register Link -->
          <div style="text-align:center; margin-top:var(--space-6); font-size:var(--font-size-xs); color:var(--color-text-secondary);">
            Don't have an account? <a href="#/register" id="linkToRegister" style="color:var(--color-crimson); font-weight:700;">Register here</a>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btnClose = document.getElementById('btnCloseAuth');
    const tabEmail = document.getElementById('tabEmail');
    const tabPhone = document.getElementById('tabPhone');
    const formEmail = document.getElementById('formEmailAuth');
    const formPhone = document.getElementById('formPhoneAuth');
    const btnSendOtp = document.getElementById('btnSendOtp');
    const otpGroup = document.getElementById('otpGroup');
    const btnGoogle = document.getElementById('btnGoogleAuth');
    const linkRegister = document.getElementById('linkToRegister');

    if (btnClose) btnClose.addEventListener('click', () => modal.close());

    if (tabEmail && tabPhone) {
      tabEmail.addEventListener('click', () => {
        tabEmail.classList.add('active');
        tabEmail.style.borderBottom = '2px solid var(--color-crimson)';
        tabEmail.style.color = 'var(--color-crimson)';
        tabPhone.classList.remove('active');
        tabPhone.style.borderBottom = 'none';
        tabPhone.style.color = 'var(--color-text-secondary)';
        formEmail.style.display = 'block';
        formPhone.style.display = 'none';
      });

      tabPhone.addEventListener('click', () => {
        tabPhone.classList.add('active');
        tabPhone.style.borderBottom = '2px solid var(--color-crimson)';
        tabPhone.style.color = 'var(--color-crimson)';
        tabEmail.classList.remove('active');
        tabEmail.style.borderBottom = 'none';
        tabEmail.style.color = 'var(--color-text-secondary)';
        formPhone.style.display = 'block';
        formEmail.style.display = 'none';
      });
    }

    if (btnSendOtp) {
      btnSendOtp.addEventListener('click', () => {
        const phone = document.getElementById('authPhone')?.value;
        if (!phone) {
          toast.error('Please enter a valid phone number');
          return;
        }
        toast.info('Simulated SMS OTP dispatched: [123456]');
        document.getElementById('phoneInputGroup').style.display = 'none';
        otpGroup.style.display = 'block';
        document.getElementById('authOtp').value = '123456';
      });
    }

    if (formEmail) {
      formEmail.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail')?.value;
        store.setUser({
          displayName: email.split('@')[0],
          email,
          role: 'donor',
          verificationStatus: 'verified'
        });
        toast.success(`Welcome back, ${email.split('@')[0]}!`);
        modal.close();
      });
    }

    if (formPhone) {
      formPhone.addEventListener('submit', (e) => {
        e.preventDefault();
        store.setUser({
          displayName: 'Phone User',
          phone: document.getElementById('authPhone')?.value,
          role: 'donor',
          verificationStatus: 'verified'
        });
        toast.success('Phone verified successfully!');
        modal.close();
      });
    }

    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        store.setUser({
          displayName: 'Google Verified User',
          email: 'user@google.com',
          role: 'donor',
          verificationStatus: 'verified'
        });
        toast.success('Signed in via Google successfully!');
        modal.close();
      });
    }

    if (linkRegister) {
      linkRegister.addEventListener('click', () => {
        modal.close();
      });
    }
  }
}
