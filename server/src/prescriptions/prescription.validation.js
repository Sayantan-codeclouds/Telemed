import { z } from "zod";

const medicineItemSchema = z.object({
  name: z.string().trim().min(1, "Medicine name is required."),
  dosage: z.string().trim().min(1, "Dosage is required (e.g. 500mg)."),
  frequency: z.string().trim().min(1, "Frequency is required (e.g. 1-0-1)."),
  duration: z.string().trim().min(1, "Duration is required (e.g. 5 days)."),
  instructions: z.string().trim().optional().default(""),
});

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required."),
  diagnosis: z.string().trim().min(2, "Diagnosis is required."),
  medicines: z.array(medicineItemSchema).min(1, "At least one medicine is required."),
  notes: z.string().trim().optional().default(""),
  followUpDate: z.string().optional().nullable(),
  validityDays: z.number().or(z.string().regex(/^\d+$/).transform(Number)).optional().nullable(),
  validUntil: z.string().optional().nullable(),
  remindRecheckup: z.boolean().optional().default(true),
  recheckupDate: z.string().optional().nullable(),
});
