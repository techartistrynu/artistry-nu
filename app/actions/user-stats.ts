// lib/firebase/access.ts
"use server"
import { db } from "@/lib/firebase/server"

export async function fetchDashboardStats(userId: string) {
  const submissionsRef = db.collection("submissions")
  const certificatesRef = db.collection("certificates")

  // Build queries
  const totalSubmissionsQuery = submissionsRef.where("user_id", "==", userId)
  const pendingSubmissionsQuery = submissionsRef.where("user_id", "==", userId).where("status", "==", "pending")
  const approvedSubmissionsQuery = submissionsRef.where("user_id", "==", userId).where("status", "==", "approved")
  const totalCertificatesQuery = certificatesRef.where("user_id", "==", userId)

  // Get counts
  const [
    totalSubmissionsSnap,
    pendingSubmissionsSnap,
    approvedSubmissionsSnap,
    certificateSnap,
  ] = await Promise.all([
    totalSubmissionsQuery.count().get(),
    pendingSubmissionsQuery.count().get(),
    approvedSubmissionsQuery.count().get(),
    totalCertificatesQuery.count().get(),
  ])

  return {
    totalSubmissions: totalSubmissionsSnap.data().count,
    pendingSubmissions: pendingSubmissionsSnap.data().count,
    approvedSubmissions: approvedSubmissionsSnap.data().count,
    totalCertificates: certificateSnap.data().count,
  }
}
