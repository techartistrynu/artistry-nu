"use server"

import { db } from "@/lib/firebase/server"

export async function getAllUsers() {
  try {
    const usersSnap = await db.collection("users").get()

    const users = await Promise.all(
      usersSnap.docs.map(async (userDoc) => {
        const userData = userDoc.data()
        const userId = userDoc.id

        const submissionsSnap = await db
          .collection("submissions")
          .where("user_id", "==", userId)
          .get()

        return {
          id: userId,
          name: userData.name || null,
          email: userData.email || null,
          submissionCount: submissionsSnap.size,
        }
      })
    )

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}
