/**
 * @file wizard.js
 * @description 5-Step Registration & Identity Verification Wizard with Autosave, Camera Simulation, & Eligibility Gating.
 */

import { t, getLanguage, toBanglaNumeral } from '../../core/i18n.js';
import { store } from '../../core/store.js';
import { toast } from '../../core/toast.js';
import { BANGLADESH_DIVISIONS, BANGLADESH_DISTRICTS, BANGLADESH_UPAZILAS } from './bangladesh-geo.js';

export class OnboardingWizard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStep = 1;
    this.totalSteps = 5;
    this.formData = store.loadDraft() || {};
    this.selfieStream = null;
  }

  init() {
    if (!this.container) return;
    this.render();
    this.attachEvents();
    this.populateGeoDropdowns();
    this.restoreFormData();
  }

  render() {
    const isBn = getLanguage() === 'bn';
    const num = (n) => isBn ? toBanglaNumeral(n) : n;

    this.container.innerHTML = `
      <div class="wizard-container">
        <div class="wizard-card">
          <!-- Header -->
          <div style="margin-bottom: var(--space-6); text-align: center;">
            <h1 class="wizard-title" style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-extrabold); margin-bottom: 8px;" data-i18n="wizard.title">
              ${t('wizard.title')}
            </h1>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm);" data-i18n="wizard.subtitle">
              ${t('wizard.subtitle')}
            </p>
          </div>

          <!-- 5-Step Progress Tracker -->
          <div class="wizard-progress">
            <div class="wizard-progress-bar" id="progressBar" style="width: ${((this.currentStep - 1) / (this.totalSteps - 1)) * 88}%;"></div>
            
            <div class="wizard-step-node ${this.currentStep >= 1 ? (this.currentStep > 1 ? 'completed' : 'active') : ''}" data-step="1">
              <div class="step-circle">${this.currentStep > 1 ? '✓' : num(1)}</div>
              <span class="step-label" data-i18n="wizard.step1">${t('wizard.step1')}</span>
            </div>

            <div class="wizard-step-node ${this.currentStep >= 2 ? (this.currentStep > 2 ? 'completed' : 'active') : ''}" data-step="2">
              <div class="step-circle">${this.currentStep > 2 ? '✓' : num(2)}</div>
              <span class="step-label" data-i18n="wizard.step2">${t('wizard.step2')}</span>
            </div>

            <div class="wizard-step-node ${this.currentStep >= 3 ? (this.currentStep > 3 ? 'completed' : 'active') : ''}" data-step="3">
              <div class="step-circle">${this.currentStep > 3 ? '✓' : num(3)}</div>
              <span class="step-label" data-i18n="wizard.step3">${t('wizard.step3')}</span>
            </div>

            <div class="wizard-step-node ${this.currentStep >= 4 ? (this.currentStep > 4 ? 'completed' : 'active') : ''}" data-step="4">
              <div class="step-circle">${this.currentStep > 4 ? '✓' : num(4)}</div>
              <span class="step-label" data-i18n="wizard.step4">${t('wizard.step4')}</span>
            </div>

            <div class="wizard-step-node ${this.currentStep >= 5 ? 'active' : ''}" data-step="5">
              <div class="step-circle">${num(5)}</div>
              <span class="step-label" data-i18n="wizard.step5">${t('wizard.step5')}</span>
            </div>
          </div>

          <!-- Wizard Form Container -->
          <form id="wizardForm" novalidate>
            <!-- STEP 1: Account -->
            <div class="wizard-step-pane" id="stepPane1" style="display: ${this.currentStep === 1 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label" data-i18n="wizard.account.email">${t('wizard.account.email')} <span class="required">*</span></label>
                <input type="email" class="form-input" name="email" id="inputEmail" placeholder="yourname@domain.com" required>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.account.phone">${t('wizard.account.phone')} <span class="required">*</span></label>
                <input type="tel" class="form-input" name="phone" id="inputPhone" placeholder="+88017XXXXXXXX" required>
                <span class="form-hint">Used for 2-factor authentication and urgent blood matching alerts.</span>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.account.password">${t('wizard.account.password')} <span class="required">*</span></label>
                <input type="password" class="form-input" name="password" id="inputPassword" minlength="10" placeholder="••••••••••••" required>
              </div>
            </div>

            <!-- STEP 2: Personal & Blood Group -->
            <div class="wizard-step-pane" id="stepPane2" style="display: ${this.currentStep === 2 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label" data-i18n="wizard.personal.name">${t('wizard.personal.name')} <span class="required">*</span></label>
                <input type="text" class="form-input" name="displayName" id="inputName" placeholder="Full name as shown on NID" required>
              </div>

              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-4);">
                <div class="form-group">
                  <label class="form-label" data-i18n="wizard.personal.dob">${t('wizard.personal.dob')} <span class="required">*</span></label>
                  <input type="date" class="form-input" name="dob" id="inputDob" required>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="wizard.personal.gender">${t('wizard.personal.gender')} <span class="required">*</span></label>
                  <select class="form-select" name="gender" id="selectGender" required>
                    <option value="male" data-i18n="wizard.personal.genderMale">${t('wizard.personal.genderMale')}</option>
                    <option value="female" data-i18n="wizard.personal.genderFemale">${t('wizard.personal.genderFemale')}</option>
                    <option value="other" data-i18n="wizard.personal.genderOther">${t('wizard.personal.genderOther')}</option>
                  </select>
                </div>
              </div>

              <!-- Blood Group Selector -->
              <div class="form-group">
                <label class="form-label" data-i18n="wizard.personal.bloodGroup">${t('wizard.personal.bloodGroup')} <span class="required">*</span></label>
                <div class="blood-group-selector" id="bloodSelector">
                  ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => `
                    <button type="button" class="blood-btn ${this.formData.bloodGroup === bg ? 'active' : ''}" data-group="${bg}">${bg}</button>
                  `).join('')}
                </div>
                <input type="hidden" name="bloodGroup" id="inputBloodGroup" value="${this.formData.bloodGroup || 'B+'}">
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.personal.weight">${t('wizard.personal.weight')} <span class="required">*</span></label>
                <input type="number" class="form-input" name="weightKg" id="inputWeight" min="40" max="200" placeholder="e.g. 65" required>
                <div id="weightAlert" style="display:none; color:var(--color-danger); font-size:var(--font-size-xs); margin-top:4px;" data-i18n="wizard.personal.weightWarning">
                  ${t('wizard.personal.weightWarning')}
                </div>
              </div>

              <!-- Cascading Bangladesh Geo -->
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:var(--space-3);">
                <div class="form-group">
                  <label class="form-label" data-i18n="wizard.personal.division">${t('wizard.personal.division')}</label>
                  <select class="form-select" name="division" id="selectDivision"></select>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="wizard.personal.district">${t('wizard.personal.district')}</label>
                  <select class="form-select" name="district" id="selectDistrict"></select>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="wizard.personal.upazila">${t('wizard.personal.upazila')}</label>
                  <select class="form-select" name="upazila" id="selectUpazila"></select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.personal.address">${t('wizard.personal.address')} <span class="required">*</span></label>
                <input type="text" class="form-input" name="address" id="inputAddress" placeholder="House/Road, Area" required>
              </div>
            </div>

            <!-- STEP 3: Identity & Live Selfie -->
            <div class="wizard-step-pane" id="stepPane3" style="display: ${this.currentStep === 3 ? 'block' : 'none'};">
              <div class="form-group">
                <label class="form-label" data-i18n="wizard.identity.idType">${t('wizard.identity.idType')}</label>
                <div style="display:flex; gap:var(--space-4);">
                  <label style="display:flex; align-items:center; gap:6px;">
                    <input type="radio" name="idType" value="nid" checked> <span data-i18n="wizard.identity.nid">${t('wizard.identity.nid')}</span>
                  </label>
                  <label style="display:flex; align-items:center; gap:6px;">
                    <input type="radio" name="idType" value="passport"> <span data-i18n="wizard.identity.passport">${t('wizard.identity.passport')}</span>
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.identity.idNumber">${t('wizard.identity.idNumber')} <span class="required">*</span></label>
                <input type="text" class="form-input" name="idNumber" id="inputIdNumber" placeholder="10, 13, or 17 digit NID number" required>
              </div>

              <!-- Document Upload Areas -->
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-4); margin-bottom:var(--space-6);">
                <div>
                  <label class="form-label" data-i18n="wizard.identity.frontDrop">${t('wizard.identity.frontDrop')}</label>
                  <div class="upload-dropzone" id="dropzoneFront">
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">Click to upload front side</div>
                    <input type="file" id="fileFront" accept="image/*,application/pdf" style="display:none;">
                  </div>
                  <div id="previewFront" class="upload-preview" style="display:none;">
                    <span id="fileNameFront" style="font-size:var(--font-size-xs); font-weight:600;"></span>
                    <button type="button" id="btnRemoveFront" style="color:var(--color-danger);">&times;</button>
                  </div>
                </div>

                <div>
                  <label class="form-label" data-i18n="wizard.identity.backDrop">${t('wizard.identity.backDrop')}</label>
                  <div class="upload-dropzone" id="dropzoneBack">
                    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">Click to upload back side</div>
                    <input type="file" id="fileBack" accept="image/*,application/pdf" style="display:none;">
                  </div>
                  <div id="previewBack" class="upload-preview" style="display:none;">
                    <span id="fileNameBack" style="font-size:var(--font-size-xs); font-weight:600;"></span>
                    <button type="button" id="btnRemoveBack" style="color:var(--color-danger);">&times;</button>
                  </div>
                </div>
              </div>

              <!-- Live Selfie Simulation -->
              <div style="text-align:center;">
                <label class="form-label" style="display:block; margin-bottom:4px;" data-i18n="wizard.identity.selfieTitle">${t('wizard.identity.selfieTitle')}</label>
                <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:12px;" data-i18n="wizard.identity.selfieDesc">${t('wizard.identity.selfieDesc')}</p>
                
                <div class="selfie-camera-box" id="cameraBox">
                  <video id="selfieVideo" autoplay playsinline style="width:100%; height:100%; object-fit:cover; display:none;"></video>
                  <canvas id="selfieCanvas" style="width:100%; height:100%; object-fit:cover; display:none;"></canvas>
                  <div class="selfie-guide-oval"></div>
                  <div id="cameraPlaceholder" style="color:white; font-size:var(--font-size-xs);">Webcam preview will appear here</div>
                </div>

                <div style="display:flex; justify-content:center; gap:var(--space-3);">
                  <button type="button" class="btn btn-outline btn-sm" id="btnStartCamera">Start Camera</button>
                  <button type="button" class="btn btn-primary btn-sm" id="btnCaptureSelfie" style="display:none;" data-i18n="wizard.identity.btnCapture">${t('wizard.identity.btnCapture')}</button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btnRetakeSelfie" style="display:none;" data-i18n="wizard.identity.btnRetake">${t('wizard.identity.btnRetake')}</button>
                </div>
              </div>
            </div>

            <!-- STEP 4: Health Declaration -->
            <div class="wizard-step-pane" id="stepPane4" style="display: ${this.currentStep === 4 ? 'block' : 'none'};">
              <div class="form-group" style="margin-bottom:var(--space-5);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="hasChronicIllness" id="chkChronic" style="margin-top:4px;">
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.health.chronic">${t('wizard.health.chronic')}</span>
                </label>
              </div>

              <div class="form-group" style="margin-bottom:var(--space-5);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="isTakingMedications" id="chkMeds" style="margin-top:4px;">
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.health.meds">${t('wizard.health.meds')}</span>
                </label>
              </div>

              <div class="form-group" style="margin-bottom:var(--space-5);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="hadSurgery" id="chkSurgery" style="margin-top:4px;">
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.health.surgery">${t('wizard.health.surgery')}</span>
                </label>
              </div>

              <div class="form-group">
                <label class="form-label" data-i18n="wizard.health.lastDonation">${t('wizard.health.lastDonation')}</label>
                <input type="date" class="form-input" name="lastDonationDate" id="inputLastDonation">
                <span class="form-hint" data-i18n="wizard.health.gapNotice">${t('wizard.health.gapNotice')}</span>
              </div>
            </div>

            <!-- STEP 5: Informed Consent -->
            <div class="wizard-step-pane" id="stepPane5" style="display: ${this.currentStep === 5 ? 'block' : 'none'};">
              <div class="card" style="margin-bottom:var(--space-6); background:var(--color-bg-subtle);">
                <h3 style="font-size:var(--font-size-base); font-weight:var(--font-weight-bold); margin-bottom:8px; color:var(--color-crimson);">
                  রক্তসেতু নীতি ও আচরণবিধি (Ethics & Terms)
                </h3>
                <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); line-height:1.6;">
                  রক্ত কখনো অর্থ বা অন্য কোনো আর্থিক সুবিধার বিনিময়ে প্রদান বা গ্রহণ করা যাবে না। রক্তদান এবং রক্ত গ্রহণ শুধুমাত্র অনুমোদিত ও লাইসেন্সপ্রাপ্ত হাসপাতালে বিশেষজ্ঞদের উপস্থিতিতে সম্পন্ন করতে হবে। কোনো অসত্য বা জাল পরিচয়পত্র প্রদান করা আইনত দণ্ডনীয় অপরাধ।
                </p>
              </div>

              <div class="form-group" style="margin-bottom:var(--space-4);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="consentTerms" id="chkTerms" required>
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.consent.terms">${t('wizard.consent.terms')}</span>
                </label>
              </div>

              <div class="form-group" style="margin-bottom:var(--space-4);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="consentPrivacy" id="chkPrivacy" required>
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.consent.privacy">${t('wizard.consent.privacy')}</span>
                </label>
              </div>

              <div class="form-group" style="margin-bottom:var(--space-4);">
                <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer;">
                  <input type="checkbox" name="consentLocation" id="chkLocation" required>
                  <span style="font-size:var(--font-size-sm);" data-i18n="wizard.consent.location">${t('wizard.consent.location')}</span>
                </label>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="wizard-nav">
              <button type="button" class="btn btn-outline" id="btnPrev" style="visibility: ${this.currentStep === 1 ? 'hidden' : 'visible'};" data-i18n="wizard.btnBack">
                ${t('wizard.btnBack')}
              </button>

              <div style="font-size:var(--font-size-xs); color:var(--color-text-muted);" data-i18n="wizard.autosaveNotice">
                ${t('wizard.autosaveNotice')}
              </div>

              ${this.currentStep < this.totalSteps ? `
                <button type="button" class="btn btn-primary" id="btnNext" data-i18n="wizard.btnNext">
                  ${t('wizard.btnNext')}
                </button>
              ` : `
                <button type="submit" class="btn btn-primary" id="btnSubmit" data-i18n="wizard.btnSubmit">
                  ${t('wizard.btnSubmit')}
                </button>
              `}
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('wizardForm');
    if (!form) return;

    // Next / Prev navigation
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');

    if (btnNext) {
      btnNext.addEventListener('click', () => this.nextStep());
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => this.prevStep());
    }

    form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Blood group buttons
    document.querySelectorAll('.blood-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.blood-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const bg = e.currentTarget.dataset.group;
        document.getElementById('inputBloodGroup').value = bg;
        this.saveStepData({ bloodGroup: bg });
      });
    });

    // Weight eligibility check
    const weightInput = document.getElementById('inputWeight');
    const weightAlert = document.getElementById('weightAlert');
    if (weightInput && weightAlert) {
      weightInput.addEventListener('input', () => {
        const wt = parseFloat(weightInput.value);
        if (wt > 0 && wt < 50) {
          weightAlert.style.display = 'block';
        } else {
          weightAlert.style.display = 'none';
        }
      });
    }

    // File Upload hooks
    this.attachDropzone('dropzoneFront', 'fileFront', 'previewFront', 'fileNameFront', 'btnRemoveFront', 'frontDoc');
    this.attachDropzone('dropzoneBack', 'fileBack', 'previewBack', 'fileNameBack', 'btnRemoveBack', 'backDoc');

    // Camera hooks
    this.attachCameraControls();

    // Autosave on all inputs
    form.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', () => {
        const key = input.name || input.id;
        const val = input.type === 'checkbox' ? input.checked : input.value;
        this.saveStepData({ [key]: val });
      });
    });
  }

  attachDropzone(dropzoneId, fileInputId, previewId, nameId, removeBtnId, stateKey) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    const preview = document.getElementById(previewId);
    const nameSpan = document.getElementById(nameId);
    const removeBtn = document.getElementById(removeBtnId);

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 8 * 1024 * 1024) {
          toast.error('File size exceeds 8 MB limit.');
          return;
        }
        nameSpan.textContent = file.name;
        dropzone.style.display = 'none';
        preview.style.display = 'flex';
        this.saveStepData({ [stateKey]: file.name });
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        fileInput.value = '';
        dropzone.style.display = 'block';
        preview.style.display = 'none';
        this.saveStepData({ [stateKey]: null });
      });
    }
  }

  attachCameraControls() {
    const btnStart = document.getElementById('btnStartCamera');
    const btnCapture = document.getElementById('btnCaptureSelfie');
    const btnRetake = document.getElementById('btnRetakeSelfie');
    const video = document.getElementById('selfieVideo');
    const canvas = document.getElementById('selfieCanvas');
    const placeholder = document.getElementById('cameraPlaceholder');

    if (!btnStart || !video || !canvas) return;

    btnStart.addEventListener('click', async () => {
      try {
        this.selfieStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
        video.srcObject = this.selfieStream;
        video.style.display = 'block';
        placeholder.style.display = 'none';
        btnStart.style.display = 'none';
        btnCapture.style.display = 'inline-flex';
      } catch (err) {
        toast.info('Camera unavailable or permission denied. Simulating webcam capture for verification.');
        placeholder.innerHTML = `<span style="color:#2A9D8F;">✓ Simulated Camera Frame Ready</span>`;
        btnStart.style.display = 'none';
        btnCapture.style.display = 'inline-flex';
      }
    });

    btnCapture.addEventListener('click', () => {
      canvas.width = 360;
      canvas.height = 270;
      const ctx = canvas.getContext('2d');

      if (video.srcObject) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw high-contrast simulated test frame
        ctx.fillStyle = '#1B1B1F';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#D90429';
        ctx.beginPath();
        ctx.arc(180, 110, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px sans-serif';
        ctx.fillText('Simulated Selfie Captured', 100, 200);
      }

      if (this.selfieStream) {
        this.selfieStream.getTracks().forEach(t => t.stop());
      }
      video.style.display = 'none';
      canvas.style.display = 'block';
      btnCapture.style.display = 'none';
      btnRetake.style.display = 'inline-flex';
      this.saveStepData({ selfieCaptured: true });
      toast.success('Live selfie captured successfully.');
    });

    btnRetake.addEventListener('click', () => {
      canvas.style.display = 'none';
      btnRetake.style.display = 'none';
      btnStart.style.display = 'inline-flex';
      placeholder.style.display = 'block';
      placeholder.textContent = 'Webcam preview will appear here';
      this.saveStepData({ selfieCaptured: false });
    });
  }

  populateGeoDropdowns() {
    const selDiv = document.getElementById('selectDivision');
    const selDist = document.getElementById('selectDistrict');
    const selUpz = document.getElementById('selectUpazila');

    if (!selDiv) return;

    const isBn = getLanguage() === 'bn';

    selDiv.innerHTML = BANGLADESH_DIVISIONS.map(d => `<option value="${d.id}">${isBn ? d.nameBN : d.nameEN}</option>`).join('');

    const updateDistricts = () => {
      const divId = selDiv.value;
      const districts = BANGLADESH_DISTRICTS[divId] || [];
      selDist.innerHTML = districts.map(d => `<option value="${d.id}">${isBn ? d.nameBN : d.nameEN}</option>`).join('');
      updateUpazilas();
    };

    const updateUpazilas = () => {
      const distId = selDist.value;
      const upazilas = BANGLADESH_UPAZILAS[distId] || [];
      if (upazilas.length > 0) {
        selUpz.innerHTML = upazilas.map(u => `<option value="${u.id}">${isBn ? u.nameBN : u.nameEN}</option>`).join('');
        selUpz.disabled = false;
      } else {
        selUpz.innerHTML = `<option value="">Default Area</option>`;
      }
    };

    selDiv.addEventListener('change', updateDistricts);
    selDist.addEventListener('change', updateUpazilas);

    // Initial populate
    selDiv.value = this.formData.division || 'chattogram';
    updateDistricts();
    if (this.formData.district) selDist.value = this.formData.district;
    if (this.formData.upazila) selUpz.value = this.formData.upazila;
  }

  saveStepData(partial) {
    this.formData = { ...this.formData, ...partial };
    store.saveDraft(this.formData);
  }

  restoreFormData() {
    for (const [key, val] of Object.entries(this.formData)) {
      const el = document.querySelector(`[name="${key}"]`);
      if (el) {
        if (el.type === 'checkbox') {
          el.checked = !!val;
        } else {
          el.value = val;
        }
      }
    }
  }

  nextStep() {
    // Basic validation before advancing
    if (this.currentStep === 1) {
      const email = document.getElementById('inputEmail')?.value;
      const phone = document.getElementById('inputPhone')?.value;
      const pass = document.getElementById('inputPassword')?.value;

      if (!email || !phone || !pass) {
        toast.error('Please fill in all required account fields.');
        return;
      }
      if (pass.length < 10) {
        toast.error('Password must be at least 10 characters long.');
        return;
      }
    }

    if (this.currentStep === 2) {
      const name = document.getElementById('inputName')?.value;
      const wt = parseFloat(document.getElementById('inputWeight')?.value || '0');
      if (!name) {
        toast.error('Please provide your full legal name.');
        return;
      }
      if (wt < 50) {
        toast.error('Minimum body weight of 50 kg is required for blood donation.');
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.render();
      this.attachEvents();
      this.populateGeoDropdowns();
      this.restoreFormData();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
      this.attachEvents();
      this.populateGeoDropdowns();
      this.restoreFormData();
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const chkTerms = document.getElementById('chkTerms')?.checked;
    const chkPrivacy = document.getElementById('chkPrivacy')?.checked;
    const chkLocation = document.getElementById('chkLocation')?.checked;

    if (!chkTerms || !chkPrivacy || !chkLocation) {
      toast.error('You must accept the terms, privacy policy, and location sharing consent to proceed.');
      return;
    }

    toast.info('Submitting registration and identity documents for review...');

    // Simulate successful submission and transition to under_review state
    setTimeout(() => {
      store.clearDraft();
      store.setUser({
        displayName: this.formData.displayName || 'Applicant',
        email: this.formData.email,
        phone: this.formData.phone,
        bloodGroup: this.formData.bloodGroup || 'B+',
        verificationStatus: 'under_review',
        role: 'donor'
      });

      this.container.innerHTML = `
        <div class="wizard-container">
          <div class="wizard-card" style="text-align:center; padding:var(--space-12) var(--space-6);">
            <div style="width:72px; height:72px; border-radius:50%; background:var(--color-teal-subtle); color:var(--color-teal); display:inline-flex; align-items:center; justify-content:center; margin-bottom:var(--space-4);">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style="font-size:var(--font-size-2xl); font-weight:800; margin-bottom:8px;">আবেদন সফলভাবে গৃহীত হয়েছে!</h2>
            <p style="color:var(--color-text-secondary); max-width:480px; margin:0 auto var(--space-6); font-size:var(--font-size-sm); line-height:1.6;">
              আপনার জাতীয় পরিচয়পত্র এবং লাইভ সেলফি আমাদের সুরক্ষিত অ্যাডমিন রিভিউয়ার সারিতে জমা হয়েছে। পরিচয় নিশ্চিত হওয়ার পর আপনার প্রোফাইল 'যাচাইকৃত রক্তদাতা' হিসেবে সক্রিয় হবে।
            </p>
            <div style="display:inline-flex; gap:12px;">
              <a href="#/map" class="btn btn-primary">ম্যাপ অনুসন্ধান দেখুন</a>
              <button type="button" class="btn btn-secondary" onclick="window.location.hash='#/verify-queue'">রিভিউয়ার ডেমো ভিউ</button>
            </div>
          </div>
        </div>
      `;
    }, 1000);
  }
}
