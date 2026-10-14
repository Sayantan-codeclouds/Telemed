import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
  // Authenticator-app code, only needed when two-factor login is enabled.
  totpCode: z.string().trim().optional(),
});
