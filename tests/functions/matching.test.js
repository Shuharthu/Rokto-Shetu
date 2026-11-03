/**
 * @file matching.test.js
 * @description Unit tests for Expanding Ring Matching Engine & Privacy Sanitization.
 */

import { executeExpandingRingMatch, acceptBloodRequestHandler } from '../../functions/src/callable/matching.js';

export async function runMatchingTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  async function assertAsync(name, fn) {
    try {
      await fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // Hospital at CMCH: 22.3592, 91.8285
  const hospitalLat = 22.3592;
  const hospitalLon = 91.8285;

  const sampleDonors = [
    {
      userId: 'donor_close',
      displayName: 'Donor Close',
      bloodGroup: 'B+',
      isEligible: true,
      availabilityStatus: 'available_now',
      latitude: 22.3700, // ~1.5 km away
      longitude: 91.8300,
      phone: '+8801711111111'
    },
    {
      userId: 'donor_mid',
      displayName: 'Donor Mid',
      bloodGroup: 'B+',
      isEligible: true,
      availabilityStatus: 'available_now',
      latitude: 22.4200, // ~8 km away
      longitude: 91.8400,
      phone: '+8801722222222'
    },
    {
      userId: 'donor_far',
      displayName: 'Donor Far',
      bloodGroup: 'B+',
      isEligible: true,
      availabilityStatus: 'available_now',
      latitude: 22.5200, // ~19 km away
      longitude: 91.8500,
      phone: '+8801733333333'
    },
    {
      userId: 'donor_incompatible',
      displayName: 'Donor Incompatible',
      bloodGroup: 'AB+',
      isEligible: true,
      availabilityStatus: 'available_now',
      latitude: 22.3600,
      longitude: 91.8290,
      phone: '+8801744444444'
    }
  ];

  // 1. Ring 1 Matching (5 km)
  assert('executeExpandingRingMatch finds donor in Ring 1 (<= 5 km)', () => {
    const res = executeExpandingRingMatch({
      latitude: hospitalLat,
      longitude: hospitalLon,
      bloodGroup: 'B+',
      maxRadiusKm: 25
    }, sampleDonors);

    if (res.ringUsedKm !== 5) {
      throw new Error(`Expected ring 5km, got ${res.ringUsedKm}km`);
    }

    if (res.matchedDonors.length !== 1 || res.matchedDonors[0].donorId !== 'donor_close') {
      throw new Error('Expected donor_close to be matched');
    }
  });

  // 2. Ring 2 Expansion (10 km) when close donor is absent
  assert('executeExpandingRingMatch expands to Ring 2 (<= 10 km) when no Ring 1 donors exist', () => {
    const donorsWithoutClose = sampleDonors.filter(d => d.userId !== 'donor_close');

    const res = executeExpandingRingMatch({
      latitude: hospitalLat,
      longitude: hospitalLon,
      bloodGroup: 'B+',
      maxRadiusKm: 25
    }, donorsWithoutClose);

    if (res.ringUsedKm !== 10) {
      throw new Error(`Expected ring 10km, got ${res.ringUsedKm}km`);
    }

    if (res.matchedDonors.length !== 1 || res.matchedDonors[0].donorId !== 'donor_mid') {
      throw new Error('Expected donor_mid to be matched in Ring 2');
    }
  });

  // 3. Ring 3 Expansion (25 km)
  assert('executeExpandingRingMatch expands to Ring 3 (<= 25 km) for far donors', () => {
    const donorsFarOnly = sampleDonors.filter(d => d.userId === 'donor_far');

    const res = executeExpandingRingMatch({
      latitude: hospitalLat,
      longitude: hospitalLon,
      bloodGroup: 'B+',
      maxRadiusKm: 25
    }, donorsFarOnly);

    if (res.ringUsedKm !== 25) {
      throw new Error(`Expected ring 25km, got ${res.ringUsedKm}km`);
    }

    if (res.matchedDonors.length !== 1 || res.matchedDonors[0].donorId !== 'donor_far') {
      throw new Error('Expected donor_far in Ring 3');
    }
  });

  // 4. Privacy Sanitization: Raw GPS & Phone MUST NOT be exposed
  assert('executeExpandingRingMatch strips exact phone and coordinates from seeker result', () => {
    const res = executeExpandingRingMatch({
      latitude: hospitalLat,
      longitude: hospitalLon,
      bloodGroup: 'B+'
    }, sampleDonors);

    const match = res.matchedDonors[0];

    if (match.contactPhone || match.phone) {
      throw new Error('CRITICAL SECURITY VIOLATION: Donor phone number leaked in seeker search!');
    }

    if (match.latitude || match.longitude) {
      throw new Error('CRITICAL PRIVACY VIOLATION: Raw donor coordinates exposed instead of fuzzed!');
    }

    if (!match.fuzzedCoordinates || typeof match.fuzzedCoordinates.latitude !== 'number') {
      throw new Error('Expected fuzzed coordinates in response');
    }
  });

  // 5. Mutual Acceptance Protocol
  await assertAsync('acceptBloodRequestHandler unlocks contact phone only upon explicit acceptance', async () => {
    const mockDb = {
      collection: () => ({
        doc: () => ({ set: async () => {} }),
        add: async () => ({ id: 'mock_audit_id' })
      })
    };

    const res = await acceptBloodRequestHandler('REQ_123', 'donor_close', mockDb, { phone: '+8801711111111' });

    if (res.status !== 'accepted' || res.unlockedContactPhone !== '+8801711111111') {
      throw new Error('Failed to unlock donor contact on acceptance');
    }
  });

  // 6. Anti-Commercialization Moderation Regex (Unicode aware)
  assert('Anti-commercialization regex blocks cash/payment demands in English and Bengali', () => {
    const regex = /(?:^|\s|[.,!?])(taka|money|tk|sell|buy|price|cash|bdt|টাকা|মূল্য|পয়সা|দাম|বিক্রি|কেনার)(?:$|\s|[.,!?])/i;

    if (!regex.test('Give me 5000 taka for donation')) throw new Error('Failed to block taka');
    if (!regex.test('রক্তের দাম কত টাকা?')) throw new Error('Failed to block Bengali taka');
    if (!regex.test('What is the price of whole blood?')) throw new Error('Failed to block price');
    if (regex.test('I am arriving at the hospital ward soon.')) throw new Error('False positive on clean text');
  });

  return results;
}
