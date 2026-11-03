/**
 * @file geohash.js
 * @description Geohash encoding, bounding boxes, Haversine distance, and coordinate fuzzing.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encodes latitude and longitude into a geohash string.
 * @param {number} latitude - Latitude in degrees (-90 to 90)
 * @param {number} longitude - Longitude in degrees (-180 to 180)
 * @param {number} [precision=6] - Desired character length (default 6: ~1.2km x 0.6km)
 * @returns {string} Geohash string
 */
export function encodeGeohash(latitude, longitude, precision = 6) {
  let latInterval = [-90.0, 90.0];
  let lonInterval = [-180.0, 180.0];
  let isEven = true;
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (lonInterval[0] + lonInterval[1]) / 2;
      if (longitude > mid) {
        ch |= 1 << (4 - bit);
        lonInterval[0] = mid;
      } else {
        lonInterval[1] = mid;
      }
    } else {
      const mid = (latInterval[0] + latInterval[1]) / 2;
      if (latitude > mid) {
        ch |= 1 << (4 - bit);
        latInterval[0] = mid;
      } else {
        latInterval[1] = mid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

/**
 * Calculates Haversine distance in kilometers between two GPS points.
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Round to 2 decimal places
}

/**
 * Fuzzes coordinates to a coarse ~500m grid to protect donor privacy.
 * Seeker queries and map displays receive this fuzzed point.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{ latitude: number, longitude: number }}
 */
export function fuzzCoordinates(latitude, longitude) {
  // 0.005 degrees latitude is approx ~555 meters
  // 0.005 degrees longitude at Bangladesh latitude (~24 deg N) is approx ~500 meters
  const gridStep = 0.005;
  const fuzzedLat = Math.round(latitude / gridStep) * gridStep;
  const fuzzedLon = Math.round(longitude / gridStep) * gridStep;

  return {
    latitude: Math.round(fuzzedLat * 10000) / 10000,
    longitude: Math.round(fuzzedLon * 10000) / 10000,
  };
}

/**
 * Generates geohash query ranges for proximity search given center and radius.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radiusKm
 * @returns {string[]} Array of geohash prefixes to query
 */
export function getGeohashQueryRanges(latitude, longitude, radiusKm) {
  // For matching rings, determine precision:
  // <= 2km: precision 6
  // <= 15km: precision 5
  // > 15km: precision 4
  let precision = 5;
  if (radiusKm <= 2) precision = 6;
  if (radiusKm > 15) precision = 4;

  const centerGeohash = encodeGeohash(latitude, longitude, precision);
  return [centerGeohash];
}
