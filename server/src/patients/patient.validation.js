import { z } from "zod";

export const registerPatientSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name is required"),

    lastName: z.string().trim().min(2, "Last name is required"),

    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number cannot exceed 15 digits"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });