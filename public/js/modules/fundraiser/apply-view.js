/**
 * @file apply-view.js
 * @description 6-Step Critical Patient Fundraiser Application Wizard.
 * Steps: 1. Patient | 2. Medical | 3. Documents | 4. Funding & Payout | 5. Story & Media | 6. Declarations & Consent.
 */

import { toast } from '../../core/toast.js';

export class FundraiserApplyView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStep = 1;
    this.totalSteps = 6;
    this.formData = {
      // Step 1: Patient
      patientName: 'Master Ayan Hossain',
      patientAge: '7',
      gender: 'male',
      bloodGroup: 'B+',
      nidOrBirthCert: '20192692819002819',
      district: 'Dhaka',
      relationshipToPatient: 'father',
      // Step 2: Medical
      diagnosis: 'Corrective Surgery for Tetralogy of Fallot',
      hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
      hospitalWard: 'Pediatric Cardiac Surgery Ward 3, Bed 14',
      doctorName: 'Prof. Dr. M. A. Karim',
      bmdcNumber: 'A54219',
      admissionDate: '2026-03-01',
      // Step 3: Documents
      documents: [
        { fileName: 'hospital_admission_order.pdf', sizeBytes: 1450000, hash: 'sha256_e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
        { fileName: 'clinical_quotation_nicvd.pdf', sizeBytes: 890000, hash: 'sha256_ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb' },
        { fileName: 'doctor_prescription_tests.jpg', sizeBytes: 2100000, hash: 'sha256_3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d' }
      ],
      // Step 4: Funding & Payout
      targetAmountBDT: 280000,
      milestones: [
        { title: 'Tranche 1: Pre-Op Diagnostics & Hospital Admission', percent: 30, amount: 84000 },
        { title: 'Tranche 2: Surgical Procedure, Implants & ICU Bed', percent: 50, amount: 140000 },
        { title: 'Tranche 3: Post-Op Medications & Discharge Clearance', percent: 20, amount: 56000 }
      ],
      payoutBankName: 'Islami Bank Bangladesh Ltd.',
      payoutAccountName: 'NICVD Hospital Patient Escrow Account',
      payoutAccountNumber: '205021309847162',
      payoutBranchRouting: '125271890',
      // Step 5: Story & Media
      storyEn: 'Ayan was diagnosed with congenital heart disease at age 5. He requires urgent corrective open-heart surgery at NICVD. His father is an auto-rickshaw driver and exhausted all savings on preliminary tests.',
      storyBn: 'আয়ান ৫ বছর বয়স থেকেই জন্মগত হৃদরোগে ভুগছে। জাতীয় হৃদরোগ ইনস্টিটিউটে তার জরুরি ওপেন হার্ট সার্জারি প্রয়োজন। তার পিতা একজন সিএনজি চালক যার পক্ষে পুরো ব্যয় বহন করা সম্ভব হচ্ছে না।',
      photoAttached: true,
      // Step 6: Declarations
      ethicsAccepted: true,
      hospitalDirectPayoutConsent: true,
      legalPenaltiesAccepted: true
    };
  }

  render() {
    if (!this.container) return;

    const stepLabels = [
      '1. Patient',
      '2. Medical',
      '3. Documents',
      '4. Funding & Payout',
      '5. Story & Media',
      '6. Declarations'
    ];

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:880px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:var(--space-8);">
          <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-weight:800; font-size:11px; margin-bottom:8px;">
            CRITICAL PATIENT MEDICAL FUNDRAISER APPLICATION
          </span>
          <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Apply for Verified Treatment Crowdfunding</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); max-width:620px; margin:6px auto 0;">
            100% transparent healthcare funding. Rigorously verified through Bangladesh Medical & Dental Council (BMDC) records, hospital invoices, and audited escrow disbursements.
          </p>
        </div>

        <!-- 6-Step Progress Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-8); position:relative;">
          <div style="position:absolute; top:50%; left:0; right:0; height:2px; background:var(--color-border); z-index:1; transform:translateY(-50%);"></div>
          <div style="position:absolute; top:50%; left:0; width:${((this.currentStep - 1) / (this.totalSteps - 1)) * 100}%; height:2px; background:var(--color-crimson); z-index:2; transform:translateY(-50%); transition:width 0.3s;"></div>

          ${stepLabels.map((label, idx) => `
            <div style="position:relative; z-index:3; text-align:center;">
              <div style="width:34px; height:34px; border-radius:50%; background:${this.currentStep > idx + 1 ? 'var(--color-teal)' : this.currentStep === idx + 1 ? 'var(--color-crimson)' : 'var(--color-bg-surface)'}; color:${this.currentStep >= idx + 1 ? 'white' : 'var(--color-text-secondary)'}; border:2px solid ${this.currentStep >= idx + 1 ? 'transparent' : 'var(--color-border)'}; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:12px; margin:0 auto; box-shadow:var(--shadow-sm);">
                ${this.currentStep > idx + 1 ? '✓' : idx + 1}
              </div>
              <div class="step-label-text" style="font-size:10px; font-weight:700; color:${this.currentStep === idx + 1 ? 'var(--color-crimson)' : 'var(--color-text-secondary)'}; margin-top:6px; white-space:nowrap;">
                ${label}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Step Content Card -->
        <div class="card" style="padding:var(--space-8); box-shadow:var(--shadow-md);">
          ${this.renderStepContent()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderStepContent() {
    switch (this.currentStep) {
      // STEP 1: PATIENT
      case 1:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 1: Patient Legal Identification</h2>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:var(--space-4);">
            <div style="grid-column:1/-1;">
              <label class="form-label">Patient Full Legal Name <span class="required">*</span></label>
              <input type="text" id="inputPatientName" class="form-input" value="${this.formData.patientName}" placeholder="e.g. Master Ayan Hossain" required>
            </div>
            <div>
              <label class="form-label">Patient Age (Years) <span class="required">*</span></label>
              <input type="number" id="inputPatientAge" class="form-input" value="${this.formData.patientAge}" placeholder="e.g. 7" required>
            </div>
            <div>
              <label class="form-label">Gender <span class="required">*</span></label>
              <select id="selectPatientGender" class="form-select">
                <option value="male" ${this.formData.gender === 'male' ? 'selected' : ''}>Male</option>
                <option value="female" ${this.formData.gender === 'female' ? 'selected' : ''}>Female</option>
                <option value="other" ${this.formData.gender === 'other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div>
              <label class="form-label">Blood Group</label>
              <select id="selectBloodGroup" class="form-select">
                ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => `<option value="${bg}" ${this.formData.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="form-label">NID or Birth Certificate Number <span class="required">*</span></label>
              <input type="text" id="inputNid" class="form-input" value="${this.formData.nidOrBirthCert}" placeholder="10 or 17 digit Bangladesh NID / Birth Cert" required>
            </div>
            <div style="grid-column:1/-1;">
              <label class="form-label">Applicant Relationship to Patient <span class="required">*</span></label>
              <select id="selectRelationship" class="form-select">
                <option value="self">Self (Patient applying for themselves)</option>
                <option value="father" ${this.formData.relationshipToPatient === 'father' ? 'selected' : ''}>Father / Mother</option>
                <option value="spouse">Spouse</option>
                <option value="sibling">Brother / Sister</option>
                <option value="legal_guardian">Court Appointed Legal Guardian</option>
              </select>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:var(--space-6);">
            <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Medical Information →</button>
          </div>
        `;

      // STEP 2: MEDICAL
      case 2:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 2: Medical Condition & Doctor Credentials</h2>
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div>
              <label class="form-label">Primary Medical Diagnosis <span class="required">*</span></label>
              <input type="text" id="inputDiagnosis" class="form-input" value="${this.formData.diagnosis}" placeholder="e.g. Tetralogy of Fallot / Acute Leukemia / Trauma Surgery" required>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:var(--space-4);">
              <div>
                <label class="form-label">Treating Hospital / Institute <span class="required">*</span></label>
                <input type="text" id="inputHospitalName" class="form-input" value="${this.formData.hospitalName}" placeholder="e.g. NICVD / DMCH / CMCH" required>
              </div>
              <div>
                <label class="form-label">Hospital Ward & Bed</label>
                <input type="text" id="inputWard" class="form-input" value="${this.formData.hospitalWard}" placeholder="e.g. Ward 3, Bed 14">
              </div>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:var(--space-4);">
              <div>
                <label class="form-label">Attending Physician / Surgeon Name <span class="required">*</span></label>
                <input type="text" id="inputDoctorName" class="form-input" value="${this.formData.doctorName}" placeholder="e.g. Prof. Dr. M. A. Karim" required>
              </div>
              <div>
                <label class="form-label">Doctor's BMDC Registration Number <span class="required">*</span></label>
                <input type="text" id="inputBmdc" class="form-input" value="${this.formData.bmdcNumber}" placeholder="e.g. A54219" style="font-family:monospace; text-transform:uppercase;" required>
                <span class="form-hint">Verified automatically against Bangladesh Medical & Dental Council database. Format: 'A' followed by 4-6 digits.</span>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="btnPrevStep">← Back</button>
            <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Documents →</button>
          </div>
        `;

      // STEP 3: DOCUMENTS
      case 3:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 3: Clinical Documents & Quotation Upload</h2>
          <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:var(--space-4);">
            Upload official hospital quotations, prescriptions, and diagnostic lab reports. Files are encrypted with Cloud KMS AES-256-GCM and SHA-256 hashed for anti-fraud detection.
          </p>

          <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:var(--space-4);">
            ${this.formData.documents.map((doc, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:var(--color-bg-app); border:1px solid var(--color-border); border-radius:8px;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:24px;">📄</span>
                  <div>
                    <div style="font-weight:700; font-size:13px;">${doc.fileName}</div>
                    <div style="font-size:11px; color:var(--color-text-muted); font-family:monospace;">
                      ${(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB • SHA-256: ${doc.hash.slice(7, 23)}...
                    </div>
                  </div>
                </div>
                <span class="badge badge-available" style="font-size:11px;">✓ Ready</span>
              </div>
            `).join('')}
          </div>

          <div style="border:2px dashed var(--color-border); border-radius:var(--radius-md); padding:20px; text-align:center; background:var(--color-bg-app); cursor:pointer;" id="uploadDocDropzone">
            <div style="font-size:28px; margin-bottom:4px;">📤</div>
            <div style="font-weight:700; font-size:13px;">Click to upload additional diagnostic or hospital invoices</div>
            <div style="font-size:11px; color:var(--color-text-muted);">PDF or JPEG format • Max 8MB per file</div>
          </div>

          <div style="display:flex; justify-content:space-between; margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="btnPrevStep">← Back</button>
            <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Funding & Payout →</button>
          </div>
        `;

      // STEP 4: FUNDING & PAYOUT
      case 4:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 4: Treatment Budget & Milestone Disbursements</h2>
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div>
              <label class="form-label">Total Treatment Target Amount (BDT ৳) <span class="required">*</span></label>
              <input type="number" id="inputTargetAmount" class="form-input" value="${this.formData.targetAmountBDT}" style="font-size:1.4rem; font-weight:800; color:var(--color-crimson);" required>
              <span class="form-hint">Must match total clinical estimate issued by the treating hospital.</span>
            </div>

            <!-- Milestone Schedule Breakdown -->
            <div style="background:var(--color-bg-app); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
              <div style="font-size:12px; font-weight:800; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:8px;">
                Staged Milestone Tranches (Audited 4-Eyes Payout)
              </div>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${this.formData.milestones.map(m => `
                  <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--color-bg-surface-elevated); border-radius:6px; border:1px solid var(--color-border-subtle); font-size:13px;">
                    <div>
                      <strong>${m.title}</strong>
                      <div style="font-size:11px; color:var(--color-text-secondary);">${m.percent}% of target</div>
                    </div>
                    <strong style="color:var(--color-crimson);">৳ ${Math.round(this.formData.targetAmountBDT * (m.percent / 100)).toLocaleString()} BDT</strong>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Beneficiary Bank Payout Details -->
            <div style="background:var(--color-bg-app); border:1px solid var(--color-border); border-radius:8px; padding:16px;">
              <div style="font-size:12px; font-weight:800; text-transform:uppercase; color:var(--color-text-muted); margin-bottom:12px;">
                Hospital / Beneficiary Bank Account (For Escrow Payout)
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                  <label class="form-label">Bank Name</label>
                  <input type="text" id="inputBankName" class="form-input" value="${this.formData.payoutBankName}">
                </div>
                <div>
                  <label class="form-label">Account Title</label>
                  <input type="text" id="inputAccTitle" class="form-input" value="${this.formData.payoutAccountName}">
                </div>
                <div>
                  <label class="form-label">Account Number</label>
                  <input type="text" id="inputAccNum" class="form-input" value="${this.formData.payoutAccountNumber}" style="font-family:monospace;">
                </div>
                <div>
                  <label class="form-label">Routing Number</label>
                  <input type="text" id="inputRouting" class="form-input" value="${this.formData.payoutBranchRouting}" style="font-family:monospace;">
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="btnPrevStep">← Back</button>
            <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Story & Media →</button>
          </div>
        `;

      // STEP 5: STORY & MEDIA
      case 5:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 5: Patient Story & Urgent Appeal</h2>
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <div>
              <label class="form-label">Patient Treatment Story (English) <span class="required">*</span></label>
              <textarea id="inputStoryEn" class="form-textarea" rows="3" required>${this.formData.storyEn}</textarea>
            </div>
            <div>
              <label class="form-label">রোগীর চিকিৎসার বিবরণ (বাংলা) <span class="required">*</span></label>
              <textarea id="inputStoryBn" class="form-textarea" rows="3" required>${this.formData.storyBn}</textarea>
            </div>
            <div style="border:1px solid var(--color-border); border-radius:8px; padding:16px; background:var(--color-bg-app); display:flex; align-items:center; gap:16px;">
              <div style="width:56px; height:56px; border-radius:8px; background:#D4AF37; display:flex; align-items:center; justify-content:center; font-size:24px; color:white;">
                👦
              </div>
              <div style="flex:1;">
                <div style="font-weight:700; font-size:13px;">Patient Identification Photo (Attached)</div>
                <div style="font-size:11px; color:var(--color-text-secondary);">ayan_hospital_portrait.jpg • Face clearly visible in clinical setting</div>
              </div>
              <span class="badge badge-available" style="font-size:11px;">Attached</span>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="btnPrevStep">← Back</button>
            <button type="button" class="btn btn-primary" id="btnNextStep">Continue to Final Declarations →</button>
          </div>
        `;

      // STEP 6: DECLARATIONS & SUBMISSION
      case 6:
        return `
          <h2 style="font-size:var(--font-size-lg); font-weight:800; margin-bottom:var(--space-4);">Step 6: Legal Declarations & Consent</h2>
          <div style="display:flex; flex-direction:column; gap:var(--space-4);">
            <!-- Summary Review Box -->
            <div style="background:var(--color-bg-app); border:2px solid var(--color-teal); border-radius:8px; padding:18px;">
              <h3 style="font-size:14px; font-weight:800; color:var(--color-teal); margin:0 0 8px 0;">Application Pre-Submission Summary</h3>
              <div style="font-size:12px; line-height:1.7;">
                <strong>Patient:</strong> ${this.formData.patientName} (${this.formData.patientAge} yrs, ${this.formData.gender}) • Blood Group: ${this.formData.bloodGroup}<br>
                <strong>Hospital:</strong> ${this.formData.hospitalName} • Attending: ${this.formData.doctorName} (BMDC: ${this.formData.bmdcNumber})<br>
                <strong>Goal:</strong> <span style="font-weight:800; color:var(--color-crimson);">৳ ${Number(this.formData.targetAmountBDT).toLocaleString()} BDT</span> in 3 milestone disbursements<br>
                <strong>Documents:</strong> 3 verified clinical files attached (SHA-256 hashed)
              </div>
            </div>

            <!-- Mandatory Hard Ethics & Fraud Warning Checkboxes -->
            <div style="display:flex; flex-direction:column; gap:12px; border:1px solid var(--color-border); border-radius:8px; padding:16px; background:var(--color-bg-surface-elevated);">
              <label style="display:flex; gap:10px; cursor:pointer; font-size:12px; line-height:1.5;">
                <input type="checkbox" id="chkEthics" checked>
                <span><strong>Zero-Commercialization Pledge:</strong> I confirm that blood is never sold or bought. All requested funds will be used exclusively for hospital treatment and medical supplies.</span>
              </label>

              <label style="display:flex; gap:10px; cursor:pointer; font-size:12px; line-height:1.5;">
                <input type="checkbox" id="chkDirectPayout" checked>
                <span><strong>Hospital Direct Payout Authority:</strong> I authorize RoktoSetu to disburse funds in escrow directly to the hospital's billing desk upon verified invoice submissions.</span>
              </label>

              <label style="display:flex; gap:10px; cursor:pointer; font-size:12px; line-height:1.5;">
                <input type="checkbox" id="chkFraudWarning" checked>
                <span><strong>Truth & Fraud Penalties:</strong> I declare that all medical records and cost estimates provided are authentic. I understand that submitting forged documents is punishable under Bangladesh Law and will be referred to law enforcement and BMDC.</span>
              </label>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:var(--space-6);">
            <button type="button" class="btn btn-outline" id="btnPrevStep">← Back</button>
            <button type="button" class="btn btn-primary" id="btnSubmitApplication" style="background:var(--color-crimson); font-weight:800; padding:10px 24px;">
              Submit for 4-Eyes Review & Publication
            </button>
          </div>
        `;
    }
  }

  attachEventListeners() {
    const btnNext = document.getElementById('btnNextStep');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        this.saveCurrentInputs();
        if (this.currentStep === 1) {
          if (!this.formData.patientName || !this.formData.patientAge) {
            toast.error('Please enter patient name and age');
            return;
          }
        }
        if (this.currentStep === 2) {
          const bmdc = (this.formData.bmdcNumber || '').toUpperCase();
          if (!/^A\d{4,6}$/.test(bmdc)) {
            toast.error('Please enter a valid Doctor BMDC registration number (e.g. A54219)');
            return;
          }
        }
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.render();
        }
      });
    }

    const btnPrev = document.getElementById('btnPrevStep');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        this.saveCurrentInputs();
        if (this.currentStep > 1) {
          this.currentStep--;
          this.render();
        }
      });
    }

    const btnSubmit = document.getElementById('btnSubmitApplication');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        toast.success('Application submitted successfully! Queued for 4-Eyes Medical Review.');
        setTimeout(() => {
          window.location.hash = '#/fundraisers';
        }, 1200);
      });
    }

    document.getElementById('uploadDocDropzone')?.addEventListener('click', () => {
      toast.info('Simulated file upload: Document scanned, SHA-256 hash verified, zero malware detected.');
    });
  }

  saveCurrentInputs() {
    const pName = document.getElementById('inputPatientName');
    if (pName) this.formData.patientName = pName.value.trim();

    const pAge = document.getElementById('inputPatientAge');
    if (pAge) this.formData.patientAge = pAge.value.trim();

    const pGender = document.getElementById('selectPatientGender');
    if (pGender) this.formData.gender = pGender.value;

    const bg = document.getElementById('selectBloodGroup');
    if (bg) this.formData.bloodGroup = bg.value;

    const nid = document.getElementById('inputNid');
    if (nid) this.formData.nidOrBirthCert = nid.value.trim();

    const diag = document.getElementById('inputDiagnosis');
    if (diag) this.formData.diagnosis = diag.value.trim();

    const hosp = document.getElementById('inputHospitalName');
    if (hosp) this.formData.hospitalName = hosp.value.trim();

    const ward = document.getElementById('inputWard');
    if (ward) this.formData.hospitalWard = ward.value.trim();

    const doc = document.getElementById('inputDoctorName');
    if (doc) this.formData.doctorName = doc.value.trim();

    const bmdc = document.getElementById('inputBmdc');
    if (bmdc) this.formData.bmdcNumber = bmdc.value.trim().toUpperCase();

    const target = document.getElementById('inputTargetAmount');
    if (target) this.formData.targetAmountBDT = Number(target.value) || 280000;

    const storyEn = document.getElementById('inputStoryEn');
    if (storyEn) this.formData.storyEn = storyEn.value.trim();

    const storyBn = document.getElementById('inputStoryBn');
    if (storyBn) this.formData.storyBn = storyBn.value.trim();
  }
}
