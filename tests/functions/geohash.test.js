/**
 * @file geohash.test.js
 * @description Geohash and Haversine distance unit tests.
 */

import { encodeGeohash, calculateDistanceKm, fuzzCoordinates, getGeohashQueryRanges } from '../../functions/src/utils/geohash.js';

export function runGeohashTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // 1. Geohash encoding
  assert('encodeGeohash encodes Dhaka coordinates correctly', () => {
    // Dhaka center: 23.8103, 90.4125
    const hash = encodeGeohash(23.8103, 90.4125, 6);
    if (!hash || hash.length !== 6 || !hash.startsWith('wh0')) {
      throw new Error(`Unexpected geohash: ${hash}`);
    }
  });

  // 2. Haversine distance
  assert('calculateDistanceKm calculates distance between Dhaka and Chattogram accurately', () => {
    const dhakaLat = 23.8103;
    const dhakaLon = 90.4125;
    const ctgLat = 22.3569;
    const ctgLon = 91.7832;

    const dist = calculateDistanceKm(dhakaLat, dhakaLon, ctgLat, ctgLon);
    // Real distance is ~210-220 km
    if (dist < 200 || dist > 230) {
      throw new Error(`Expected distance ~215km, got ${dist}km`);
    }
  });

  assert('calculateDistanceKm returns 0 for identical points', () => {
    const dist = calculateDistanceKm(23.8103, 90.4125, 23.8103, 90.4125);
    if (dist !== 0) throw new Error(`Expected 0km, got ${dist}km`);
  });

  // 3. Coordinate fuzzing
  assert('fuzzCoordinates rounds to ~500m grid for donor privacy', () => {
    const originalLat = 23.810342;
    const originalLon = 90.412589;
    const fuzzed = fuzzCoordinates(originalLat, originalLon);

    if (fuzzed.latitude === originalLat || fuzzed.longitude === originalLon) {
      throw new Error('Coordinates were not fuzzed');
    }

    const dist = calculateDistanceKm(originalLat, originalLon, fuzzed.latitude, fuzzed.longitude);
    // Fuzzed offset should be less than 600 meters (0.6 km)
    if (dist > 0.6) {
      throw new Error(`Fuzzing offset too large: ${dist}km`);
    }
  });

  // 4. Query ranges
  assert('getGeohashQueryRanges returns precision 6 for short radius', () => {
    const ranges = getGeohashQueryRanges(23.8103, 90.4125, 2);
    if (!ranges || ranges.length === 0 || ranges[0].length !== 6) {
      throw new Error('Expected precision 6 geohash range');
    }
  });

  return results;
}
