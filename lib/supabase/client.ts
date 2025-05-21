"use client"

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createSupabaseBrowserClient<Database>> | null = null

export function createBrowserClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  supabaseClient = createSupabaseBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}
