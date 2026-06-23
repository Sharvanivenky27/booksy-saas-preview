import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum([
    "DENTAL",
    "SALON",
    "PHYSIOTHERAPY",
    "AUTOMOTIVE",
    "OTHER",
  ]),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  category: z.string().optional(),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  currency: z.string().default("CAD"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  serviceId: z.string().min(1, "Service is required"),
  staffId: z.string().optional(),
  locationId: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  notes: z.string().optional(),
});

export const staffSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8).optional(),
  bio: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  locationId: z.string().optional(),
});

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  timezone: z.string().default("America/Toronto"),
});

export const workingHourSchema = z.object({
  day: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type WorkingHourInput = z.infer<typeof workingHourSchema>;
