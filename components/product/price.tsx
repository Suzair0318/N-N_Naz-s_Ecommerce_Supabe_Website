import { cn, formatPrice } from "@/lib/utils";

interface PriceProps {
  basePrice: number;
  discountPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

export function Price({
  basePrice,
  discountPrice,
  className,
  size = "md",
}: PriceProps) {
  const hasDiscount =
    typeof discountPrice === "number" && discountPrice < basePrice;

  return (
    <div className={cn("flex items-baseline gap-2", sizeMap[size], className)}>
      <span
        className={cn(
          "font-medium",
          hasDiscount ? "text-gold-dark" : "text-charcoal"
        )}
      >
        {formatPrice(hasDiscount ? discountPrice! : basePrice)}
      </span>
      {hasDiscount && (
        <span className="text-muted-foreground line-through">
          {formatPrice(basePrice)}
        </span>
      )}
    </div>
  );
}
