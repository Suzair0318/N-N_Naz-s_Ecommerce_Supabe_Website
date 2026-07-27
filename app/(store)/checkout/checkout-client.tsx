"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, CreditCard, Loader2, MapPin, Truck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatWeightKg,
  getBillableKg,
  getShippingFee,
  PAKISTAN_CITIES,
  SHIPPING_KARACHI,
  SHIPPING_OTHER,
} from "@/constants/shop";
import { placeOrder } from "@/lib/actions/orders";
import { cn, formatPrice } from "@/lib/utils";
import { checkoutSchema, type CheckoutFormValues } from "@/lib/validators/checkout";
import { useSyncCartPricing } from "@/hooks/use-sync-cart-pricing";
import { selectCartWeightGrams, selectSubtotal, useCart } from "@/store/cart";

export type CheckoutDefaults = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  cityOther?: string;
  postalCode?: string;
  country?: string;
};

export function CheckoutClient({
  defaults,
}: {
  defaults?: CheckoutDefaults;
}) {
  const router = useRouter();
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);
  useSyncCartPricing(mounted);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: defaults?.customerName ?? "",
      customerEmail: defaults?.customerEmail ?? "",
      customerPhone: defaults?.customerPhone ?? "",
      address: defaults?.address ?? "",
      country: defaults?.country ?? "Pakistan",
      city: defaults?.city ?? "Karachi",
      cityOther: defaults?.cityOther ?? "",
      postalCode: defaults?.postalCode ?? "",
      paymentMethod: "COD",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const city = watch("city");
  const cityOther = watch("cityOther");

  const resolvedCity = useMemo(() => {
    if (city === "Other") return (cityOther ?? "").trim();
    return city?.trim() ?? "";
  }, [city, cityOther]);

  const subtotal = mounted ? selectSubtotal(items) : 0;
  const weightGrams = mounted ? selectCartWeightGrams(items) : 0;
  const billableKg = getBillableKg(weightGrams);
  const shipping = getShippingFee(resolvedCity || "Karachi", weightGrams);
  const total = subtotal + shipping;
  const isKarachi = resolvedCity.toLowerCase() === "karachi";
  const baseShipping = isKarachi ? SHIPPING_KARACHI : SHIPPING_OTHER;

  const goToPayment = async () => {
    const fields: (keyof CheckoutFormValues)[] = [
      "customerName",
      "customerEmail",
      "customerPhone",
      "address",
      "city",
      "postalCode",
      "country",
    ];
    if (city === "Other") fields.push("cityOther");
    const valid = await trigger(fields);
    if (valid) setStep(2);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (values.paymentMethod === "Card") {
      toast.error("Card payments are coming soon. Please choose Cash on Delivery.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }

    setSubmitting(true);
    const result = await placeOrder({
      ...values,
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong", {
        duration: 6000,
      });
      return;
    }

    toast.success("Order placed successfully!", {
      description: "Opening your order details…",
    });
    clear();
    router.push(`/order-success/${result.orderId}`);
  };

  if (mounted && items.length === 0) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <p className="text-muted-foreground">
          Add some pieces before proceeding to checkout.
        </p>
        <Button asChild>
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-full overflow-x-hidden py-12">
      <h1 className="mb-8 font-serif text-4xl tracking-tight">Checkout</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-8">
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
            <span className={cn(step === 1 ? "text-charcoal" : "text-muted-foreground")}>
              1. Shipping
            </span>
            <span className="h-px w-8 bg-border" />
            <span className={cn(step === 2 ? "text-charcoal" : "text-muted-foreground")}>
              2. Payment
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl">Contact &amp; Shipping</h2>

              <div className="flex items-start gap-3 border border-border bg-offwhite p-4 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <div>
                  <p className="font-medium">Delivery location &amp; shipping</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    First 1 kg — Karachi: {formatPrice(SHIPPING_KARACHI)} · Other
                    cities: {formatPrice(SHIPPING_OTHER)}. Each extra kg adds half
                    of that city&apos;s base rate.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.customerName?.message}>
                  <Input {...register("customerName")} placeholder="Your full name" />
                </Field>
                <Field label="Email" error={errors.customerEmail?.message}>
                  <Input
                    {...register("customerEmail")}
                    type="email"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone" error={errors.customerPhone?.message}>
                  <Input {...register("customerPhone")} placeholder="03XX XXXXXXX" />
                </Field>
                <Field label="Country" error={errors.country?.message}>
                  <Input {...register("country")} readOnly className="bg-muted/40" />
                </Field>

                <Field label="City / Location" error={errors.city?.message}>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== "Other") setValue("cityOther", "");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your city" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAKISTAN_CITIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                              {c === "Karachi" ? ` · ${formatPrice(SHIPPING_KARACHI)}` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                {city === "Other" ? (
                  <Field label="Enter your city" error={errors.cityOther?.message}>
                    <Input
                      {...register("cityOther")}
                      placeholder="e.g. Abbottabad"
                    />
                  </Field>
                ) : (
                  <Field label="Postal code" error={errors.postalCode?.message}>
                    <Input {...register("postalCode")} placeholder="75500" />
                  </Field>
                )}

                <div className="sm:col-span-2">
                  <Field label="Street address" error={errors.address?.message}>
                    <Input
                      {...register("address")}
                      placeholder="House / street / area"
                    />
                  </Field>
                </div>

                {city === "Other" && (
                  <Field label="Postal code" error={errors.postalCode?.message}>
                    <Input {...register("postalCode")} placeholder="75500" />
                  </Field>
                )}
              </div>

              <div className="rounded-none border border-gold/30 bg-gold/5 px-4 py-3 text-sm">
                <p>
                  Shipping to{" "}
                  <span className="font-medium">
                    {resolvedCity || "your city"}
                  </span>
                  :{" "}
                  <span className="font-medium text-gold-dark">
                    {formatPrice(shipping)}
                  </span>
                  {!isKarachi && resolvedCity && (
                    <span className="text-muted-foreground">
                      {" "}
                      (outside Karachi)
                    </span>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Parcel weight {formatWeightKg(weightGrams)} → billed as{" "}
                  {billableKg} kg
                  {billableKg > 1
                    ? ` (${formatPrice(baseShipping)} + ${billableKg - 1} × ${formatPrice(baseShipping / 2)})`
                    : ` (${formatPrice(baseShipping)} base)`}
                </p>
              </div>

              <Button type="button" size="lg" onClick={goToPayment}>
                Continue to payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-charcoal"
              >
                <ChevronLeft className="h-3 w-3" /> Back to shipping
              </button>
              <h2 className="font-serif text-xl">Payment Method</h2>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setValue("paymentMethod", "COD")}
                  className={cn(
                    "flex w-full items-center gap-3 border p-4 text-left transition-colors",
                    paymentMethod === "COD"
                      ? "border-charcoal bg-secondary"
                      : "border-border hover:border-charcoal"
                  )}
                >
                  <Truck className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay in cash when your order arrives.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("paymentMethod", "Card")}
                  className={cn(
                    "flex w-full items-center gap-3 border p-4 text-left transition-colors",
                    paymentMethod === "Card"
                      ? "border-charcoal bg-secondary"
                      : "border-border hover:border-charcoal"
                  )}
                >
                  <CreditCard className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Card / Online Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Secure online payment.
                    </p>
                  </div>
                </button>

                {paymentMethod === "Card" && (
                  <div className="border border-gold/40 bg-gold/5 p-4 text-xs text-gold-dark">
                    Online card payments are coming soon. For now, please select
                    Cash on Delivery to complete your order.
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitting || paymentMethod === "Card"}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting
                  ? "Placing order..."
                  : `Place order · ${formatPrice(total)}`}
              </Button>
            </div>
          )}
        </form>

        <aside className="h-fit min-w-0 border border-border bg-offwhite p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 font-serif text-lg">Order Summary</h2>
          <div className="max-h-72 space-y-4 overflow-y-auto">
            {mounted &&
              items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-muted">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal text-[10px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Size {item.size}
                      {item.weightGrams > 0
                        ? ` · ${formatWeightKg(item.weightGrams * item.quantity)}`
                        : ""}
                    </p>
                  </div>
                  <span className="shrink-0 self-center text-sm">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total weight</span>
              <span className="text-right">
                {formatWeightKg(weightGrams)}
                <span className="block text-[11px] text-muted-foreground">
                  billed as {billableKg} kg
                </span>
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                Shipping
                {resolvedCity ? (
                  <span className="block text-[11px]">to {resolvedCity}</span>
                ) : null}
              </span>
              <span className="text-right">{formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-serif text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
