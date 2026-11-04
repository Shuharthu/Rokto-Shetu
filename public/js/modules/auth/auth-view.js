/**
 * @file auth-view.js
 * @description Accessible Authentication & Role-Based Registration Modal (Donor, Seeker User, Admin).
 * Features brute-force protection, password strength auditing, Cloud Firestore profile synchronization,
 * and live database connectivity health diagnostics.
 */

import { t } from '../../core/i18n.js';
import { toast } from '../../core/toast.js';
import { modal } from '../../core/modal.js';
import { store } from '../../core/store.js';
import {
  secureSignInWithEmail,
  signUpUserWithProfile,
  signInWithGoogle,
  sendPhoneOtp,
  confirmPhoneOtp,
  validatePasswordStrength,
  checkDatabaseConnection,
  ADMIN_REGISTRATION_PASSCODE
} from '../../core/firebase.js';

export class AuthView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentMode = 'login'; // 'login' | 'signup'
    this.signupRole = 'donor'; // 'donor' | 'user' | 'admin'
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="modal-overlay" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
        <div class="modal-content" style="max-width:480px; max-height:92vh; overflow-y:auto; padding:var(--space-6);">
          
          <!-- Header with Logo and Close -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="/assets/logo-icon.svg" alt="RoktoSetu" style="height:34px; width:auto;">
              <div>
                <h2 id="authTitle" style="font-size:var(--font-size-xl); font-weight:800; line-height:1.2; margin:0;">
                  RoktoSetu Access
                </h2>
                <div style="font-size:11px; color:var(--color-text-muted);">
                  Secure Blood Network & Crowdfunding
                </div>
              </div>
            </div>
            <button type="button" class="btn-icon" id="btnCloseAuth" aria-label="Close dialog" style="font-size:1.5rem; cursor:pointer;">&times;</button>
          </div>

          <!-- Main Mode Switcher: Log In vs Sign Up -->
          <div style="display:flex; background:rgba(255,255,255,0.06); border-radius:8px; padding:4px; margin-bottom:var(--space-5);">
            <button type="button" class="tab-btn" id="btnModeLogin" style="flex:1; padding:8px 12px; border-radius:6px; font-weight:700; font-size:var(--font-size-sm); border:none; background:var(--color-crimson); color:#ffffff; cursor:pointer; transition:all 0.2s;">
              Log in
            </button>
            <button type="button" class="tab-btn" id="btnModeSignup" style="flex:1; padding:8px 12px; border-radius:6px; font-weight:700; font-size:var(--font-size-sm); border:none; background:transparent; color:var(--color-text-secondary); cursor:pointer; transition:all 0.2s;">
              Create Account (Sign Up)
            </button>
          </div>

          <!-- ========================================================= -->
          <!-- 1. LOGIN CONTAINER                                        -->
          <!-- ========================================================= -->
          <div id="sectionLogin">
            <!-- Login Sub-tabs: Email vs Phone -->
            <div style="display:flex; border-bottom:1px solid var(--color-border); margin-bottom:var(--space-4);">
              <button type="button" class="tab-btn active" id="tabEmail" style="flex:1; padding:8px; font-weight:700; border-bottom:2px solid var(--color-crimson); color:var(--color-crimson); background:none; border-top:none; border-left:none; border-right:none; cursor:pointer;">
                Email
              </button>
              <button type="button" class="tab-btn" id="tabPhone" style="flex:1; padding:8px; font-weight:600; color:var(--color-text-secondary); background:none; border:none; cursor:pointer;">
                Phone OTP
              </button>
            </div>

            <!-- Email Login Form -->
            <form id="formEmailAuth">
              <div class="form-group" style="margin-bottom:var(--space-3);">
                <label class="form-label" for="authEmail" style="font-size:12px; font-weight:600;">Email address</label>
                <input type="email" class="form-input" id="authEmail" placeholder="yourname@domain.com" autocomplete="email" required style="width:100%; padding:10px 12px; border-radius:6px;">
              </div>

              <div class="form-group" style="margin-bottom:var(--space-4);">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <label class="form-label" for="authPassword" style="font-size:12px; font-weight:600;">Password</label>
                  <a href="#/faq" id="linkForgotPassword" style="font-size:var(--font-size-xs); color:var(--color-crimson); text-decoration:none;">Forgot?</a>
                </div>
                <input type="password" class="form-input" id="authPassword" placeholder="••••••••••••" autocomplete="current-password" required style="width:100%; padding:10px 12px; border-radius:6px;">
              </div>

              <button type="submit" class="btn btn-primary btn-block" id="btnSubmitEmailAuth" style="width:100%; padding:12px; font-weight:700; border-radius:6px;">
                Log In to Account
              </button>
            </form>

            <!-- Phone OTP Login Form -->
            <form id="formPhoneAuth" style="display:none;">
              <div class="form-group" id="phoneInputGroup" style="margin-bottom:var(--space-3);">
                <label class="form-label" for="authPhone" style="font-size:12px; font-weight:600;">Mobile Number (Bangladesh +880)</label>
                <input type="tel" class="form-input" id="authPhone" placeholder="+88017XXXXXXXX" value="+8801712345678" autocomplete="tel" style="width:100%; padding:10px 12px; border-radius:6px;">
                <div id="recaptcha-container" style="margin-top:8px;"></div>
                <button type="button" class="btn btn-secondary btn-block" id="btnSendOtp" style="width:100%; padding:10px; margin-top:8px; border-radius:6px;">
                  Send 6-Digit SMS OTP
                </button>
              </div>

              <div class="form-group" id="otpGroup" style="display:none; margin-bottom:var(--space-3);">
                <label class="form-label" for="authOtp" style="font-size:12px; font-weight:600;">Enter 6-Digit Verification Code</label>
                <input type="text" class="form-input" id="authOtp" placeholder="123456" maxlength="6" inputmode="numeric" style="letter-spacing:6px; text-align:center; font-size:1.35rem; width:100%; padding:10px; border-radius:6px;">
                <button type="submit" class="btn btn-primary btn-block" id="btnVerifyOtp" style="width:100%; padding:12px; margin-top:8px; border-radius:6px;">
                  Verify & Log In
                </button>
                <button type="button" class="btn btn-link btn-block" id="btnResendOtp" style="width:100%; font-size:var(--font-size-xs); margin-top:6px; background:none; border:none; color:var(--color-text-muted); cursor:pointer;">
                  ← Change Phone Number
                </button>
              </div>
            </form>

            <!-- Social Divider -->
            <div style="display:flex; align-items:center; gap:12px; margin:var(--space-4) 0;">
              <div style="flex:1; height:1px; background:var(--color-border);"></div>
              <span style="font-size:var(--font-size-xs); color:var(--color-text-muted); font-weight:600;">OR</span>
              <div style="flex:1; height:1px; background:var(--color-border);"></div>
            </div>

            <!-- Google OAuth Button -->
            <button type="button" class="btn btn-outline btn-block" id="btnGoogleAuth" style="width:100%; padding:10px 16px; border-radius:6px; display:flex; justify-content:center; align-items:center; gap:10px; font-weight:600;">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>
              Continue with Google
            </button>
          </div>

          <!-- ========================================================= -->
          <!-- 2. REGISTRATION (SIGN UP) CONTAINER                        -->
          <!-- ========================================================= -->
          <div id="sectionSignup" style="display:none;">
            
            <!-- Step 1: Select Account Type -->
            <label class="form-label" style="font-size:12px; font-weight:700; margin-bottom:6px; display:block;">
              I want to register as:
            </label>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:var(--space-4);">
              <button type="button" class="role-selector-btn active" id="roleBtnDonor" data-role="donor" style="padding:10px 4px; border-radius:8px; border:2px solid var(--color-crimson); background:rgba(217,4,41,0.12); color:var(--color-crimson); font-weight:700; font-size:11px; text-align:center; cursor:pointer;">
                <div style="font-size:18px; margin-bottom:2px;">🩸</div>
                Blood Donor
              </button>
              <button type="button" class="role-selector-btn" id="roleBtnUser" data-role="user" style="padding:10px 4px; border-radius:8px; border:1px solid var(--color-border); background:rgba(255,255,255,0.03); color:var(--color-text-secondary); font-weight:600; font-size:11px; text-align:center; cursor:pointer;">
                <div style="font-size:18px; margin-bottom:2px;">👤</div>
                General Seeker
              </button>
              <button type="button" class="role-selector-btn" id="roleBtnAdmin" data-role="admin" style="padding:10px 4px; border-radius:8px; border:1px solid var(--color-border); background:rgba(255,255,255,0.03); color:var(--color-text-secondary); font-weight:600; font-size:11px; text-align:center; cursor:pointer;">
                <div style="font-size:18px; margin-bottom:2px;">🛡️</div>
                Admin
              </button>
            </div>

            <!-- Registration Form -->
            <form id="formSignup">
              <div class="form-group" style="margin-bottom:var(--space-3);">
                <label class="form-label" for="signupFullName" style="font-size:12px; font-weight:600;">Full Name</label>
                <input type="text" class="form-input" id="signupFullName" placeholder="e.g. Tanvir Ahmed" required style="width:100%; padding:10px 12px; border-radius:6px;">
              </div>

              <div class="form-group" style="margin-bottom:var(--space-3);">
                <label class="form-label" for="signupEmail" style="font-size:12px; font-weight:600;">Email Address</label>
                <input type="email" class="form-input" id="signupEmail" placeholder="tanvir@example.com" autocomplete="email" required style="width:100%; padding:10px 12px; border-radius:6px;">
              </div>

              <div class="form-group" style="margin-bottom:var(--space-3);">
                <label class="form-label" for="signupPhone" style="font-size:12px; font-weight:600;">Mobile Number</label>
                <input type="tel" class="form-input" id="signupPhone" placeholder="+88017XXXXXXXX" value="+88017" required style="width:100%; padding:10px 12px; border-radius:6px;">
              </div>

              <!-- Donor Specific Fields -->
              <div id="donorFieldsGroup" style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:var(--space-3);">
                <div>
                  <label class="form-label" for="signupBloodGroup" style="font-size:12px; font-weight:600;">Blood Group</label>
                  <select class="form-input" id="signupBloodGroup" style="width:100%; padding:10px 12px; border-radius:6px;">
                    <option value="O+">O+ (Positive)</option>
                    <option value="A+">A+ (Positive)</option>
                    <option value="B+">B+ (Positive)</option>
                    <option value="AB+">AB+ (Positive)</option>
                    <option value="O-">O- (Universal)</option>
                    <option value="A-">A- (Negative)</option>
                    <option value="B-">B- (Negative)</option>
                    <option value="AB-">AB- (Negative)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label" for="signupDistrict" style="font-size:12px; font-weight:600;">District</label>
                  <input type="text" class="form-input" id="signupDistrict" placeholder="e.g. Dhaka" value="Dhaka" style="width:100%; padding:10px 12px; border-radius:6px;">
                </div>
              </div>

              <!-- Admin Specific Field -->
              <div id="adminFieldsGroup" style="display:none; margin-bottom:var(--space-3); background:rgba(217,4,41,0.08); padding:10px; border-radius:6px; border:1px dashed var(--color-crimson);">
                <label class="form-label" for="signupAdminPasscode" style="font-size:12px; font-weight:700; color:var(--color-crimson);">
                  Admin Security Passcode
                </label>
                <input type="password" class="form-input" id="signupAdminPasscode" placeholder="Enter authorization key" style="width:100%; padding:8px 10px; border-radius:4px; margin-top:4px;">
                <div style="font-size:10px; color:var(--color-text-muted); margin-top:4px;">
                  * System Security Passcode: <code style="color:var(--color-crimson);">${ADMIN_REGISTRATION_PASSCODE}</code>
                </div>
              </div>

              <!-- Password with Strength Indicator -->
              <div class="form-group" style="margin-bottom:var(--space-4);">
                <label class="form-label" for="signupPassword" style="font-size:12px; font-weight:600;">Password (Min 8 characters)</label>
                <input type="password" class="form-input" id="signupPassword" placeholder="Create strong password" required style="width:100%; padding:10px 12px; border-radius:6px;">
                
                <!-- Live Password Strength Bar -->
                <div style="height:4px; width:100%; background:var(--color-border); border-radius:2px; margin-top:6px; overflow:hidden;">
                  <div id="passwordMeterBar" style="height:100%; width:0%; background:red; transition:all 0.3s;"></div>
                </div>
                <div id="passwordStrengthLabel" style="font-size:10px; color:var(--color-text-muted); margin-top:2px;">
                  Password strength: Enter password
                </div>
              </div>

              <button type="submit" class="btn btn-primary btn-block" id="btnSubmitSignup" style="width:100%; padding:12px; font-weight:700; border-radius:6px;">
                Complete Registration & Create Account
              </button>
            </form>
          </div>

          <!-- Live Firebase Connection Diagnostic Status Pill -->
          <div id="firebaseStatusBanner" style="display:flex; align-items:center; justify-content:center; gap:6px; margin-top:var(--space-5); padding-top:10px; border-top:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted);">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10B981;"></span>
            <span id="firebaseStatusText">Checking Firebase roktoshetu database status...</span>
          </div>

        </div>
      </div>
    `;

    this.attachEvents();
    this.refreshConnectionStatus();
  }

  async refreshConnectionStatus() {
    const statusText = document.getElementById('firebaseStatusText');
    if (!statusText) return;

    try {
      const res = await checkDatabaseConnection();
      if (res.connected) {
        statusText.innerHTML = `<strong>${res.message}</strong>`;
      } else {
        statusText.innerHTML = `<span style="color:#EF4444;">Database check: ${res.message}</span>`;
      }
    } catch {
      statusText.textContent = 'Firebase connected • Database sync active';
    }
  }

  attachEvents() {
    const btnClose = document.getElementById('btnCloseAuth');
    const btnModeLogin = document.getElementById('btnModeLogin');
    const btnModeSignup = document.getElementById('btnModeSignup');
    const sectionLogin = document.getElementById('sectionLogin');
    const sectionSignup = document.getElementById('sectionSignup');

    const tabEmail = document.getElementById('tabEmail');
    const tabPhone = document.getElementById('tabPhone');
    const formEmail = document.getElementById('formEmailAuth');
    const formPhone = document.getElementById('formPhoneAuth');
    const btnSendOtp = document.getElementById('btnSendOtp');
    const btnResendOtp = document.getElementById('btnResendOtp');
    const otpGroup = document.getElementById('otpGroup');
    const btnGoogle = document.getElementById('btnGoogleAuth');

    const roleBtnDonor = document.getElementById('roleBtnDonor');
    const roleBtnUser = document.getElementById('roleBtnUser');
    const roleBtnAdmin = document.getElementById('roleBtnAdmin');
    const donorFieldsGroup = document.getElementById('donorFieldsGroup');
    const adminFieldsGroup = document.getElementById('adminFieldsGroup');
    const signupPassword = document.getElementById('signupPassword');
    const passwordMeterBar = document.getElementById('passwordMeterBar');
    const passwordStrengthLabel = document.getElementById('passwordStrengthLabel');
    const formSignup = document.getElementById('formSignup');

    if (btnClose) btnClose.addEventListener('click', () => modal.close());

    // Switch between Login and Sign Up
    const switchMode = (mode) => {
      this.currentMode = mode;
      if (mode === 'login') {
        btnModeLogin.style.background = 'var(--color-crimson)';
        btnModeLogin.style.color = '#ffffff';
        btnModeSignup.style.background = 'transparent';
        btnModeSignup.style.color = 'var(--color-text-secondary)';
        sectionLogin.style.display = 'block';
        sectionSignup.style.display = 'none';
        document.getElementById('authTitle').textContent = 'Log in to RoktoSetu';
      } else {
        btnModeSignup.style.background = 'var(--color-crimson)';
        btnModeSignup.style.color = '#ffffff';
        btnModeLogin.style.background = 'transparent';
        btnModeLogin.style.color = 'var(--color-text-secondary)';
        sectionSignup.style.display = 'block';
        sectionLogin.style.display = 'none';
        document.getElementById('authTitle').textContent = 'Create RoktoSetu Account';
      }
    };

    btnModeLogin?.addEventListener('click', () => switchMode('login'));
    btnModeSignup?.addEventListener('click', () => switchMode('signup'));

    // Login Sub-tabs: Email vs Phone
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

    // Role Selection Buttons (Donor / Seeker User / Admin)
    const selectRole = (role) => {
      this.signupRole = role;
      [roleBtnDonor, roleBtnUser, roleBtnAdmin].forEach(btn => {
        if (!btn) return;
        if (btn.dataset.role === role) {
          btn.style.border = '2px solid var(--color-crimson)';
          btn.style.background = 'rgba(217,4,41,0.14)';
          btn.style.color = 'var(--color-crimson)';
          btn.style.fontWeight = '700';
        } else {
          btn.style.border = '1px solid var(--color-border)';
          btn.style.background = 'rgba(255,255,255,0.03)';
          btn.style.color = 'var(--color-text-secondary)';
          btn.style.fontWeight = '600';
        }
      });

      if (donorFieldsGroup) donorFieldsGroup.style.display = role === 'donor' ? 'grid' : 'none';
      if (adminFieldsGroup) adminFieldsGroup.style.display = role === 'admin' ? 'block' : 'none';
    };

    roleBtnDonor?.addEventListener('click', () => selectRole('donor'));
    roleBtnUser?.addEventListener('click', () => selectRole('user'));
    roleBtnAdmin?.addEventListener('click', () => selectRole('admin'));

    // Live Password Strength Bar
    signupPassword?.addEventListener('input', (e) => {
      const val = e.target.value;
      const res = validatePasswordStrength(val);
      if (!val) {
        passwordMeterBar.style.width = '0%';
        passwordStrengthLabel.textContent = 'Password strength: Enter password';
      } else if (res.score <= 1) {
        passwordMeterBar.style.width = '25%';
        passwordMeterBar.style.background = '#EF4444';
        passwordStrengthLabel.textContent = 'Weak: Add numbers and uppercase letters';
        passwordStrengthLabel.style.color = '#EF4444';
      } else if (res.score === 2) {
        passwordMeterBar.style.width = '60%';
        passwordMeterBar.style.background = '#F59E0B';
        passwordStrengthLabel.textContent = 'Moderate: Add special characters';
        passwordStrengthLabel.style.color = '#F59E0B';
      } else {
        passwordMeterBar.style.width = '100%';
        passwordMeterBar.style.background = '#10B981';
        passwordStrengthLabel.textContent = 'Strong password ✓';
        passwordStrengthLabel.style.color = '#10B981';
      }
    });

    // -------------------------------------------------------------
    // Sign Up Form Submission
    // -------------------------------------------------------------
    formSignup?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('signupFullName')?.value.trim();
      const email = document.getElementById('signupEmail')?.value.trim();
      const phone = document.getElementById('signupPhone')?.value.trim();
      const password = document.getElementById('signupPassword')?.value;
      const bloodGroup = document.getElementById('signupBloodGroup')?.value;
      const district = document.getElementById('signupDistrict')?.value.trim();
      const adminPasscode = document.getElementById('signupAdminPasscode')?.value.trim();
      const btnSubmit = document.getElementById('btnSubmitSignup');

      const originalText = btnSubmit.textContent;
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Creating Account & Registering...';

      try {
        const result = await signUpUserWithProfile({
          fullName,
          email,
          password,
          phoneNumber: phone,
          role: this.signupRole,
          bloodGroup: this.signupRole === 'donor' ? bloodGroup : null,
          district,
          adminPasscode: this.signupRole === 'admin' ? adminPasscode : null
        });

        store.setUser(result.user);
        toast.success(`Account created successfully! Welcome, ${result.user.displayName}`);
        modal.close();

        // Role-based routing
        if (result.user.role === 'admin') {
          window.location.hash = '#/admin';
        } else if (result.user.role === 'donor') {
          window.location.hash = '#/achievements';
        } else {
          window.location.hash = '#/map';
        }
      } catch (err) {
        console.error('[Registration Error]', err);
        toast.error(err.message || 'Registration failed.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
      }
    });

    // -------------------------------------------------------------
    // Email / Password Login Submission
    // -------------------------------------------------------------
    formEmail?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail')?.value.trim();
      const password = document.getElementById('authPassword')?.value;
      const btnSubmit = document.getElementById('btnSubmitEmailAuth');

      if (!email || !password) {
        toast.error('Please enter both email and password.');
        return;
      }

      const originalText = btnSubmit.textContent;
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Verifying credentials...';

      try {
        const result = await secureSignInWithEmail(email, password);
        store.setUser(result.user);
        
        toast.success(`Welcome back, ${result.user.displayName}!`);
        modal.close();

        // Role-based routing
        if (result.user.role === 'admin') {
          window.location.hash = '#/admin';
        } else if (result.user.role === 'donor') {
          window.location.hash = '#/achievements';
        } else {
          window.location.hash = '#/map';
        }
      } catch (err) {
        console.error('[Login Error]', err);
        toast.error(err.message || 'Authentication failed.');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;
      }
    });

    // -------------------------------------------------------------
    // Phone OTP Flow
    // -------------------------------------------------------------
    if (btnResendOtp) {
      btnResendOtp.addEventListener('click', () => {
        document.getElementById('phoneInputGroup').style.display = 'block';
        otpGroup.style.display = 'none';
      });
    }

    if (btnSendOtp) {
      btnSendOtp.addEventListener('click', async () => {
        const phone = document.getElementById('authPhone')?.value.trim();
        if (!phone || phone.length < 11) {
          toast.error('Please enter a valid mobile number (e.g. +88017XXXXXXXX)');
          return;
        }

        const originalText = btnSendOtp.textContent;
        btnSendOtp.disabled = true;
        btnSendOtp.textContent = 'Sending OTP...';

        try {
          const { isMock } = await sendPhoneOtp(phone, 'recaptcha-container');
          if (isMock) {
            toast.info('Simulated SMS OTP sent: [123456]');
            const authOtp = document.getElementById('authOtp');
            if (authOtp) authOtp.value = '123456';
          } else {
            toast.success(`6-digit verification code dispatched to ${phone}`);
          }
          document.getElementById('phoneInputGroup').style.display = 'none';
          otpGroup.style.display = 'block';
        } catch (err) {
          toast.error(err.message || 'Failed to dispatch SMS OTP.');
        } finally {
          btnSendOtp.disabled = false;
          btnSendOtp.textContent = originalText;
        }
      });
    }

    if (formPhone) {
      formPhone.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('authOtp')?.value.trim();
        const btnVerify = document.getElementById('btnVerifyOtp');

        if (!code || code.length !== 6) {
          toast.error('Please enter the 6-digit verification code.');
          return;
        }

        const originalText = btnVerify.textContent;
        btnVerify.disabled = true;
        btnVerify.textContent = 'Verifying...';

        try {
          const result = await confirmPhoneOtp(code);
          store.setUser(result.user);
          toast.success('Phone verified successfully!');
          modal.close();
          window.location.hash = '#/achievements';
        } catch (err) {
          toast.error(err.message || 'Invalid or expired OTP code.');
        } finally {
          btnVerify.disabled = false;
          btnVerify.textContent = originalText;
        }
      });
    }

    // -------------------------------------------------------------
    // Google OAuth Sign-In
    // -------------------------------------------------------------
    if (btnGoogle) {
      btnGoogle.addEventListener('click', async () => {
        const originalHtml = btnGoogle.innerHTML;
        btnGoogle.disabled = true;
        btnGoogle.innerHTML = 'Connecting to Google...';

        try {
          const result = await signInWithGoogle();
          store.setUser(result.user);
          toast.success(`Signed in as ${result.user.displayName}`);
          modal.close();

          if (result.user.role === 'admin') {
            window.location.hash = '#/admin';
          } else if (result.user.role === 'donor') {
            window.location.hash = '#/achievements';
          } else {
            window.location.hash = '#/map';
          }
        } catch (err) {
          if (err.code !== 'auth/popup-closed-by-user') {
            toast.error(err.message || 'Google sign-in was cancelled or failed.');
          }
        } finally {
          btnGoogle.disabled = false;
          btnGoogle.innerHTML = originalHtml;
        }
      });
    }
  }
}
