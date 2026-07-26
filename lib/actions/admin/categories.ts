"use server";

import { revalidatePath } from "next/cache";

import { isCurrentUserAdmin } from "@/lib/auth";
import { createPrivilegedClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

interface CreateCategoryResult {
  success: boolean;
  category?: { id: string; name: string };
  error?: string;
}

interface ActionResult {
  success: boolean;
  error?: string;
  deleted?: number;
}

export async function createCategory(
  nameInput: string
): Promise<CreateCategoryResult> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const name = nameInput.trim().replace(/\s+/g, " ");
  if (!name) {
    return { success: false, error: "Category name is required." };
  }
  if (name.length > 60) {
    return { success: false, error: "Keep category names under 60 characters." };
  }

  const supabase = createPrivilegedClient();
  const baseSlug = slugify(name) || "category";

  const { data: existingByName } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", name)
    .maybeSingle();

  if (existingByName) {
    return {
      success: true,
      category: { id: existingByName.id, name: existingByName.name },
    };
  }

  let slug = baseSlug;
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = attempt === 0 ? slug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug: candidate, image_url: null })
      .select("id, name")
      .single();

    if (!error && data) {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath("/admin/products");
      revalidatePath("/admin/products/new");
      return { success: true, category: data };
    }

    if (error?.code === "23505") {
      slug = candidate;
      continue;
    }

    console.error("[categories] createCategory failed:", error?.message);
    return {
      success: false,
      error: error?.message ?? "Could not create category.",
    };
  }

  return { success: false, error: "Could not create a unique category slug." };
}

/** Removes the original demo seed categories if they still exist. */
export async function removeSeedCategories(): Promise<ActionResult> {
  if (!(await isCurrentUserAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const seedIds = [
    "11111111-1111-1111-1111-111111111101",
    "11111111-1111-1111-1111-111111111102",
    "11111111-1111-1111-1111-111111111103",
    "11111111-1111-1111-1111-111111111104",
  ];

  const supabase = createPrivilegedClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .in("id", seedIds)
    .select("id");

  if (error) {
    console.error("[categories] removeSeedCategories failed:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");

  return { success: true, deleted: data?.length ?? 0 };
}
