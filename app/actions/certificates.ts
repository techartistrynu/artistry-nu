// app/actions/certificates.ts

"use server"

import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

// Helper to fetch related documents
async function enrichCertificate(cert: any) {
  const [tournamentSnap, submissionSnap, userSnap] = await Promise.all([
    cert.tournament_id ? getDoc(doc(db, "tournaments", cert.tournament_id)) : null,
    cert.submission_id ? getDoc(doc(db, "submissions", cert.submission_id)) : null,
    cert.user_id ? getDoc(doc(db, "users", cert.user_id)) : null,
  ])

  return {
    ...cert,
    tournaments: tournamentSnap?.exists() ? tournamentSnap.data() : null,
    submissions: submissionSnap?.exists() ? submissionSnap.data() : null,
    users: userSnap?.exists() ? userSnap.data() : null,
  }
}

export async function getUserCertificates(userId: string) {
  try {
    const q = query(
      collection(db, "certificates"),
      where("user_id", "==", userId),
      orderBy("issue_date", "desc")
    )

    const snapshot = await getDocs(q)
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
    const certSnap = await getDoc(doc(db, "certificates", id))

    if (!certSnap.exists()) {
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
