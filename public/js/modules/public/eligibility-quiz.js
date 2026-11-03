/**
 * @file eligibility-quiz.js
 * @description Interactive Blood Donor Eligibility Quiz based on Bangladesh Health Standards.
 */

export class DonorEligibilityQuiz {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.step = 1;
    this.answers = {
      age: 24,
      weight: 62,
      gender: 'male',
      lastDonatedDays: 100,
      hadRecentSurgery: 'no',
      feelingWellToday: 'yes'
    };
    this.result = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:680px;">
        <div style="text-align:center; margin-bottom:var(--space-8);">
          <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:11px; font-weight:800; margin-bottom:8px;">
            1-MINUTE HEALTH CHECK
          </span>
          <h1 style="font-size:var(--font-size-2xl); font-weight:900;">Can I Donate Blood Today?</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
            Answer a few quick questions to check your clinical eligibility before travelling to a donor center.
          </p>
        </div>

        <div class="card" style="padding:var(--space-8);">
          ${this.result ? this.renderResult() : this.renderQuizQuestions()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  renderQuizQuestions() {
    return `
      <div style="display:flex; flex-direction:column; gap:var(--space-6);">
        <!-- Question 1: Age & Weight -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Your Age (Years)</label>
            <input type="number" id="inputQuizAge" class="input" value="${this.answers.age}" min="15" max="80" style="width:100%;">
            <span style="font-size:11px; color:var(--color-text-secondary);">Eligible range: 18 - 60</span>
          </div>
          <div>
            <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Weight (kg)</label>
            <input type="number" id="inputQuizWeight" class="input" value="${this.answers.weight}" min="30" max="150" style="width:100%;">
            <span style="font-size:11px; color:var(--color-text-secondary);">Minimum requirement: 50 kg</span>
          </div>
        </div>

        <!-- Question 2: Gender & Donation Gap -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          <div>
            <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Gender</label>
            <select id="selectQuizGender" class="input" style="width:100%;">
              <option value="male" ${this.answers.gender === 'male' ? 'selected' : ''}>Male (90 days interval)</option>
              <option value="female" ${this.answers.gender === 'female' ? 'selected' : ''}>Female (120 days interval)</option>
            </select>
          </div>
          <div>
            <label style="font-size:var(--font-size-xs); font-weight:700; display:block; margin-bottom:4px;">Days Since Last Donation</label>
            <input type="number" id="inputQuizLastDays" class="input" value="${this.answers.lastDonatedDays}" placeholder="90 or leave empty if first time" style="width:100%;">
          </div>
        </div>

        <!-- Question 3: Surgery & Health -->
        <div style="display:flex; flex-direction:column; gap:12px; border-top:1px dashed var(--color-border); padding-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:var(--font-size-xs); font-weight:700;">Any major surgery, tattoo, or piercing in last 6 months?</span>
            <select id="selectQuizSurgery" class="input" style="width:110px; font-size:12px;">
              <option value="no" ${this.answers.hadRecentSurgery === 'no' ? 'selected' : ''}>No</option>
              <option value="yes" ${this.answers.hadRecentSurgery === 'yes' ? 'selected' : ''}>Yes</option>
            </select>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:var(--font-size-xs); font-weight:700;">Are you feeling healthy, well, and fever-free today?</span>
            <select id="selectQuizHealth" class="input" style="width:110px; font-size:12px;">
              <option value="yes" ${this.answers.feelingWellToday === 'yes' ? 'selected' : ''}>Yes</option>
              <option value="no" ${this.answers.feelingWellToday === 'no' ? 'selected' : ''}>No</option>
            </select>
          </div>
        </div>

        <button type="button" class="btn btn-primary btn-block" id="btnEvaluateQuiz" style="padding:14px; font-weight:800; font-size:14px;">
          Check My Eligibility Now
        </button>
      </div>
    `;
  }

  renderResult() {
    const isEligible = this.result.eligible;

    return `
      <div style="text-align:center; padding:var(--space-4);">
        <div style="width:72px; height:72px; border-radius:50%; background:${isEligible ? 'var(--color-teal-subtle)' : 'var(--color-crimson-subtle)'}; color:${isEligible ? 'var(--color-teal)' : 'var(--color-crimson)'}; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto var(--space-4);">
          ${isEligible ? '✓' : '⏳'}
        </div>

        <h2 style="font-size:var(--font-size-xl); font-weight:900; margin-bottom:8px; color:${isEligible ? 'var(--color-teal)' : 'var(--color-crimson)'};">
          ${isEligible ? 'You Are Eligible to Donate!' : 'Temporary Deferral'}
        </h2>

        <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.6; margin-bottom:var(--space-6);">
          ${this.result.reason}
        </p>

        <div style="display:flex; justify-content:center; gap:12px;">
          ${isEligible ? `
            <a href="#/map" class="btn btn-primary" style="font-weight:800;">Find Nearby Patients on Map</a>
          ` : `
            <a href="#/availability" class="btn btn-outline">Schedule Future Availability</a>
          `}
          <button type="button" class="btn btn-outline" id="btnRetakeQuiz">Retake Check</button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const btnEvaluate = document.getElementById('btnEvaluateQuiz');
    if (btnEvaluate) {
      btnEvaluate.addEventListener('click', () => {
        const age = Number(document.getElementById('inputQuizAge')?.value) || 24;
        const weight = Number(document.getElementById('inputQuizWeight')?.value) || 60;
        const gender = document.getElementById('selectQuizGender')?.value || 'male';
        const lastDays = Number(document.getElementById('inputQuizLastDays')?.value) || 120;
        const surgery = document.getElementById('selectQuizSurgery')?.value || 'no';
        const health = document.getElementById('selectQuizHealth')?.value || 'yes';

        const minDays = gender === 'male' ? 90 : 120;

        if (age < 18 || age > 60) {
          this.result = { eligible: false, reason: `Donor age must be between 18 and 60 years. Your age (${age}) is outside the permitted medical range.` };
        } else if (weight < 50) {
          this.result = { eligible: false, reason: `Minimum weight requirement is 50 kg to ensure sufficient blood volume safety. Your weight: ${weight} kg.` };
        } else if (lastDays < minDays) {
          const waitDays = minDays - lastDays;
          this.result = { eligible: false, reason: `Donation recovery period is ${minDays} days for ${gender}s. Please wait another ${waitDays} days to allow red blood cells to fully replenish.` };
        } else if (surgery === 'yes') {
          this.result = { eligible: false, reason: `A 6-month recovery deferral applies following major surgical procedures, piercings, or tattoos.` };
        } else if (health === 'no') {
          this.result = { eligible: false, reason: `Please rest and recover. Donors must be 100% free of fever, cold, or acute symptoms on donation day.` };
        } else {
          this.result = { eligible: true, reason: `You meet all clinical parameters (Age ${age}, Weight ${weight} kg, ${gender}, ${lastDays} days gap). There are currently patients in urgent need near you.` };
        }

        this.render();
      });
    }

    const btnRetake = document.getElementById('btnRetakeQuiz');
    if (btnRetake) {
      btnRetake.addEventListener('click', () => {
        this.result = null;
        this.render();
      });
    }
  }
}
