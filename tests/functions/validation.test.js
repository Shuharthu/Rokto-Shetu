/**
 * @file validation.test.js
 * @description Payload schema validation unit tests using Zod.
 */

import { validatePayload, OnboardingProfileSchema, CreateBloodRequestSchema, AssignRoleSchema } from '../../functions/src/middleware/validation.js';

export function runValidationTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // 1. OnboardingProfileSchema
  assert('OnboardingProfileSchema validates clean Bangladesh profile', () => {
    const validData = {
      displayName: 'Shuharthu Barua',
      phone: '+8801712345678',
      bloodGroup: 'B+',
      dob: '1996-05-15T00:00:00.000Z',
      gender: 'male',
      weightKg: 65,
      division: 'Chattogram',
      district: 'Chattogram',
      upazila: 'Panchlaish',
      address: 'Nasirabad Housing Society',
      idType: 'nid',
      idNumber: '19961234567890',
      emergencyContact: {
        name: 'Tapash Barua',
        phone: '+8801812345678',
        relation: 'Brother'
      },
      healthDeclaration: {
        hasChronicIllness: false,
        isTakingMedications: false,
        hadSurgeryInPast6Months: false
      },
      consents: {
        termsAccepted: true,
        privacyAccepted: true,
        locationSharingAccepted: true
      }
    };

    const validated = validatePayload(OnboardingProfileSchema, validData);
    if (validated.displayName !== 'Shuharthu Barua') {
      throw new Error('Name parsing failed');
    }
  });

  assert('OnboardingProfileSchema rejects invalid blood group or phone', () => {
    const invalidData = {
      displayName: 'Test User',
      phone: '12345', // invalid phone
      bloodGroup: 'X+', // invalid blood group
      dob: '1996-05-15T00:00:00.000Z',
      gender: 'male',
      weightKg: 65,
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      address: 'Road 27',
      idType: 'nid',
      idNumber: '123456789',
      emergencyContact: { name: 'Contact', phone: '01700000000', relation: 'Friend' },
      healthDeclaration: { hasChronicIllness: false, isTakingMedications: false, hadSurgeryInPast6Months: false },
      consents: { termsAccepted: true, privacyAccepted: true, locationSharingAccepted: true }
    };

    let threw = false;
    try {
      validatePayload(OnboardingProfileSchema, invalidData);
    } catch (err) {
      threw = err.code === 'invalid-argument';
    }

    if (!threw) {
      throw new Error('Expected validation error for invalid phone and blood group');
    }
  });

  // 2. CreateBloodRequestSchema
  assert('CreateBloodRequestSchema validates legitimate blood request', () => {
    const validRequest = {
      patientName: 'Rahim Uddin',
      patientAge: 45,
      bloodGroup: 'O+',
      unitsNeeded: 2,
      component: 'whole_blood',
      hospitalName: 'Dhaka Medical College Hospital',
      hospitalAddress: 'Secretariat Rd, Dhaka 1000',
      latitude: 23.7258,
      longitude: 90.3976,
      requiredBy: '2026-11-04T18:00:00.000Z',
      urgency: 'urgent',
      reason: 'Emergency cardiovascular surgery',
      contactPhone: '+8801811223344'
    };

    const validated = validatePayload(CreateBloodRequestSchema, validRequest);
    if (validated.unitsNeeded !== 2) throw new Error('Units count mismatch');
  });

  // 3. AssignRoleSchema
  assert('AssignRoleSchema validates valid platform role assignment', () => {
    const validRole = {
      targetUid: 'user_target_987654321',
      role: 'fundraiser_reviewer',
      enabled: true
    };
    const validated = validatePayload(AssignRoleSchema, validRole);
    if (!validated.enabled) throw new Error('Role flag mismatch');
  });

  return results;
}
