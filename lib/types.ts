import type { Database } from "./supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage =
  Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface ProductWithRelations extends Product {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductCardData extends Product {
  images: Pick<ProductImage, "image_url" | "display_order">[];
  variants: Pick<
    ProductVariant,
    "id" | "size" | "stock_quantity" | "price_override"
  >[];
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: Pick<Product, "title" | "slug"> | null;
    variant: Pick<ProductVariant, "size"> | null;
  })[];
}

export interface ShopFilters {
  category?: string;
  search?: string;
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
}
