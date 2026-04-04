import { z } from "zod";

export const playerCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  secondNationality: z.string().max(100).optional().nullable(),
  nationalId: z.string().max(100).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  region: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  guardianName: z.string().max(200).optional().nullable(),
  guardianPhone: z.string().max(50).optional().nullable(),
  guardianEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  guardianRelation: z.enum(["PARENT", "GUARDIAN", "OTHER"]).optional().nullable(),
  preferredFoot: z.enum(["LEFT", "RIGHT", "BOTH"]).optional().nullable(),
  primaryPosition: z.string().max(10).optional().nullable(),
  secondaryPosition: z.string().max(10).optional().nullable(),
  height: z.coerce.number().min(50).max(250).optional().nullable(),
  weight: z.coerce.number().min(20).max(200).optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "INJURED", "SUSPENDED", "TRANSFERRED", "RETIRED", "ARCHIVED", "DRAFT"]).default("ACTIVE"),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().max(5000).optional().nullable(),
});

export const playerUpdateSchema = playerCreateSchema.partial();

export type PlayerCreateInput = z.infer<typeof playerCreateSchema>;
export type PlayerUpdateInput = z.infer<typeof playerUpdateSchema>;
