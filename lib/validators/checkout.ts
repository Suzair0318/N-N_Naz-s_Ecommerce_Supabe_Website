import { z } from "zod";

const checkoutFields = {
  customerName: z.string().min(2, "Please enter your full name"),
  customerEmail: z.string().email("Enter a valid email address"),
  customerPhone: z
    .string()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long"),
  address: z.string().min(4, "Enter your street address"),
  /** Delivery city — drives base shipping (Karachi 350 / other 450). */
  city: z.string().min(2, "Please select your city"),
  /** Used when city = "Other" */
  cityOther: z.string().optional().nullable(),
  postalCode: z.string().min(3, "Enter your postal code"),
  country: z.string().min(2, "Enter your country"),
  paymentMethod: z.enum(["COD", "Card"]),
};

function refineCityOther(
  data: { city: string; cityOther?: string | null },
  ctx: z.RefinementCtx
) {
  if (
    data.city === "Other" &&
    (!data.cityOther || data.cityOther.trim().length < 2)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter your city name",
      path: ["cityOther"],
    });
  }
}

export const checkoutSchema = z
  .object(checkoutFields)
  .superRefine(refineCityOther);

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const orderItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const placeOrderSchema = z
  .object({
    ...checkoutFields,
    items: z.array(orderItemSchema).min(1, "Your bag is empty"),
  })
  .superRefine(refineCityOther);

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
