import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

/**
 * Server-side Supabase client bound to the request cookies.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component where cookies are read-only.
            // Session refresh is handled by middleware, so this is safe to ignore.
          }
        },
      },
    }
  );
}

function isServiceRoleConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) return false;
  // Common local placeholders that look "set" but are not real JWT keys.
  if (/^(placeholder|your-service-role-key|changeme|xxx)/i.test(key)) {
    return false;
  }
  return key.length >= 40;
}

/**
 * Elevated Supabase client using the service role key.
 * SERVER-ONLY. Bypasses RLS — use exclusively in trusted server actions
 * (admin mutations, storage uploads). Never expose the returned client
 * or the key to the browser.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Preferred client for admin server actions:
 * - Uses service role when a real key is configured (bypasses RLS)
 * - Otherwise uses the signed-in user's session (admin RLS policies apply)
 *
 * Always call `isCurrentUserAdmin()` before mutating with this client.
 */
export function createPrivilegedClient() {
  if (isServiceRoleConfigured()) {
    return createAdminClient();
  }
  return createClient();
}
