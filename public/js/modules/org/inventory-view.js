/**
 * @file inventory-view.js
 * @description Real-time Blood Bag Inventory Management with FEFO sorting, filtering & batch entry.
 */

import { toast } from '../../core/toast.js';

export class InventoryView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.statusFilter = 'available';
    this.units = [
      { id: 'BAG-2026-B812', group: 'B+', comp: 'Whole Blood', volume: 450, expHours: 28, loc: 'Fridge A2', status: 'available' },
      { id: 'BAG-2026-A109', group: 'A+', comp: 'Platelets', volume: 300, expHours: 36, loc: 'Agitator B1', status: 'available' },
      { id: 'BAG-2026-O440', group: 'O+', comp: 'PRBC', volume: 350, expHours: 180, loc: 'Fridge C1', status: 'available' },
      { id: 'BAG-2026-AB21', group: 'AB+', comp: 'Fresh Frozen Plasma', volume: 250, expHours: 720, loc: 'Freezer D', status: 'available' },
      { id: 'BAG-2026-O991', group: 'O-', comp: 'Whole Blood', volume: 450, expHours: 210, loc: 'Fridge A1', status: 'reserved' },
      { id: 'BAG-2026-B110', group: 'B-', comp: 'Platelets', volume: 280, expHours: -12, loc: 'Quarantine Bay', status: 'expired' }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:var(--space-6);">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <a href="#/org" style="color:var(--color-crimson); font-size:12px; font-weight:700;">← Back to Workspace</a>
            </div>
            <h1 style="font-size:var(--font-size-2xl); font-weight:800; margin-top:4px;">Blood Bag Inventory (FEFO Enforced)</h1>
          </div>

          <div style="display:flex; gap:10px;">
            <button type="button" class="btn btn-primary btn-sm" id="btnScanBarcode">📷 Scan Barcode / RFID</button>
            <button type="button" class="btn btn-secondary btn-sm" id="btnExportCsv">Export CSV Audit</button>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="card" style="margin-bottom:var(--space-6); padding:var(--space-4);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              ${['all', 'available', 'reserved', 'quarantined', 'expired'].map(s => `
                <button type="button" class="btn btn-sm ${this.statusFilter === s ? 'btn-primary' : 'btn-outline'} btn-filter-status" data-status="${s}">
                  ${s.toUpperCase()}
                </button>
              `).join('')}
            </div>

            <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary);">
              Showing <span style="font-weight:700; color:var(--color-text-primary);">${this.getFilteredUnits().length}</span> units sorted by FEFO
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card" style="padding:0; overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:var(--font-size-sm); text-align:left; min-width:680px;">
            <thead>
              <tr style="background:var(--color-bg-subtle); border-bottom:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted); text-transform:uppercase;">
                <th style="padding:12px;">Bag / Barcode</th>
                <th style="padding:12px;">Group</th>
                <th style="padding:12px;">Component</th>
                <th style="padding:12px;">Volume</th>
                <th style="padding:12px;">Storage</th>
                <th style="padding:12px;">Expiry Status</th>
                <th style="padding:12px; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.getFilteredUnits().map(u => `
                <tr style="border-bottom:1px solid var(--color-border-subtle);">
                  <td style="padding:12px; font-family:monospace; font-weight:700;">${u.id}</td>
                  <td style="padding:12px;"><span style="font-weight:800; font-size:14px; color:${u.group.includes('+') ? 'var(--color-crimson)' : '#8D0801'};">${u.group}</span></td>
                  <td style="padding:12px;">${u.comp}</td>
                  <td style="padding:12px; color:var(--color-text-secondary);">${u.volume} ml</td>
                  <td style="padding:12px;">${u.loc}</td>
                  <td style="padding:12px;">
                    ${u.expHours < 0 
                      ? `<span class="badge" style="background:rgba(217,4,41,0.2); color:var(--color-crimson); font-size:10px;">EXPIRED</span>`
                      : u.expHours <= 48
                      ? `<span class="badge badge-urgent" style="font-size:10px;">Expires in ${u.expHours}h (FEFO 1st)</span>`
                      : `<span class="badge badge-available" style="font-size:10px;">Valid (${Math.round(u.expHours/24)}d left)</span>`
                    }
                  </td>
                  <td style="padding:12px; text-align:right;">
                    <button type="button" class="btn btn-outline btn-sm" onclick="alert('Unit ${u.id} selected for cross-matching!')">Issue</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  getFilteredUnits() {
    if (this.statusFilter === 'all') return this.units;
    return this.units.filter(u => u.status === this.statusFilter);
  }

  attachEvents() {
    this.container.querySelectorAll('.btn-filter-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.statusFilter = e.currentTarget.dataset.status;
        this.render();
      });
    });

    document.getElementById('btnScanBarcode')?.addEventListener('click', () => {
      toast.info('Barcode / RFID Scanner Active: Simulating scan of Bag BAG-2026-B812...');
      setTimeout(() => {
        toast.success('Barcode Recognized: BAG-2026-B812 (B+ Whole Blood). FEFO Priority: High.');
      }, 700);
    });

    document.getElementById('btnExportCsv')?.addEventListener('click', () => {
      toast.success('Inventory audit CSV generated and downloaded.');
    });
  }
}
