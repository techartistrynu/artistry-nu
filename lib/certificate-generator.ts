"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateCertificate(submissionId: string) {
  try {
    const supabase = createServerClient()

    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select(`
        *,
        users:user_id (name, email),
        tournaments:tournament_id (title, category)
      `)
      .eq("id", submissionId)
      .single()

    if (submissionError) {
      throw submissionError
    }

    if (!submission) {
      throw new Error("Submission not found")
    }

    // Check if certificate already exists
    const { data: existingCert, error: certCheckError } = await supabase
      .from("certificates")
      .select("*")
      .eq("submission_id", submissionId)
      .single()

    if (existingCert) {
      return {
        success: false,
        message: "Certificate already exists for this submission",
        certificateId: existingCert.id,
      }
    }

    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // In a real application, you would generate a PDF certificate here
    // For now, we'll just create a certificate record

    // Create certificate record
    const { data: certificate, error: createError } = await supabase
      .from("certificates")
      .insert({
        user_id: submission.user_id,
        submission_id: submission.id,
        tournament_id: submission.tournament_id,
        certificate_number: certificateNumber,
        issue_date: new Date().toISOString(),
        status: "issued",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    revalidatePath("/admin/certificates")
    revalidatePath("/dashboard/certificates")

    return {
      success: true,
      message: "Certificate generated successfully",
      certificateId: certificate.id,
    }
  } catch (error) {
    console.error("Error generating certificate:", error)
    return {
      success: false,
      message: "Failed to generate certificate",
    }
  }
}
