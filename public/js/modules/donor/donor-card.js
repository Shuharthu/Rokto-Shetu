/**
 * @file donor-card.js
 * @description Digital Donor Pass / ID Card with Dynamic QR code and level badge.
 */

export class DigitalDonorCard {
  constructor(donorData = {}) {
    this.donor = {
      name: donorData.name || 'Rafi Shuharthu',
      bloodGroup: donorData.bloodGroup || 'B+',
      level: donorData.level || 'Gold Donor',
      donorId: donorData.donorId || 'RS-98214',
      totalDonations: donorData.totalDonations || 12,
      lastDonated: donorData.lastDonated || '15 Oct 2026',
      status: 'Verified Hero'
    };
  }

  render() {
    return `
      <div class="card" style="max-width:380px; margin:0 auto; background:linear-gradient(135deg, #1B1B1F 0%, #2A2A35 100%); color:#FFFFFF; border:2px solid #D4AF37; box-shadow:0 12px 32px rgba(0,0,0,0.4); border-radius:var(--radius-xl); overflow:hidden; position:relative;">
        <!-- Card Top Bar -->
        <div style="background:#D90429; padding:8px 16px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11px; font-weight:800; letter-spacing:1px; text-transform:uppercase;">
            DIGITAL DONOR PASS • রক্তসেতু
          </div>
          <span style="background:rgba(255,255,255,0.25); font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px;">
            VERIFIED
          </span>
        </div>

        <div style="padding:var(--space-6);">
          <!-- Profile & Blood Group Lockup -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:56px; height:56px; border-radius:50%; border:2px solid #D4AF37; background:#D4AF37; color:#1B1B1F; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:22px;">
                RS
              </div>
              <div>
                <h3 style="font-size:var(--font-size-lg); font-weight:800; margin:0;">${this.donor.name}</h3>
                <div style="font-size:11px; color:#D4AF37; font-weight:700;">★ ${this.donor.level}</div>
              </div>
            </div>

            <!-- Big Blood Group Badge -->
            <div style="width:50px; height:50px; border-radius:12px; background:#D90429; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:900; box-shadow:0 4px 12px rgba(217,4,41,0.5);">
              ${this.donor.bloodGroup}
            </div>
          </div>

          <!-- Donor Details Table -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:var(--space-6); font-size:11px; border-top:1px solid rgba(255,255,255,0.1); border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
            <div>
              <div style="color:#888;">DONOR ID</div>
              <div style="font-weight:700; font-family:monospace; font-size:13px;">${this.donor.donorId}</div>
            </div>
            <div>
              <div style="color:#888;">TOTAL DONATIONS</div>
              <div style="font-weight:700; font-size:13px; color:#2A9D8F;">${this.donor.totalDonations} Verified</div>
            </div>
          </div>

          <!-- QR Code for Instant Hospital Scanning -->
          <div style="background:#FFFFFF; padding:12px; border-radius:12px; display:flex; align-items:center; gap:14px;">
            <svg width="72" height="72" viewBox="0 0 100 100">
              <!-- Simulated QR Matrix -->
              <rect width="100" height="100" fill="#FFFFFF"/>
              <rect x="10" y="10" width="25" height="25" fill="#1B1B1F"/>
              <rect x="15" y="15" width="15" height="15" fill="#FFFFFF"/>
              <rect x="18" y="18" width="9" height="9" fill="#1B1B1F"/>
              
              <rect x="65" y="10" width="25" height="25" fill="#1B1B1F"/>
              <rect x="70" y="15" width="15" height="15" fill="#FFFFFF"/>
              <rect x="73" y="18" width="9" height="9" fill="#1B1B1F"/>

              <rect x="10" y="65" width="25" height="25" fill="#1B1B1F"/>
              <rect x="15" y="70" width="15" height="15" fill="#FFFFFF"/>
              <rect x="18" y="73" width="9" height="9" fill="#1B1B1F"/>

              <circle cx="50" cy="50" r="10" fill="#D90429"/>
              <rect x="42" y="15" width="8" height="20" fill="#1B1B1F"/>
              <rect x="42" y="65" width="16" height="16" fill="#1B1B1F"/>
              <rect x="65" y="45" width="20" height="8" fill="#1B1B1F"/>
            </svg>

            <div style="color:#1B1B1F; font-size:11px;">
              <div style="font-weight:800; color:#D90429;">Scan to Verify Eligibility</div>
              <div style="color:#555; line-height:1.4; margin-top:2px;">Hospital staff scan this pass to authenticate donor identity and blood compatibility.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
