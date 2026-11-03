/**
 * @file campaign-list-view.js
 * @description Public Directory of Verified Critical Patient Medical Fundraisers.
 */

export class FundraiserListView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedCategory = 'all';
    this.searchQuery = '';

    this.campaigns = [
      {
        id: 'fund_101',
        patientName: 'Baby Ayan Hossain',
        patientAge: '4 yrs',
        category: 'pediatric',
        diagnosis: 'Congenital Heart Defect (VSD + Coarctation)',
        hospitalName: 'National Institute of Cardiovascular Diseases (NICVD)',
        doctorName: 'Prof. Dr. M. A. Karim (BMDC A54219)',
        targetBDT: 350000,
        raisedBDT: 245000,
        donorsCount: 142,
        daysLeft: 8,
        imageUrl: '/assets/logo.jpg'
      },
      {
        id: 'fund_102',
        patientName: 'Sumona Akter',
        patientAge: '19 yrs',
        category: 'cancer',
        diagnosis: 'Acute Myeloid Leukemia (Chemotherapy & BMT)',
        hospitalName: 'National Institute of Cancer Research & Hospital (NICRH)',
        doctorName: 'Dr. Farhana Yasmin (BMDC A38290)',
        targetBDT: 600000,
        raisedBDT: 480000,
        donorsCount: 310,
        daysLeft: 14,
        imageUrl: '/assets/logo.jpg'
      },
      {
        id: 'fund_103',
        patientName: 'Abdur Rahim',
        patientAge: '45 yrs',
        category: 'trauma',
        diagnosis: 'Severe Road Traffic Trauma (Multiple Pelvic Fractures)',
        hospitalName: 'National Institute of Traumatology (NITOR)',
        doctorName: 'Dr. K. M. Hasan (BMDC A41905)',
        targetBDT: 180000,
        raisedBDT: 110000,
        donorsCount: 68,
        daysLeft: 5,
        imageUrl: '/assets/logo.jpg'
      }
    ];
  }

  render() {
    if (!this.container) return;

    const filtered = this.campaigns.filter(c => {
      const matchCat = this.selectedCategory === 'all' || c.category === this.selectedCategory;
      const matchSearch = !this.searchQuery || 
        c.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.diagnosis.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.hospitalName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);">
        <!-- Top Hero Banner -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:var(--space-8);">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-weight:800; font-size:11px;">
                100% TRANSPARENT MEDICAL AID
              </span>
              <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:700; font-size:11px;">
                ✓ 4-Eyes Verified
              </span>
            </div>
            <h1 style="font-size:var(--font-size-3xl); font-weight:900; margin-top:6px;">Critical Patient Medical Fundraisers</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
              Direct financial support for lifesaving surgeries and hospital treatments. Zero platform fees on medical tranches.
            </p>
          </div>

          <div style="display:flex; gap:12px;">
            <a href="#/fundraiser/apply" class="btn btn-primary" style="font-weight:800;">+ Apply for Patient Support</a>
            <a href="#/fundraiser/payout" class="btn btn-outline" style="font-size:12px;">Milestone Invoices</a>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-6);">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${[
              { id: 'all', label: 'All Emergencies' },
              { id: 'pediatric', label: 'Pediatric' },
              { id: 'cancer', label: 'Cancer & Leukemia' },
              { id: 'trauma', label: 'Trauma & Surgery' }
            ].map(cat => `
              <button type="button" class="btn ${this.selectedCategory === cat.id ? 'btn-primary' : 'btn-outline'} btn-sm filter-cat-btn" data-category="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>

          <div style="width:280px;">
            <input type="text" id="fundraiserSearchInput" class="input" placeholder="Search patient, hospital, diagnosis..." value="${this.searchQuery}" style="width:100%; font-size:12px;">
          </div>
        </div>

        <!-- Campaign Cards Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:var(--space-6);">
          ${filtered.map(c => {
            const pct = Math.min(100, Math.round((c.raisedBDT / c.targetBDT) * 100));
            return `
              <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border:1px solid var(--color-border); border-radius:var(--radius-lg); overflow:hidden; padding:0;">
                <div style="padding:16px 20px;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                      <span class="badge" style="background:var(--color-bg-subtle); border:1px solid var(--color-border); font-size:10px; font-weight:700; text-transform:uppercase;">${c.category}</span>
                      <h3 style="font-size:var(--font-size-md); font-weight:800; margin-top:6px;">${c.patientName}</h3>
                      <div style="font-size:11px; color:var(--color-text-secondary);">${c.patientAge} &bull; ${c.diagnosis}</div>
                    </div>
                    <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-size:10px; font-weight:800;">
                      BMDC VERIFIED
                    </span>
                  </div>

                  <div style="font-size:11px; color:var(--color-text-secondary); margin-bottom:16px; background:var(--color-bg-base); padding:8px 10px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
                    🏥 <strong>${c.hospitalName}</strong><br>
                    👨‍⚕️ ${c.doctorName}
                  </div>

                  <!-- Progress Bar -->
                  <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; margin-bottom:4px;">
                      <span style="color:var(--color-crimson);">৳ ${c.raisedBDT.toLocaleString()}</span>
                      <span style="color:var(--color-text-secondary);">Goal: ৳ ${c.targetBDT.toLocaleString()}</span>
                    </div>
                    <div style="width:100%; height:8px; background:var(--color-bg-surface); border-radius:4px; overflow:hidden; border:1px solid var(--color-border);">
                      <div style="width:${pct}%; height:100%; background:var(--color-crimson); border-radius:4px;"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--color-text-secondary); margin-top:4px;">
                      <span>${pct}% Funded</span>
                      <span>${c.donorsCount} Donors &bull; ${c.daysLeft} days left</span>
                    </div>
                  </div>
                </div>

                <div style="padding:12px 20px; background:var(--color-bg-surface); border-top:1px solid var(--color-border); display:flex; gap:8px;">
                  <a href="#/fundraiser/view?id=${c.id}" class="btn btn-primary btn-block" style="font-size:12px; font-weight:800;">Support Patient</a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.filter-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedCategory = e.currentTarget.getAttribute('data-category');
        this.render();
      });
    });

    const searchInput = document.getElementById('fundraiserSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
      });
    }
  }
}
