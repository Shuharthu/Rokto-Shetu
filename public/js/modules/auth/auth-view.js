/**
 * @file auth-view.js
 * @description Accessible Authentication Modal & Form (Email/Password, Phone OTP, Google).
 * Connected directly with Firebase Authentication Client SDK with seamless mock fallback.
 */

import { t } from '../../core/i18n.js';
import { toast } from '../../core/toast.js';
import { modal } from '../../core/modal.js';
import { store } from '../../core/store.js';
import {
  signInWithEmail,
  signInWithGoogle,
  sendPhoneOtp,
  confirmPhoneOtp
} from '../../core/firebase.js';

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
              <label class="form-label" for="authEmail">Email address</label>
              <input type="email" class="form-input" id="authEmail" placeholder="yourname@domain.com" autocomplete="email" required>
            </div>

            <div class="form-group">
              <div style="display:flex; justify-content:space-between;">
                <label class="form-label" for="authPassword">Password</label>
                <a href="#/forgot-password" style="font-size:var(--font-size-xs); color:var(--color-crimson);">Forgot?</a>
              </div>
              <input type="password" class="form-input" id="authPassword" placeholder="••••••••••••" autocomplete="current-password" required>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitEmailAuth" style="margin-top:var(--space-4);">
              Log in / Continue
            </button>
          </form>

          <!-- Phone OTP Form (Hidden initially) -->
          <form id="formPhoneAuth" style="display:none;">
            <div class="form-group" id="phoneInputGroup">
              <label class="form-label" for="authPhone">Mobile Number (Bangladesh +880)</label>
              <input type="tel" class="form-input" id="authPhone" placeholder="+88017XXXXXXXX" value="+8801712345678" autocomplete="tel">
              <div id="recaptcha-container" style="margin-top:8px;"></div>
              <button type="button" class="btn btn-secondary btn-block" id="btnSendOtp" style="margin-top:8px;">
                Send 6-Digit SMS OTP
              </button>
            </div>

            <div class="form-group" id="otpGroup" style="display:none;">
              <label class="form-label" for="authOtp">Enter Verification Code</label>
              <input type="text" class="form-input" id="authOtp" placeholder="123456" maxlength="6" inputmode="numeric" style="letter-spacing:4px; text-align:center; font-size:1.25rem;">
              <button type="submit" class="btn btn-primary btn-block" id="btnVerifyOtp" style="margin-top:8px;">
                Verify & Log in
              </button>
              <button type="button" class="btn btn-link btn-block" id="btnResendOtp" style="margin-top:4px; font-size:var(--font-size-xs);">
                Back / Change Number
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
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
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
    const btnResendOtp = document.getElementById('btnResendOtp');
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

    if (btnResendOtp) {
      btnResendOtp.addEventListener('click', () => {
        document.getElementById('phoneInputGroup').style.display = 'block';
        otpGroup.style.display = 'none';
      });
    }

    // Email / Password Form Submit
    if (formEmail) {
      formEmail.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail')?.value.trim();
        const password = document.getElementById('authPassword')?.value;
        const btnSubmit = document.getElementById('btnSubmitEmailAuth');

        if (!email || !password) {
          toast.error('Please enter both email and password.');
          return;
        }

        const originalText = btnSubmit ? btnSubmit.textContent : '';
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.textContent = 'Authenticating...';
        }

        try {
          const result = await signInWithEmail(email, password);
          store.setUser(result.user);
          toast.success(`Welcome back, ${result.user.displayName}!`);
          modal.close();
        } catch (err) {
          console.error('[Auth Error]', err);
          toast.error(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = originalText;
          }
        }
      });
    }

    // Phone OTP Request
    if (btnSendOtp) {
      btnSendOtp.addEventListener('click', async () => {
        const phoneInput = document.getElementById('authPhone');
        const phone = phoneInput ? phoneInput.value.trim() : '';

        if (!phone || phone.length < 11) {
          toast.error('Please enter a valid phone number (e.g. +88017XXXXXXXX)');
          return;
        }

        const originalText = btnSendOtp.textContent;
        btnSendOtp.disabled = true;
        btnSendOtp.textContent = 'Sending OTP...';

        try {
          const { isMock } = await sendPhoneOtp(phone, 'recaptcha-container');
          if (isMock) {
            toast.info('Simulated SMS OTP dispatched: [123456]');
            const authOtp = document.getElementById('authOtp');
            if (authOtp) authOtp.value = '123456';
          } else {
            toast.success(`Verification code dispatched to ${phone}`);
          }
          document.getElementById('phoneInputGroup').style.display = 'none';
          otpGroup.style.display = 'block';
        } catch (err) {
          console.error('[SMS OTP Error]', err);
          toast.error(err.message || 'Failed to dispatch SMS verification code.');
        } finally {
          btnSendOtp.disabled = false;
          btnSendOtp.textContent = originalText;
        }
      });
    }

    // Phone OTP Verification Form Submit
    if (formPhone) {
      formPhone.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otpInput = document.getElementById('authOtp');
        const code = otpInput ? otpInput.value.trim() : '';
        const btnVerify = document.getElementById('btnVerifyOtp');

        if (!code || code.length !== 6) {
          toast.error('Please enter the 6-digit verification code.');
          return;
        }

        const originalText = btnVerify ? btnVerify.textContent : '';
        if (btnVerify) {
          btnVerify.disabled = true;
          btnVerify.textContent = 'Verifying...';
        }

        try {
          const result = await confirmPhoneOtp(code);
          store.setUser(result.user);
          toast.success('Phone verified successfully!');
          modal.close();
        } catch (err) {
          console.error('[OTP Verification Error]', err);
          toast.error(err.message || 'Invalid or expired OTP code.');
        } finally {
          if (btnVerify) {
            btnVerify.disabled = false;
            btnVerify.textContent = originalText;
          }
        }
      });
    }

    // Google Sign-In Popup
    if (btnGoogle) {
      btnGoogle.addEventListener('click', async () => {
        const originalHtml = btnGoogle.innerHTML;
        btnGoogle.disabled = true;
        btnGoogle.innerHTML = 'Signing in with Google...';

        try {
          const result = await signInWithGoogle();
          store.setUser(result.user);
          toast.success(`Signed in as ${result.user.displayName}`);
          modal.close();
        } catch (err) {
          console.error('[Google Auth Error]', err);
          // Don't show error toast if user simply cancelled the popup
          if (err.code !== 'auth/popup-closed-by-user') {
            toast.error(err.message || 'Google sign-in was cancelled or failed.');
          }
        } finally {
          btnGoogle.disabled = false;
          btnGoogle.innerHTML = originalHtml;
        }
      });
    }

    if (linkRegister) {
      linkRegister.addEventListener('click', () => {
        modal.close();
      });
    }
  }
}
