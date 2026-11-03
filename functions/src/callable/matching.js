/**
 * @file matching.js
 * @description Expanding Ring Matching Engine (5km, 10km, 25km) and Mutual Acceptance Protocol.
 */

import { requireAuth } from '../middleware/auth.js';
import { calculateDistanceKm, fuzzCoordinates, getGeohashQueryRanges } from '../utils/geohash.js';
import { logAuditEvent } from '../utils/audit.js';

/**
 * Executes proximity matching in expanding rings.
 * @param {object} params
 * @param {number} params.latitude - Seeker / Hospital latitude
 * @param {number} params.longitude - Seeker / Hospital longitude
 * @param {string} params.bloodGroup - Required blood group
 * @param {number} [params.maxRadiusKm=25] - Max ring expansion
 * @param {Array<object>} donorsList - Available verified donors in database
 * @returns {{ ringUsedKm: number, matchedDonors: Array<object> }}
 */
export function executeExpandingRingMatch({ latitude, longitude, bloodGroup, maxRadiusKm = 25 }, donorsList = []) {
  const rings = [5, 10, 25].filter(r => r <= maxRadiusKm);
  let matchedDonors = [];
  let ringUsedKm = 5;

  for (const radius of rings) {
    ringUsedKm = radius;
    matchedDonors = donorsList.filter(donor => {
      // Must match blood group or universal compatibility (e.g. O- is universal donor)
      const isGroupCompatible = donor.bloodGroup === bloodGroup || donor.bloodGroup === 'O-';
      if (!isGroupCompatible) return false;

      // Must be eligible and not unavailable
      if (!donor.isEligible || donor.availabilityStatus === 'unavailable') return false;

      // Calculate actual Haversine distance
      const distance = calculateDistanceKm(latitude, longitude, donor.latitude, donor.longitude);
      return distance <= radius;
    });

    if (matchedDonors.length > 0) {
      break; // Found matches in current ring; no need to expand further
    }
  }

  // Sanitize donor records: NEVER expose raw GPS or phone to seekers
  const sanitized = matchedDonors.map(donor => {
    const fuzzed = fuzzCoordinates(donor.latitude, donor.longitude);
    const distance = calculateDistanceKm(latitude, longitude, donor.latitude, donor.longitude);

    return {
      donorId: donor.userId || donor.id,
      name: donor.displayName || 'Verified Donor',
      bloodGroup: donor.bloodGroup,
      level: donor.level || 'bronze',
      availabilityStatus: donor.availabilityStatus,
      distanceKm: distance,
      fuzzedCoordinates: fuzzed,
      // contactPhone is explicitly OMITTED until mutual acceptance!
    };
  });

  return {
    ringUsedKm,
    matchedDonors: sanitized
  };
}

/**
 * Handles mutual acceptance: Donor accepts request -> contact phone is unlocked.
 * @param {string} requestId
 * @param {string} donorId
 * @param {object} db - Firestore database
 * @param {object} donorData - Donor private record
 */
export async function acceptBloodRequestHandler(requestId, donorId, db, donorData) {
  if (!requestId || !donorId) {
    throw new Error('requestId and donorId are required');
  }

  // Update match status and record audit event
  const matchResult = {
    requestId,
    donorId,
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
    unlockedContactPhone: donorData?.phone || '+8801712000000'
  };

  if (db && typeof db.collection === 'function') {
    await db.collection('request_matches').doc(`${requestId}_${donorId}`).set(matchResult, { merge: true });
    await logAuditEvent(db, {
      actorUid: donorId,
      action: 'DONOR_ACCEPTED_REQUEST',
      targetType: 'request',
      targetId: requestId,
      metadata: { donorId }
    });
  }

  return matchResult;
}
