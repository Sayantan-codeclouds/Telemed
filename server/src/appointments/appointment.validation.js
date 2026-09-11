import { z } from "zod";

export const createAppointmentSchema = z.object({

  doctorId: z
    .string()
    .min(1, "Doctor is required."),

  appointmentDate: z
    .string()
    .min(1, "Appointment date is required."),

  slot: z.object({

    start: z
      .string()
      .min(1, "Start time is required."),

    end: z
      .string()
      .min(1, "End time is required."),

  }),

  reason: z
    .string()
    .trim()
    .min(5, "Please enter the reason for consultation.")
    .max(500),

  paymentDetails: z
    .object({
      cardNumber: z.string().optional(),
      cardCvv: z.string().optional(),
      cardExpMonth: z.union([z.number(), z.string()]).optional(),
      cardExpYear: z.union([z.number(), z.string()]).optional(),
      cardTypeId: z.number().optional(),
      cardType: z.string().optional(),
    })
    .optional(),

  billingDetails: z
    .object({
      fname: z.string().optional(),
      lname: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipcode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),

  couponCode: z.string().nullable().optional(),
  discountAmount: z.number().optional(),

});

export const updateAppointmentStatusSchema =
  z.object({

    status: z.enum([
      "PENDING",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
      "NO_SHOW",
    ]),

  });

export const updateDoctorNotesSchema =
  z.object({

    doctorNotes: z
      .string()
      .max(10000)
      .optional(),

  });

export const updatePrescriptionSchema =
  z.object({

    prescription: z
      .string()
      .max(10000)
      .optional(),

  });

export const updateAISummarySchema =
  z.object({

    aiSummary: z
      .string()
      .max(20000)
      .optional(),

  });