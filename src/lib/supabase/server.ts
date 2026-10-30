import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const fetchWithTimeout: typeof fetch = (input, init = {}) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(8_000) });

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { fetch: fetchWithTimeout },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof cookieStore.set>[2];
        }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components cannot always write cookies; middleware handles session refresh.
          }
        },
      },
    }
  );
}
