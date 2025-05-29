// app/actions/submissions.ts
"use server"

import { db, storage } from "@/lib/firebase/server"
import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { getDownloadURL } from "firebase/storage"
import { ref } from "firebase/storage"

export interface Submission {
  id: string
  title?: string
  user: any | null
  files: {
    id: string
    uploaded_at: string | null
    [key: string]: any
  }[]
  created_at: string | null
  updated_at: string | null
  reviewed_at: string | null
  [key: string]: any
}

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
    const submissionFilesSnap = await db.collection("submission_files").where("submission_id", "==", id).get()
    
    // Get user data
    const userSnap = await db.collection("users").doc(submission.user_id).get()
    const user = userSnap.exists ? {
      id: userSnap.id,
      name: userSnap.data()?.name || null,
      email: userSnap.data()?.email || null,
      image: userSnap.data()?.image || null
    } : null

    const toISOString = (timestamp: any) => {
      if (!timestamp) return null
      if (timestamp.toDate) return timestamp.toDate().toISOString()
      if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
      if (typeof timestamp === 'string') return timestamp
      return null
    }

    return {
      ...submission,
      id: doc.id,
      user,
      tournament: tournamentSnap.exists ? 
      { 
        ...tournamentSnap.data(), 
        id: tournamentSnap.id,
        submission_deadline: toISOString(tournamentSnap.data()?.submission_deadline)
      } : null,
      files: submissionFilesSnap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          ...data,
          uploaded_at: toISOString(data.uploaded_at)
        }
      }),
      created_at: toISOString(submission.created_at),
      updated_at: toISOString(submission.updated_at),
      reviewed_at: toISOString(submission.reviewed_at)
    } as Submission
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

export const getAllTournaments = async () => {
  const snapshot = await db.collection("tournaments").get()
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title || "",
      registration_start: data.registration_start?.toDate?.().toISOString() || null,
      registration_end: data.registration_end?.toDate?.().toISOString() || null,
      submission_deadline: data.submission_deadline?.toDate?.().toISOString() || null,
      created_at: data.created_at?.toDate?.().toISOString() || null,
      updated_at: data.updated_at?.toDate?.().toISOString() || null
    }
  })
}

export async function getSubmissionsByTournament(
  tournamentId: string,
  page: number = 1,
  limit: number = 10,
  searchQuery: string = ""
) {
  try {
    let query = db.collection("submissions").where("tournament_id", "==", tournamentId);

    if (searchQuery) {
      query = query.where("applicant_name", ">=", searchQuery)
        .where("applicant_name", "<=", searchQuery + "\uf8ff");
    }

    const snapshot = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

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
          rank: submissionData.rank || null,
          score: submissionData.score || null,
          applicant_name: submissionData.applicant_name || null,
          date_of_birth: submissionData.date_of_birth || null,
          certificate_url: submissionData.certificate_url || null,
          submission_number: submissionData.submission_number || null,
          reviewed_at: submissionData.reviewed_at?.toDate?.().toISOString() || null,
          created_at: submissionData.created_at?.toDate?.().toISOString() || null,
          updated_at: submissionData.updated_at?.toDate?.().toISOString() || null,
          user,
          tournaments: tournament,
        }
      })
    )

    return { submissions, total };
  } catch (error) {
    console.error("Error in getSubmissionsByTournament:", error);
    return { submissions: [], total: 0 };
  }
}

// app/actions/submissions.ts
export async function getDownloadUrl(filePath: string) {
  try {
    const bucket = storage.bucket()
    const file = bucket.file(filePath)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    })
    return url
  } catch (error) {
    console.error("Error generating download URL:", error)
    return null
  }
}

export async function updateSubmissionScore(
  submissionId: string,
  score: number,
  status: "approved" | "rejected"
) {
  try {
    if (score < 0 || score > 10) {
      return { success: false, message: "Score must be between 0 and 10" }
    }

    await db.collection("submissions").doc(submissionId).update({
      score: parseFloat(score.toFixed(2)),
      status,
      reviewed_at: Timestamp.now()
    })

    revalidatePath("/admin/dashboard/submissions")
    return { success: true, message: "Submission updated successfully" }
  } catch (error) {
    console.error("Error updating submission:", error)
    return { success: false, message: "Failed to update submission" }
  }
}