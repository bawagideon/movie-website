import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Create a Supabase client for Server Components
 * Works with your current TS config and React 19
 */
export async function createClient() {
  // Always await cookies() to support Next versions where it's async.
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => {
          try {
            // Prefer cookieStore.getAll() when available (Next's CookieStore API)
            if (cookieStore && typeof (cookieStore as any).getAll === "function") {
              return (cookieStore as any).getAll().map((c: any) => ({ name: c.name, value: c.value }))
            }
            // Fallback to iterating if it's iterable
            if (Symbol.iterator in Object(cookieStore)) {
              return Array.from(cookieStore as any, ([name, value]: any) => ({ name, value }))
            }
            return []
          } catch {
            return []
          }
        },
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) => {
              try {
                if (cookieStore && typeof (cookieStore as any).set === "function") {
                  ;(cookieStore as any).set(name, value, options)
                }
              } catch {
                // ignore individual cookie failures
              }
            })
          } catch {
            // ignore
          }
        },
      },
    }
  )
}
