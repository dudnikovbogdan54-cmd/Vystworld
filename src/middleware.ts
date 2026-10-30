import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const fetchWithTimeout: typeof fetch = (input, init = {}) =>
  fetch(input, { ...init, signal: AbortSignal.timeout(5_000) });

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: Array<{
        name: string;
        value: string;
        options?: Parameters<typeof response.cookies.set>[2];
      }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (error) {
    // A temporary Auth outage must not turn every protected-page request into a 504.
    console.warn(
      "[VystWorld] Supabase session refresh failed:",
      error instanceof Error ? error.name : "unknown error"
    );
  }

  return response;
}

export const config = {
  // Public pages (home, shop, login and registration) do not need a Supabase
  // session refresh. Keeping middleware off them avoids unnecessary Auth calls.
  matcher: ["/account/:path*", "/admin/:path*"],
};
