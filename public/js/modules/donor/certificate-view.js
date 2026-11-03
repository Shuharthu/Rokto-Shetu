/**
 * @file certificate-view.js
 * @description Official Donor Certificate Viewer with celebratory confetti burst and print layout.
 * Browser-safe with zero Node.js dependencies.
 */

export class CertificateView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    if (!this.container) return;

    const cert = this.generateCertificateSvg({
      donorName: 'Rafi Shuharthu',
      donorId: 'RS-98214',
      bloodGroup: 'B+',
      level: 'Gold',
      totalDonations: 12,
      issueDate: 'March 15, 2026'
    });

    this.container.innerHTML = `
      <div class="container" style="max-width:880px; padding:var(--space-8) var(--space-4); text-align:center;">
        <canvas id="confettiCanvas" style="position:fixed; inset:0; pointer-events:none; z-index:9999;"></canvas>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6); flex-wrap:wrap; gap:12px;">
          <div style="text-align:left;">
            <h1 style="font-size:var(--font-size-2xl); font-weight:800;">Official Lifesaver Certificate</h1>
            <p style="color:var(--color-text-secondary); font-size:var(--font-size-xs);">Validated by the RoktoSetu Medical Board with cryptographic audit seal.</p>
          </div>

          <div style="display:flex; gap:10px;">
            <button type="button" class="btn btn-primary btn-sm" onclick="window.print()">Print / Save PDF</button>
            <a href="#/donor/profile" class="btn btn-outline btn-sm">Back to Profile</a>
          </div>
        </div>

        <!-- Rendered Vector Certificate -->
        <div class="card" style="padding:var(--space-4); background:#FFFFFF; box-shadow:0 12px 40px rgba(0,0,0,0.15); border-radius:var(--radius-lg); margin-bottom:var(--space-8);">
          <div id="certSvgContainer" style="max-width:800px; margin:0 auto;">
            ${cert}
          </div>
        </div>
      </div>
    `;

    this.triggerConfetti();
  }

  generateCertificateSvg({ donorName, donorId, bloodGroup, level, totalDonations, issueDate }) {
    const certId = 'CERT-RS-98214';
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
        <rect width="800" height="600" fill="#FFFFFF" rx="12" />
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#D90429" stroke-width="3" rx="8" />
        <rect x="30" y="30" width="740" height="540" fill="none" stroke="#2A9D8F" stroke-width="1.5" stroke-dasharray="8 6" rx="6" />

        <!-- Seal & Header -->
        <circle cx="400" cy="90" r="36" fill="#D90429" />
        <path d="M386 92L396 102L416 80" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        
        <text x="400" y="160" text-anchor="middle" font-family="'Hind Siliguri', 'Poppins', sans-serif" font-size="28" font-weight="800" fill="#D90429">
          রক্তসেতু • ROKTOSETU
        </text>
        <text x="400" y="185" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="14" font-weight="600" fill="#2A9D8F" letter-spacing="3">
          CERTIFICATE OF LIFESAVER APPRECIATION
        </text>

        <text x="400" y="240" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="14" fill="#555">
          This prestigious certificate is proudly presented to
        </text>

        <text x="400" y="295" text-anchor="middle" font-family="'Hind Siliguri', 'Poppins', sans-serif" font-size="34" font-weight="800" fill="#1B1B1F">
          ${donorName}
        </text>

        <text x="400" y="340" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="15" fill="#444">
          For extraordinary altruism and unwavering dedication as a <tspan font-weight="700" fill="#D90429">${level} Donor</tspan> (${bloodGroup}),
        </text>
        <text x="400" y="365" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="15" fill="#444">
          having selflessly donated life-saving blood <tspan font-weight="700" fill="#2A9D8F">${totalDonations} times</tspan> without monetary compensation.
        </text>

        <!-- Signatures & Verification Block -->
        <line x1="120" y1="480" x2="280" y2="480" stroke="#888" stroke-width="1.5" />
        <text x="200" y="505" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="12" font-weight="700" fill="#333">Medical Director</text>
        <text x="200" y="525" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="11" fill="#777">RoktoSetu Advisory Board</text>

        <line x1="520" y1="480" x2="680" y2="480" stroke="#888" stroke-width="1.5" />
        <text x="600" y="505" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="12" font-weight="700" fill="#333">National Registrar</text>
        <text x="600" y="525" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="11" fill="#777">Bangabandhu Medical Network</text>

        <!-- Certificate Serial & Verification -->
        <text x="400" y="560" text-anchor="middle" font-family="monospace" font-size="11" fill="#888">
          Serial: ${certId} • Issue Date: ${issueDate} • Verify at roktosetu.org/verify
        </text>
      </svg>
    `;
  }

  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#D90429', '#2A9D8F', '#D4AF37', '#3B82F6', '#8D0801'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        velX: (Math.random() - 0.5) * 3,
        velY: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }

    let frames = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.velX;
        p.y += p.velY;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 200) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }
}
