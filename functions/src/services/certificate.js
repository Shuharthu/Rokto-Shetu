/**
 * @file certificate.js
 * @description Digital Certificate generator and cryptographic verification hash for donors.
 */

import crypto from 'crypto';

/**
 * Generates official vector certificate data and signature hash.
 * @param {object} params
 * @param {string} params.donorName
 * @param {string} params.donorId
 * @param {string} params.bloodGroup
 * @param {string} params.level
 * @param {number} params.totalDonations
 * @param {string} [params.issueDate]
 * @returns {{ certificateId: string, verificationHash: string, issueDate: string, certificateSvg: string }}
 */
export function generateCertificateData({ donorName, donorId, bloodGroup, level, totalDonations, issueDate = new Date().toISOString() }) {
  const certificateId = `CERT-RS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  
  // Cryptographic verification hash
  const verificationHash = crypto.createHash('sha256')
    .update(`${certificateId}:${donorId}:${totalDonations}:${issueDate}:roktosetu_cert_secret`)
    .digest('hex');

  // Vector SVG template for instant rendering & PDF export
  const certificateSvg = `
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

      <text x="400" y="340" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="14" fill="#444">
        for selfless dedication in donating blood (${bloodGroup}) <tspan font-weight="700" fill="#D90429">${totalDonations} verified times</tspan>,
      </text>
      <text x="400" y="365" text-anchor="middle" font-family="'Poppins', sans-serif" font-size="14" fill="#444">
        achieving the distinguished rank of <tspan font-weight="700" fill="#D4AF37">${level.toUpperCase()} HERO</tspan>.
      </text>

      <!-- Verification Footer -->
      <line x1="120" y1="460" x2="300" y2="460" stroke="#999" stroke-width="1" />
      <text x="210" y="480" text-anchor="middle" font-size="12" fill="#777">Medical Advisory Board</text>

      <line x1="500" y1="460" x2="680" y2="460" stroke="#999" stroke-width="1" />
      <text x="590" y="480" text-anchor="middle" font-size="12" fill="#777">Platform Director, RoktoSetu</text>

      <text x="400" y="535" text-anchor="middle" font-size="11" fill="#888">
        Certificate ID: ${certificateId} • Issue Date: ${new Date(issueDate).toLocaleDateString()}
      </text>
      <text x="400" y="555" text-anchor="middle" font-size="9" fill="#AAA">
        Verification Hash: ${verificationHash.slice(0, 32)}... (Verify at roktosetu.org/verify)
      </text>
    </svg>
  `;

  return {
    certificateId,
    verificationHash,
    issueDate,
    certificateSvg
  };
}
