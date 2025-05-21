// app/actions/submissions.ts
"use server"

import { db } from "@/lib/firebase/server"
import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { doc, getDoc } from "firebase/firestore"

export async function getUserSubmissions(userId: string) {
  try {
    const submissionsRef = db.collection("submissions")
    const snapshot = await submissionsRef
      .where("user_id", "==", userId)
      .orderBy("created_at", "desc")
      .get()

    const submissions = await Promise.all(snapshot.docs.map(async doc => {
      const submission = doc.data()
      const tournamentRef = db.collection("tournaments").doc(submission.tournament_id)
      const tournamentSnap = await tournamentRef.get()
      const submissionFilesRef = db.collection("submission_files").where("submission_id", "==", doc.id).limit(1)
      const submissionFilesSnap = await submissionFilesRef.get()
      const submissionFile = submissionFilesSnap.docs[0]?.data() || null
      
      return {
        ...submission,
        id: doc.id,
        tournaments: tournamentSnap.exists ? tournamentSnap.data() : null,
        submission_file: submissionFile,
      }
    }))

    return submissions
  } catch (error) {
    console.error("Error in getUserSubmissions:", error)
    return []
  }
}

export const getSubmissionsByUserId = getUserSubmissions

export async function getSubmissionById(id: string) {
  try {
    const doc = await db.collection("submissions").doc(id).get()

    if (!doc.exists) return null

    const submission = doc.data()

    if (!submission) return null

    const tournamentSnap = await db.collection("tournaments").doc(submission.tournament_id).get()
    const submissionFilesSnap = await db.collection("submissions").doc(id).collection("submission_files").get()

    return {
      ...submission,
      id: doc.id,
      tournaments: tournamentSnap.exists ? tournamentSnap.data() : null,
      submission_files: submissionFilesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
    }
  } catch (error) {
    console.error("Error in getSubmissionById:", error)
    return null
  }
}

export async function fetchSubmissionById(submissionId: string) {
  try {
    const docRef = db.collection("submissions").doc(submissionId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) return null
    const data = docSnap.data()
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error("Failed to fetch submission:", error)
    return null
  }
}

export async function createSubmission(formData: FormData) {
  try {
    const tournamentId = formData.get("tournamentId") as string
    const userId = formData.get("userId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    if (!tournamentId || !userId || !title) {
      return { success: false, message: "Missing required fields" }
    }

    const submissionsRef = db.collection("submissions")
    const snapshot = await submissionsRef
      .where("user_id", "==", userId)
      .where("tournament_id", "==", tournamentId)
      .get()

    let submissionId: string

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      await doc.ref.update({
        title,
        description,
        status: "pending_review",
        updated_at: Timestamp.now(),
      })
      submissionId = doc.id
    } else {
      const newDoc = await submissionsRef.add({
        user_id: userId,
        tournament_id: tournamentId,
        title,
        description,
        status: "pending_review",
        created_at: Timestamp.now(),
      })
      submissionId = newDoc.id
    }

    revalidatePath("/dashboard/submissions")

    return {
      success: true,
      message: "Submission created successfully",
      submissionId,
    }
  } catch (error) {
    console.error("Error in createSubmission:", error)
    return {
      success: false,
      message: "An unexpected error occurred",
    }
  }
}
// Fetch all submissions for admin panel
export async function getAllSubmissions() {
  try {
    const snapshot = await db
      .collection("submissions")
      .orderBy("created_at", "desc")
      .get()

    const submissions = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const submissionData = doc.data()
        const submissionId = doc.id

        const userId = submissionData.user_id
        const tournamentId = submissionData.tournament_id

        let user = null
        let tournament = null

        // Sanitize user
        if (userId && typeof userId === "string") {
          const userSnap = await db.collection("users").doc(userId).get()
          if (userSnap.exists) {
            const rawUser = userSnap.data()
            user = {
              id: userSnap.id,
              name: rawUser?.name || null,
              email: rawUser?.email || null,
              image: rawUser?.image || null,
              createdAt: rawUser?.createdAt?.toDate?.().toISOString() || null,
            }
          }
        }

        // Sanitize tournament
        if (tournamentId && typeof tournamentId === "string") {
          const tournamentSnap = await db.collection("tournaments").doc(tournamentId).get()
          if (tournamentSnap.exists) {
            const rawTournament = tournamentSnap.data()
            tournament = {
              id: tournamentSnap.id,
              title: rawTournament?.title || null,
              registration_start: rawTournament?.registration_start?.toDate?.().toISOString() || null,
              registration_end: rawTournament?.registration_end?.toDate?.().toISOString() || null,
              submission_deadline: rawTournament?.submission_deadline?.toDate?.().toISOString() || null,
              updated_at: rawTournament?.updated_at?.toDate?.().toISOString() || null,
            }
          }
        }

        return {
          id: submissionId,
          title: submissionData.title || null,
          description: submissionData.description || null,
          status: submissionData.status || null,
          created_at: submissionData.created_at?.toDate?.().toISOString() || null,
          updated_at: submissionData.updated_at?.toDate?.().toISOString() || null,
          user,
          tournaments: tournament,
        }
      })
    )

    return submissions
  } catch (error) {
    console.error("Error fetching all submissions:", error)
    return []
  }
}


