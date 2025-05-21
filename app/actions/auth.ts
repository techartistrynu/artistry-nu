"use server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

type RegisterUserParams = {
  name: string
  email: string
  password: string
}

export async function registerUser({ name, email, password }: RegisterUserParams) {
  if (!name || !email || !password) {
    return {
      success: false,
      message: "Missing required fields",
    }
  }

  try {
    // Create a Supabase client with the service role key for admin privileges
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return {
        success: false,
        message: "Server configuration error",
      }
    }

    // Create a service role client that bypasses RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return {
        success: false,
        message: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Failed to create user",
      }
    }

    // Create a record in the users table using service role
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      name,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      return {
        success: false,
        message: insertError.message,
      }
    }

    revalidatePath("/login")

    return {
      success: true,
      message: "Registration successful. Please log in.",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}
