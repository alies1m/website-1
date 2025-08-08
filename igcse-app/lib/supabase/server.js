import { cookies } from "next/headers";
import { createServerClient as createSb } from "@supabase/auth-helpers-nextjs";

export function createServerClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createSb({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
    getCookie(name) {
      return cookieStore.get(name)?.value;
    },
    setCookie(name, value, options) {
      cookieStore.set({ name, value, ...options });
    },
    removeCookie(name, options) {
      cookieStore.set({ name, value: "", ...options });
    },
  });
}