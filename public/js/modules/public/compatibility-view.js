/**
 * @file compatibility-view.js
 * @description Interactive Blood Group Compatibility Matrix (RBC, Platelets & Plasma).
 */

export class BloodCompatibilityView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedGroup = 'O-';
    this.selectedComponent = 'rbc'; // 'rbc' | 'plasma' | 'platelets'

    this.matrix = {
      'O-': { canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
      'O+': { canGiveTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
      'A-': { canGiveTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
      'A+': { canGiveTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
      'B-': { canGiveTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
      'B+': { canGiveTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
      'AB-': { canGiveTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
      'AB+': { canGiveTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
    };
  }

  render() {
    if (!this.container) return;

    const data = this.matrix[this.selectedGroup];
    const allGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:980px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:var(--space-8);">
          <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-size:11px; font-weight:800; margin-bottom:8px;">
            CLINICAL TRANSFUSION SCIENCE
          </span>
          <h1 style="font-size:var(--font-size-3xl); font-weight:900;">Blood Compatibility Matrix</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); max-width:600px; margin:6px auto 0;">
            Select your blood group below to see who you can save and who you can safely receive blood from.
          </p>
        </div>

        <!-- Group Selector Buttons -->
        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:var(--space-8);">
          ${allGroups.map(grp => `
            <button type="button" class="btn ${this.selectedGroup === grp ? 'btn-primary' : 'btn-outline'} btn-select-grp" data-group="${grp}" style="width:68px; font-weight:900; font-size:1.1rem; padding:10px 0;">
              ${grp}
            </button>
          `).join('')}
        </div>

        <!-- Highlight Banner -->
        <div class="card" style="margin-bottom:var(--space-8); border:2px solid var(--color-crimson); background:var(--color-bg-surface); text-align:center; padding:var(--space-6);">
          <div style="font-size:var(--font-size-xs); font-weight:700; text-transform:uppercase; color:var(--color-text-secondary);">Selected Blood Group</div>
          <div style="font-size:3rem; font-weight:900; color:var(--color-crimson); margin:4px 0;">${this.selectedGroup}</div>
          <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">
            ${this.selectedGroup === 'O-' ? '🌟 <strong>Universal Red Cell Donor:</strong> Your red cells can be transfused to ANY patient in emergency trauma.' :
              this.selectedGroup === 'AB+' ? '🌟 <strong>Universal Red Cell Recipient:</strong> You can safely receive red cells from ANY blood group!' :
              `Vital lifesaving donor for patients matching your compatibility profile.`}
          </div>
        </div>

        <!-- Compatibility Grids: Give vs Receive -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-6); margin-bottom:var(--space-8);">
          <!-- Can Give To -->
          <div class="card" style="border-top:4px solid var(--color-crimson);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h2 style="font-size:var(--font-size-md); font-weight:800; color:var(--color-crimson);">You Can Donate To:</h2>
              <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-weight:800;">${data.canGiveTo.length} Groups</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
              ${allGroups.map(grp => {
                const can = data.canGiveTo.includes(grp);
                return `
                  <div style="padding:10px; border-radius:var(--radius-sm); border:1px solid ${can ? 'var(--color-crimson)' : 'var(--color-border)'}; background:${can ? 'var(--color-crimson-subtle)' : 'var(--color-bg-base)'}; opacity:${can ? '1' : '0.4'};">
                    <div style="font-weight:900; font-size:16px; color:${can ? 'var(--color-crimson)' : 'var(--color-text-muted)'};">${grp}</div>
                    <div style="font-size:10px; font-weight:700; margin-top:2px;">${can ? '✓ MATCH' : '✗ NO'}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Can Receive From -->
          <div class="card" style="border-top:4px solid var(--color-teal);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h2 style="font-size:var(--font-size-md); font-weight:800; color:var(--color-teal);">You Can Receive From:</h2>
              <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-teal); font-weight:800;">${data.canReceiveFrom.length} Groups</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
              ${allGroups.map(grp => {
                const can = data.canReceiveFrom.includes(grp);
                return `
                  <div style="padding:10px; border-radius:var(--radius-sm); border:1px solid ${can ? 'var(--color-teal)' : 'var(--color-border)'}; background:${can ? 'var(--color-teal-subtle)' : 'var(--color-bg-base)'}; opacity:${can ? '1' : '0.4'};">
                    <div style="font-weight:900; font-size:16px; color:${can ? 'var(--color-teal)' : 'var(--color-text-muted)'};">${grp}</div>
                    <div style="font-size:10px; font-weight:700; margin-top:2px;">${can ? '✓ MATCH' : '✗ NO'}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Educational Component Breakdown -->
        <div class="card" style="background:var(--color-bg-base);">
          <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:var(--space-4);">Blood Components & Shelf Life</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; font-size:var(--font-size-xs);">
            <div style="background:var(--color-bg-surface); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              <strong style="color:var(--color-crimson); font-size:13px; display:block; margin-bottom:4px;">Whole Red Blood Cells (RBC)</strong>
              <span>Shelf life: <strong>35 - 42 days</strong> at 2°C–6°C. Used in major surgeries, road accidents, and chronic anemia.</span>
            </div>
            <div style="background:var(--color-bg-surface); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              <strong style="color:#E9C46A; font-size:13px; display:block; margin-bottom:4px;">Platelets (Apheresis)</strong>
              <span>Shelf life: <strong>5 days</strong> with constant gentle agitation. Vital for Dengue fever patients and leukemia chemotherapy.</span>
            </div>
            <div style="background:var(--color-bg-surface); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--color-border);">
              <strong style="color:var(--color-teal); font-size:13px; display:block; margin-bottom:4px;">Fresh Frozen Plasma (FFP)</strong>
              <span>Shelf life: <strong>1 year</strong> frozen at -18°C. Used for burn trauma, severe liver disease, and clotting disorders.</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    this.container.querySelectorAll('.btn-select-grp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedGroup = e.currentTarget.getAttribute('data-group');
        this.render();
      });
    });
  }
}
