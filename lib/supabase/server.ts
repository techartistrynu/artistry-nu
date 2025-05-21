import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { CookieStore } from "next/dist/compiled/@edge-runtime/cookies"
import type { Database } from "@/types/supabase"

export function createServerClient(cookieStore?: CookieStore) {
  const cookieJar = cookieStore || cookies()

  return createSupabaseServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieJar.get(name)?.value
      },
      set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
        try {
          cookieJar.set({ name, value, ...options })
        } catch (error) {
          // This can happen when attempting to set cookies in middleware
          console.error("Error setting cookie:", error)
        }
      },
      remove(name: string, options: { path: string; domain?: string }) {
        try {
          cookieJar.set({ name, value: "", ...options, maxAge: 0 })
        } catch (error) {
          console.error("Error removing cookie:", error)
        }
      },
    },
  })
}

// Create a server client with service role for admin operations
export function createServiceClient() {
  return createSupabaseServerClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false,
    },
  })
}

// For backward compatibility
export const getSupabaseServer = createServerClient
