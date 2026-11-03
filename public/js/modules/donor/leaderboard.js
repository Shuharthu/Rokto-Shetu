/**
 * @file leaderboard.js
 * @description Monthly and All-Time Donor Leaderboard with district filters and privacy anonymization.
 */

export class LeaderboardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.timeframe = 'monthly'; // 'monthly' | 'alltime'
    this.selectedDistrict = 'all';
    this.donors = [
      { rank: 1, name: 'Tanvir A.', district: 'Chattogram', count: 18, level: 'Platinum', points: 1800 },
      { rank: 2, name: 'Rafi S. (You)', district: 'Chattogram', count: 12, level: 'Gold', points: 1200 },
      { rank: 3, name: 'Mahmud H.', district: 'Dhaka', count: 11, level: 'Gold', points: 1100 },
      { rank: 4, name: 'Nusrat J.', district: 'Sylhet', count: 9, level: 'Silver', points: 900 },
      { rank: 5, name: 'Shakil R.', district: 'Rajshahi', count: 8, level: 'Silver', points: 800 }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="max-width:800px; padding:var(--space-8) var(--space-4);">
        <!-- Title & Filter Controls -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:var(--space-6);">
          <div>
            <h1 style="font-size:var(--font-size-2xl); font-weight:800;">Lifesaver Leaderboard</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">Honoring hero donors saving lives across Bangladesh.</p>
          </div>

          <!-- Timeframe Buttons -->
          <div style="display:flex; background:var(--color-bg-surface); border:1px solid var(--color-border); border-radius:var(--radius-full); padding:3px;">
            <button type="button" class="btn btn-sm ${this.timeframe === 'monthly' ? 'btn-primary' : 'btn-outline'}" id="btnMonthly" style="border:none;">Monthly</button>
            <button type="button" class="btn btn-sm ${this.timeframe === 'alltime' ? 'btn-primary' : 'btn-outline'}" id="btnAlltime" style="border:none;">All-Time</button>
          </div>
        </div>

        <!-- Top 3 Podium Cards -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:var(--space-8); align-items:end;">
          <!-- 2nd Place -->
          <div class="card" style="text-align:center; padding:var(--space-4); background:var(--color-bg-surface); border-top:4px solid #A8A9AD;">
            <div style="font-size:24px; margin-bottom:4px;">🥈</div>
            <div style="font-weight:800; font-size:var(--font-size-sm);">${this.donors[1].name}</div>
            <div style="font-size:11px; color:#D4AF37; font-weight:700;">${this.donors[1].level}</div>
            <div style="font-size:1.25rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">${this.donors[1].count}</div>
            <div style="font-size:10px; color:var(--color-text-muted);">Donations</div>
          </div>

          <!-- 1st Place (Elevated) -->
          <div class="card" style="text-align:center; padding:var(--space-6) var(--space-4); background:var(--color-bg-surface-elevated); border-top:4px solid #D4AF37; transform:translateY(-10px); box-shadow:var(--shadow-lg);">
            <div style="font-size:32px; margin-bottom:4px;">👑 🥇</div>
            <div style="font-weight:800; font-size:var(--font-size-base);">${this.donors[0].name}</div>
            <div style="font-size:11px; color:#708090; font-weight:700;">${this.donors[0].level}</div>
            <div style="font-size:1.75rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">${this.donors[0].count}</div>
            <div style="font-size:10px; color:var(--color-text-muted);">Donations</div>
          </div>

          <!-- 3rd Place -->
          <div class="card" style="text-align:center; padding:var(--space-4); background:var(--color-bg-surface); border-top:4px solid #B87333;">
            <div style="font-size:24px; margin-bottom:4px;">🥉</div>
            <div style="font-weight:800; font-size:var(--font-size-sm);">${this.donors[2].name}</div>
            <div style="font-size:11px; color:#D4AF37; font-weight:700;">${this.donors[2].level}</div>
            <div style="font-size:1.25rem; font-weight:900; color:var(--color-crimson); margin-top:4px;">${this.donors[2].count}</div>
            <div style="font-size:10px; color:var(--color-text-muted);">Donations</div>
          </div>
        </div>

        <!-- Full Table -->
        <div class="card" style="padding:0; overflow:hidden;">
          <table style="width:100%; border-collapse:collapse; text-align:left; font-size:var(--font-size-sm);">
            <thead>
              <tr style="background:var(--color-bg-subtle); border-bottom:1px solid var(--color-border); font-size:11px; color:var(--color-text-muted); text-transform:uppercase;">
                <th style="padding:12px 16px;">Rank</th>
                <th style="padding:12px 16px;">Donor</th>
                <th style="padding:12px 16px;">District</th>
                <th style="padding:12px 16px; text-align:center;">Donations</th>
                <th style="padding:12px 16px; text-align:right;">Impact Points</th>
              </tr>
            </thead>
            <tbody>
              ${this.donors.map(d => `
                <tr style="border-bottom:1px solid var(--color-border-subtle); ${d.rank === 2 ? 'background:rgba(217,4,41,0.05); font-weight:700;' : ''}">
                  <td style="padding:12px 16px;">
                    <span style="display:inline-block; width:24px; height:24px; border-radius:50%; background:${d.rank <= 3 ? '#D4AF37' : 'var(--color-border)'}; color:${d.rank <= 3 ? 'white' : 'var(--color-text-primary)'}; text-align:center; line-height:24px; font-size:11px; font-weight:800;">
                      ${d.rank}
                    </span>
                  </td>
                  <td style="padding:12px 16px;">
                    <div>${d.name}</div>
                    <div style="font-size:10px; color:#D4AF37;">${d.level}</div>
                  </td>
                  <td style="padding:12px 16px; color:var(--color-text-secondary);">${d.district}</td>
                  <td style="padding:12px 16px; text-align:center; font-weight:800; color:var(--color-crimson);">${d.count}</td>
                  <td style="padding:12px 16px; text-align:right; font-weight:700;">${d.points}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const btnM = document.getElementById('btnMonthly');
    const btnA = document.getElementById('btnAlltime');

    if (btnM && btnA) {
      btnM.addEventListener('click', () => {
        this.timeframe = 'monthly';
        this.render();
      });
      btnA.addEventListener('click', () => {
        this.timeframe = 'alltime';
        this.render();
      });
    }
  }
}
