/**
 * @file validation.js
 * @description Zod schema definitions and validation helpers for RoktoSetu payloads.
 */

import { z } from 'zod';

export const BloodGroupSchema = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const UrgencySchema = z.enum(['normal', 'urgent', 'critical_sos']);
export const ComponentSchema = z.enum(['whole_blood', 'platelets', 'plasma']);
export const IdTypeSchema = z.enum(['nid', 'passport']);

// Onboarding & Registration Schema
export const OnboardingProfileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/, 'Valid Bangladesh mobile number required (+8801XXXXXXXXX)'),
  bloodGroup: BloodGroupSchema,
  dob: z.string().datetime(), // ISO 8601 string
  gender: z.enum(['male', 'female', 'other']),
  weightKg: z.number().min(45, 'Weight must be at least 45 kg').max(200),
  division: z.string().min(2),
  district: z.string().min(2),
  upazila: z.string().min(2),
  address: z.string().min(5),
  idType: IdTypeSchema,
  idNumber: z.string().min(8).max(25),
  emergencyContact: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    relation: z.string().min(2)
  }),
  healthDeclaration: z.object({
    hasChronicIllness: z.boolean(),
    isTakingMedications: z.boolean(),
    hadSurgeryInPast6Months: z.boolean(),
    details: z.string().max(500).optional()
  }),
  consents: z.object({
    termsAccepted: z.literal(true),
    privacyAccepted: z.literal(true),
    locationSharingAccepted: z.literal(true)
  })
});

import { evaluateCommercialContent } from '../services/antiCommercial.js';

// Blood Request Creation Schema
export const CreateBloodRequestSchema = z.object({
  patientName: z.string().min(2).max(100),
  patientAge: z.number().min(0).max(130),
  bloodGroup: BloodGroupSchema,
  unitsNeeded: z.number().int().min(1).max(10),
  component: ComponentSchema.default('whole_blood'),
  hospitalName: z.string().min(3).max(150),
  hospitalAddress: z.string().min(5).max(250),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  requiredBy: z.string().datetime(),
  urgency: UrgencySchema.default('normal'),
  reason: z.string().min(5).max(500),
  contactPhone: z.string().regex(/^(\+8801|01)[3-9]\d{8}$/)
}).refine(data => {
  const check = evaluateCommercialContent(data.reason, 'blood_request');
  return check.allowed;
}, {
  message: 'Reason contains prohibited commercial or payment terms for blood donation',
  path: ['reason']
});

// Role Assignment Schema (Admin only)
export const AssignRoleSchema = z.object({
  targetUid: z.string().min(10),
  role: z.enum([
    'super_admin',
    'admin',
    'moderator',
    'identity_verifier',
    'fundraiser_reviewer',
    'senior_reviewer',
    'finance_approver',
    'content_editor',
    'support_agent'
  ]),
  enabled: z.boolean()
});

/**
 * Validates request data against a Zod schema.
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Input payload
 * @returns {any} Validated and typed data
 * @throws {Error} With 'invalid-argument' code on validation failure
 */
export function validatePayload(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    const error = new Error(`INVALID_ARGUMENT: ${issues}`);
    error.code = 'invalid-argument';
    error.details = result.error.format();
    throw error;
  }
  return result.data;
}
