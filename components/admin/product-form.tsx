"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, UploadCloud, X } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SIZES } from "@/constants/shop";
import { createCategory } from "@/lib/actions/admin/categories";
import { createProduct, updateProduct } from "@/lib/actions/admin/products";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductFormValues } from "@/lib/validators/product";

const BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "product-images";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  productId?: string;
  defaultValues?: Partial<ProductFormValues>;
}

export function ProductForm({
  categories: initialCategories,
  productId,
  defaultValues,
}: ProductFormProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] =
    useState<CategoryOption[]>(initialCategories);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      brand_name: "",
      weight: null,
      category_id: null,
      base_price: 0,
      discount_price: null,
      featured: false,
      is_active: true,
      images: [],
      variants: [{ size: "M", stock_quantity: 0 }],
      ...defaultValues,
    },
  });

  const {
    fields: variantFields,
    append,
    remove,
  } = useFieldArray({ control, name: "variants" });

  const images = watch("images");
  const title = watch("title");

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Enter a category name");
      return;
    }

    setCreatingCategory(true);
    try {
      const result = await createCategory(name);
      if (!result.success || !result.category) {
        toast.error(result.error ?? "Could not create category");
        return;
      }

      setCategories((prev) => {
        if (prev.some((c) => c.id === result.category!.id)) return prev;
        return [...prev, result.category!].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
      setValue("category_id", result.category.id, { shouldValidate: true });
      setNewCategoryName("");
      setAddingCategory(false);
      toast.success(`Category “${result.category.name}” ready`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create category"
      );
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(publicUrl);
      }
      setValue("images", [...images, ...uploaded], { shouldValidate: true });
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setValue(
      "images",
      images.filter((i) => i !== url),
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: ProductFormValues) => {
    const action = productId
      ? updateProduct(productId, values)
      : createProduct(values);
    const result = await action;

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }
    toast.success(productId ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {/* Basic info */}
      <section className="border border-border bg-white p-6">
        <h2 className="mb-6 font-serif text-xl">Product Details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              {...register("title")}
              onBlur={(e) => {
                if (!watch("slug")) setValue("slug", slugify(e.target.value));
              }}
              placeholder="Silk Slip Midi Dress"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <div className="flex gap-2">
              <Input {...register("slug")} placeholder="silk-slip-midi-dress" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setValue("slug", slugify(title))}
              >
                Auto
              </Button>
            </div>
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea {...register("description")} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label>Brand name</Label>
            <Input
              {...register("brand_name")}
              placeholder="e.g. Zara, H&M, Local Brand"
            />
            {errors.brand_name && (
              <p className="text-xs text-destructive">
                {errors.brand_name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Weight (grams)</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("weight")}
              placeholder="e.g. 350"
            />
            <p className="text-[11px] text-muted-foreground">
              Used for shipping records. Leave empty if unknown.
            </p>
            {errors.weight && (
              <p className="text-xs text-destructive">{errors.weight.message}</p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Category</Label>
              {!addingCategory && (
                <button
                  type="button"
                  onClick={() => setAddingCategory(true)}
                  className="text-xs uppercase tracking-wide text-muted-foreground hover:text-charcoal"
                >
                  + New category
                </button>
              )}
            </div>

            {addingCategory ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Loungewear"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleCreateCategory();
                    }
                    if (e.key === "Escape") {
                      setAddingCategory(false);
                      setNewCategoryName("");
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={creatingCategory}
                  >
                    {creatingCategory && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddingCategory(false);
                      setNewCategoryName("");
                    }}
                    disabled={creatingCategory}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Controller
                control={control}
                name="category_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            <p className="text-[11px] text-muted-foreground">
              Pick an existing category, or add a new one for future products.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <div className="space-y-1.5">
              <Label>Base price (PKR)</Label>
              <Input type="number" step="0.01" {...register("base_price")} />
              {errors.base_price && (
                <p className="text-xs text-destructive">
                  {errors.base_price.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Discount price (PKR)</Label>
              <Input
                type="number"
                step="0.01"
                {...register("discount_price")}
                placeholder="Optional — enables Sale badge"
              />
              <p className="text-[11px] text-muted-foreground">
                Agar yeh price set karo (base se kam), shop cards par automatic{" "}
                <span className="font-medium text-gold-dark">Sale</span> badge
                dikhega. Empty chhoro = no sale badge.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Visibility &amp; placement
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
            <Controller
              control={control}
              name="is_active"
              render={({ field }) => (
                <label className="flex max-w-sm cursor-pointer items-start gap-2.5 text-sm">
                  <Checkbox
                    className="mt-0.5"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span>
                    <span className="font-medium">Visible in store</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      On = shop / product page par dikhega. Off = hidden (admin
                      list mein rahega).
                    </span>
                  </span>
                </label>
              )}
            />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <label className="flex max-w-sm cursor-pointer items-start gap-2.5 text-sm">
                  <Checkbox
                    className="mt-0.5"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span>
                    <span className="font-medium">Featured product</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      On = homepage &quot;Featured Pieces / Editor&apos;s
                      Picks&quot; section mein show hoga.
                    </span>
                  </span>
                </label>
              )}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="border border-border bg-white p-6">
        <h2 className="mb-6 font-serif text-xl">Images</h2>
        <div className="flex flex-wrap gap-4">
          {images.map((url) => (
            <div key={url} className="relative h-28 w-24 overflow-hidden border border-border">
              <Image src={url} alt="Product image" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          <label className="flex h-28 w-24 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border text-xs text-muted-foreground hover:border-charcoal">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UploadCloud className="h-5 w-5" />
                Upload
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleImageUpload(e.target.files)}
            />
          </label>
        </div>
      </section>

      {/* Variants */}
      <section className="border border-border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-serif text-xl">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ size: "M", stock_quantity: 0 })}
          >
            <Plus className="h-4 w-4" /> Add variant
          </Button>
        </div>

        <div className="space-y-4">
          {variantFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 items-end gap-3 border border-border p-4 sm:grid-cols-4"
            >
              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <Controller
                  control={control}
                  name={`variants.${index}.size`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  {...register(`variants.${index}.stock_quantity`)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Price override</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Optional"
                  {...register(`variants.${index}.price_override`)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={variantFields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {errors.variants && (
          <p className="mt-2 text-xs text-destructive">
            {errors.variants.message ?? "Check variant details"}
          </p>
        )}
      </section>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {productId ? "Save changes" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
