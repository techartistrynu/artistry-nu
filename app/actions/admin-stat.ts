"use server"

import { db } from "@/lib/firebase/server"

export async function fetchDashboardStats() {
  const usersRef = db.collection("users")
  const tournamentsRef = db.collection("tournaments")
  const submissionsRef = db.collection("submissions")
  const certificatesRef = db.collection("certificates")
  const paymentsRef = db.collection("payments")

  const [
    userSnap,
    tournamentSnap,
    submissionSnap,
    pendingSnap,
    certificateSnap,
    paymentSnap,
  ] = await Promise.all([
    usersRef.count().get(),
    tournamentsRef.count().get(),
    submissionsRef.count().get(),
    submissionsRef.where("status", "==", "pending").count().get(),
    certificatesRef.count().get(),
    paymentsRef.count().get(),
  ])

  return {
    totalUsers: userSnap.data().count,
    totalTournaments: tournamentSnap.data().count,
    totalSubmissions: submissionSnap.data().count,
    pendingSubmissions: pendingSnap.data().count,
    totalCertificates: certificateSnap.data().count,
    totalPayments: paymentSnap.data().count,
  }
}
