import { z } from "zod";

export const profileSchema = z.object({

    firstName: z.string().min(2),

    lastName: z.string().min(2),

    phone: z.string().min(10),

    gender: z.string(),

    bloodGroup: z.string(),

    height: z.coerce.number().positive(),

    weight: z.coerce.number().positive(),

    address: z.string().min(5),

});