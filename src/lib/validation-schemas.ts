/**
 * Centralized validation schemas for API requests
 * Uses Zod for runtime type validation and security
 */

import { z } from 'zod';

// SEO Settings Validation
export const SeoSettingsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name too long')
});

// Chat Message Validation
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long')
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1, 'At least one message required'),
  systemInstruction: z.string().max(1000, 'System instruction too long').optional()
});

// Devotional Response Validation
export const DevotionalSchema = z.object({
  title: z.string().min(1).max(200),
  scripture: z.string().min(1).max(100),
  scriptureText: z.string().min(1).max(5000),
  reflection: z.string().min(1).max(5000),
  prayer: z.string().min(1).max(5000)
});

// Export Report Validation
export const ExportReportSchema = z.object({
  type: z.enum(['beneficiaries', 'donors', 'donations', 'expenses', 'projects', 'volunteers']),
  format: z.enum(['csv', 'json', 'pdf'])
});

// Beneficiary Validation
export const BeneficiarySchema = z.object({
  name: z.string().min(2, 'Name too short').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  category: z.string().max(50).optional(),
  age: z.number().min(0).max(150).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

// Donor Validation
export const DonorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  donorType: z.enum(['individual', 'organization', 'corporate']).optional()
});

// Donation Validation
export const DonationSchema = z.object({
  donorId: z.string().min(1),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().length(3).optional(),
  notes: z.string().max(500).optional()
});

// Project Validation
export const ProjectSchema = z.object({
  name: z.string().min(2).max(100),
  title: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(['active', 'completed', 'on-hold']).optional()
});

// Volunteer Validation
export const VolunteerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  department: z.string().max(50).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.string().max(100).optional()
});

/**
 * Utility to validate request data and return errors in consistent format
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}
