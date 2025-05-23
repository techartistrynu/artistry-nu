// app/actions/certificates.ts

"use server"

import { db } from "@/lib/firebase/server"

// Helper to fetch related documents
async function enrichCertificate(cert: any) {
  const [tournamentSnap, submissionSnap, userSnap] = await Promise.all([
    cert.tournament_id ? db.collection("tournaments").doc(cert.tournament_id).get() : null,
    cert.submission_id ? db.collection("submissions").doc(cert.submission_id).get() : null,
    cert.user_id ? db.collection("users").doc(cert.user_id).get() : null,
  ])

  return {
    ...cert,
    tournaments: tournamentSnap?.exists ? tournamentSnap.data() : null,
    submissions: submissionSnap?.exists ? submissionSnap.data() : null,
    users: userSnap?.exists ? userSnap.data() : null,
  }
}

export async function getUserCertificates(userId: string) {
  try {
    const snapshot = await db
      .collection("certificates")
      .where("user_id", "==", userId)
      .orderBy("issue_date", "desc")
      .get()

    const rawCerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const certsWithDetails = await Promise.all(rawCerts.map(enrichCertificate))

    return certsWithDetails
  } catch (error) {
    console.error("Error in getUserCertificates:", error)
    return []
  }
}

export const getCertificatesByUserId = getUserCertificates

export async function getCertificateById(id: string) {
  try {
    const certSnap = await db.collection("certificates").doc(id).get()

    if (!certSnap.exists) {
      return null
    }

    const cert = { id: certSnap.id, ...certSnap.data() }
    return await enrichCertificate(cert)
  } catch (error) {
    console.error("Error in getCertificateById:", error)
    return null
  }
}

export async function downloadCertificate(id: string) {
  try {
    // Placeholder for actual PDF logic
    return {
      success: true,
      message: "Certificate downloaded successfully",
    }
  } catch (error) {
    console.error("Error in downloadCertificate:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}
