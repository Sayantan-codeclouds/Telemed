import { z } from "zod";

export const vrioOfferSchema = z.object({
  offer_id: z.coerce.number().int().positive("Offer ID must be a positive integer."),
  order_offer_quantity: z.coerce.number().int().positive("Quantity must be at least 1.").default(1),
  quantity: z.coerce.number().int().positive().optional(),
  item_id: z.coerce.number().int().positive("Item ID must be a positive integer."),
  medicineId: z.string().optional(),
  name: z.string().optional(),
  price: z.coerce.number().optional(),
}).transform((data) => ({
  ...data,
  order_offer_quantity: data.order_offer_quantity || data.quantity || 1,
}));

export const billingAddressSchema = z.object({
  fname: z.string().trim().optional(),
  lname: z.string().trim().optional(),
  address1: z.string().trim().min(1, "Billing address line 1 is required."),
  city: z.string().trim().min(1, "Billing city is required."),
  state: z.string().trim().min(1, "Billing state is required."),
  zipcode: z.string().trim().min(1, "Billing postal code is required."),
  country: z.string().trim().default("US"),
});

export const shippingAddressSchema = z.object({
  line1: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  country: z.string().trim().default("US"),
}).optional();

export const paymentDetailsSchema = z.object({
  card_number: z.string().trim().min(13, "Card number must be at least 13 digits.").max(19, "Card number too long.").optional(),
  cardNumber: z.string().trim().optional(),
  card_cvv: z.string().trim().min(3, "CVV must be 3 or 4 digits.").max(4).optional(),
  cardCvv: z.string().trim().optional(),
  card_exp_month: z.coerce.number().int().min(1).max(12).optional(),
  cardExpMonth: z.coerce.number().int().min(1).max(12).optional(),
  card_exp_year: z.coerce.number().int().min(24).max(99).optional(),
  cardExpYear: z.coerce.number().int().optional(),
  payment_method_id: z.coerce.number().int().positive().optional(),
  card_type_id: z.coerce.number().int().positive().optional(),
  cardType: z.string().optional(),
}).transform((data) => {
  const rawCard = (data.card_number || data.cardNumber || "").replace(/\D/g, "");
  const rawCvv = data.card_cvv || data.cardCvv || "";
  const expMonth = data.card_exp_month || data.cardExpMonth || 12;
  const rawYear = data.card_exp_year || data.cardExpYear || 28;
  const expYear = Number(String(rawYear).slice(-2));

  return {
    ...data,
    card_number: rawCard,
    cardNumber: rawCard,
    card_cvv: rawCvv,
    cardCvv: rawCvv,
    card_exp_month: expMonth,
    cardExpMonth: expMonth,
    card_exp_year: expYear,
    cardExpYear: expYear,
  };
});

export const createVrioOrderSchema = z.object({
  offers: z.array(vrioOfferSchema).min(1, "At least one offer is required."),
  billingAddress: billingAddressSchema,
  shippingAddress: shippingAddressSchema,
  payment: paymentDetailsSchema.optional(),
  paymentDetails: paymentDetailsSchema.optional(),
  appointmentId: z.string().optional(),
  prescriptionId: z.string().optional(),
  campaignId: z.coerce.number().int().positive().optional(),
  routeId: z.coerce.number().int().positive().optional(),
  connectionId: z.coerce.number().int().positive().optional(),
  shippingProfileId: z.coerce.number().int().positive().optional(),
  action: z.enum(["authorize", "process"]).optional(),
});

export const processVrioPaymentSchema = z.object({
  payment: paymentDetailsSchema.optional(),
  paymentDetails: paymentDetailsSchema.optional(),
  action: z.enum(["authorize", "process"]).default("process"),
}).refine(
  (data) => Boolean(data.payment?.card_number || data.paymentDetails?.card_number),
  { message: "Valid card details are required to process payment.", path: ["payment"] }
);

export const createFromPrescriptionSchema = z.object({
  prescriptionId: z.string().min(1, "Prescription ID is required."),
  billingAddress: billingAddressSchema,
  shippingAddress: shippingAddressSchema,
  payment: paymentDetailsSchema.optional(),
  paymentDetails: paymentDetailsSchema.optional(),
  action: z.enum(["authorize", "process"]).optional(),
});
