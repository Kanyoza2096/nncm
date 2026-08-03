import { z } from 'zod';

export const beneficiarySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().min(0, "Age cannot be negative").max(120, "Please enter a valid age"),
  dob: z.string().optional(),
  phone: z.string().min(5, "Invalid phone number"),
  location: z.string().min(2, "Location is required"),
  maritalStatus: z.string(),
  childrenCount: z.number().min(0),
  occupation: z.string().optional(),
});

export const donationSchema = z.object({
  amount: z.number().min(1, "Minimum donation is $1").max(1000000, "Maximum single donation limit exceeded"),
  donorId: z.string(),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
  date: z.number(),
});

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.number().min(0),
  startDate: z.number(),
  endDate: z.number(),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(['super_admin', 'admin', 'staff', 'volunteer']),
});
