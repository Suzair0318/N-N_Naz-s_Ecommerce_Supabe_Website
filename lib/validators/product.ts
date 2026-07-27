import { z } from "zod";

export const variantSchema = z.object({
  size: z.enum(["XS", "S", "M", "L", "XL", "Custom"]),
  stock_quantity: z.coerce.number().int().min(0),
  /** Empty input must stay null — z.coerce.number("") becomes 0 and zeros out cart prices. */
  price_override: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const n = typeof val === "number" ? val : Number(val);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, z.number().min(0).nullable()),
});

export const productSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  brand_name: z.string().min(1, "Brand name is required").max(120),
  /** Weight in grams — empty input becomes null */
  weight: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const n = typeof val === "number" ? val : Number(val);
    return Number.isNaN(n) ? null : n;
  }, z.number().min(0, "Weight must be 0 or more").nullable()),
  category_id: z.string().uuid().optional().nullable(),
  base_price: z.coerce.number().min(0, "Price must be positive"),
  discount_price: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const n = typeof val === "number" ? val : Number(val);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }, z.number().min(0).nullable()),
  featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).min(1, "Add at least one variant"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
