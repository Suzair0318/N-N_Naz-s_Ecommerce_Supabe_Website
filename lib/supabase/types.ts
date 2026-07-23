/**
 * Hand-authored database types mirroring supabase/migrations.
 * Keep in sync with the SQL schema. Can be regenerated later via
 * `supabase gen types typescript`.
 */

export type Role = "customer" | "admin";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "Custom";
export type PaymentMethod = "COD" | "Card";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ShippingAddress {
  address: string;
  city: string;
  postal_code: string;
  country: string;
  /** Applied shipping fee in PKR (set server-side). */
  shipping_fee?: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: Role;
          phone: string | null;
          address: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["categories"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          brand_name: string | null;
          /** Weight in grams (g) */
          weight: number | null;
          category_id: string | null;
          base_price: number;
          discount_price: number | null;
          featured: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          display_order: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["product_images"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: ProductSize;
          stock_quantity: number;
          price_override: number | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["product_variants"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          shipping_address: ShippingAddress;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          order_status: OrderStatus;
          total_amount: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["order_items"]["Row"],
          "id"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string | null;
          p_shipping_address: ShippingAddress;
          p_payment_method: PaymentMethod;
          p_user_id: string | null;
          p_items: { variant_id: string; quantity: number }[];
        };
        Returns: { order_id: string; order_number: string }[];
      };
      get_order_confirmation: {
        Args: { p_order_id: string };
        Returns: Record<string, unknown> | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
