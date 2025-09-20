"use server"

import { db } from "@/lib/firebase/server"


export async function getPaymentDetailsBySubmission(tournamentId: string, submissionId: string) {
  try {
    if (!tournamentId || !submissionId) {
      return {
        success: false,
        message: "Missing tournamentId or submissionId",
      }
    }

    // 1. Fetch the submission document
    const submissionSnap = await db.collection("submissions").doc(submissionId).get()
    if (!submissionSnap.exists) {
      return {
        success: false,
        message: "Submission not found",
      }
    }

    const submission = submissionSnap.data() as any

    // 2. Validate submission belongs to this tournament and is paid
    if (
      submission.tournament_id !== tournamentId ||
      submission.payment_status !== "paid"
    ) {
      return {
        success: false,
        message: "Invalid tournament ID or unpaid submission",
      }
    }

    // 3. Fetch the tournament document
    const tournamentSnap = await db.collection("tournaments").doc(tournamentId).get()
    if (!tournamentSnap.exists) {
      return {
        success: false,
        message: "Tournament not found",
      }
    }

    const tournament = tournamentSnap.data() as any

    // 4. Format the response
    const paymentDetails = {
      submission_id: submissionId,
      tournament_id: tournamentId,
      title: submission.title,
      applicant_name: submission.applicant_name,
      phone_number: submission.phone_number,
      amount_paid: submission.amount_paid,
      payment_date: submission.payment_date,
      razorpay_payment_id: submission.razorpay_payment_id,
      razorpay_order_id: submission.razorpay_order_id,
      tournament: {
        id: tournamentSnap.id,
        title: tournament.title,
        entry_fee: tournament.entry_fee,
        start_date: tournament.start_date,
        end_date: tournament.end_date,
      },
    }

    return {
      success: true,
      payment: paymentDetails,
    }
  } catch (error) {
    console.error("Error in getPaymentDetailsBySubmission:", error)
    return {
      success: false,
      message: "Internal server error",
    }
  }
}


export async function getUserPayments(userId: string) {
  try {
    const paymentsRef = db.collection("payments")
    const snapshot = await paymentsRef
      .where("user_id", "==", userId)
      .orderBy("payment_date", "desc")
      .get()

    const payments = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const payment = docSnap.data()
        const tournamentId = payment.tournament_id

        let tournament = null
        if (tournamentId) {
          const tournamentSnap = await db.collection("tournaments").doc(tournamentId).get()
          if (tournamentSnap.exists) {
            tournament = tournamentSnap.data() as { id?: string }
            tournament.id = tournamentSnap.id
          }
        }

        return {
          id: docSnap.id,
          ...payment,
          tournament,
        }
      })
    )

    return payments
  } catch (error) {
    console.error("Error in getUserPayments:", error)
    return []
  }
}

export const getPaymentsByUserId = getUserPayments

export async function getAllPayments() {
  try {
    const paymentsSnap = await db.collection("payments")
      .where("payment_status", "==", "paid")
      .orderBy("payment_date", "desc")
      .get()

    const payments = await Promise.all(
      paymentsSnap.docs.map(async (docSnap) => {
        const payment = docSnap.data()
        const paymentId = docSnap.id

        // 1. Get user info
        let userData: any = {}
        if (payment.user_id) {
          const userSnap = await db.collection("users").doc(payment.user_id).get()
          if (userSnap.exists) {
            userData = userSnap.data()
          }
        }

        // 2. Get submission info
        let submissionData: any = {}
        if (payment.submission_id) {
          const submissionSnap = await db.collection("submissions").doc(payment.submission_id).get()
          if (submissionSnap.exists) {
            submissionData = submissionSnap.data()
          }
        }

        // 3. Get tournament info
        let tournamentData: any = {}
        if (payment.tournament_id) {
          const tournamentSnap = await db.collection("tournaments").doc(payment.tournament_id).get()
          if (tournamentSnap.exists) {
            tournamentData = tournamentSnap.data()
          }
        }

        return {
          id: payment.razorpay_payment_id || paymentId,
          amount: (payment.paid_amount / 100).toFixed(2),
          date: payment.payment_date?.toDate?.() || new Date(),
          status: payment.payment_status,
          paymentMethod: payment.payment_method,
          submissionId: payment.submission_id,
          tournamentId: payment.tournament_id,
          tournamentTitle: tournamentData.title || "N/A",
          userId: payment.user_id,
          userName: submissionData.applicant_name || userData.name || "N/A",
          userEmail: userData.email || "N/A",
        }
      })
    )

    return payments
  } catch (error) {
    console.error("Error in getAllPayments:", error)
    return []
  }
}

// Search submissions by name, username, or email - Optimized version
export async function searchSubmissions(query: string) {
  try {
    if (!query.trim()) {
      return []
    }

    const queryLower = query.toLowerCase().trim()
    
    // If query looks like an email, search users first
    if (queryLower.includes('@')) {
      return await searchByEmail(queryLower)
    }
    
    // If query looks like a submission ID (long alphanumeric), search by ID
    if (queryLower.length > 15 && /^[a-zA-Z0-9]+$/.test(queryLower)) {
      return await searchBySubmissionId(queryLower)
    }
    
    // Otherwise, search by applicant name and title
    return await searchByText(queryLower)
  } catch (error) {
    console.error("Error in searchSubmissions:", error)
    return []
  }
}

// Search by email - most efficient
async function searchByEmail(email: string) {
  try {
    // First, find users with matching email
    const usersSnap = await db.collection("users")
      .where("email", ">=", email)
      .where("email", "<=", email + '\uf8ff')
      .limit(10)
      .get()

    if (usersSnap.empty) {
      return []
    }

    const userIds = usersSnap.docs.map(doc => doc.id)
    
    // Get submissions for these users
    const submissionsSnap = await db.collection("submissions")
      .where("user_id", "in", userIds.slice(0, 10)) // Firestore 'in' limit is 10
      .orderBy("created_at", "desc")
      .limit(20)
      .get()

    return await processSubmissions(submissionsSnap.docs)
  } catch (error) {
    console.error("Error in searchByEmail:", error)
    return []
  }
}

// Search by submission ID - very efficient
async function searchBySubmissionId(submissionId: string) {
  try {
    const submissionSnap = await db.collection("submissions").doc(submissionId).get()
    
    if (!submissionSnap.exists) {
      return []
    }

    return await processSubmissions([submissionSnap])
  } catch (error) {
    console.error("Error in searchBySubmissionId:", error)
    return []
  }
}

// Search by text (applicant name, title) - optimized
async function searchByText(query: string) {
  try {
    // Search by applicant_name first (most common search)
    const submissionsSnap = await db.collection("submissions")
      .where("applicant_name", ">=", query)
      .where("applicant_name", "<=", query + '\uf8ff')
      .orderBy("applicant_name")
      .limit(20)
      .get()

    return await processSubmissions(submissionsSnap.docs)
  } catch (error) {
    console.error("Error in searchByText:", error)
    // Fallback to title search if applicant_name search fails
    try {
      const submissionsSnap = await db.collection("submissions")
        .where("title", ">=", query)
        .where("title", "<=", query + '\uf8ff')
        .orderBy("title")
        .limit(20)
        .get()

      return await processSubmissions(submissionsSnap.docs)
    } catch (fallbackError) {
      console.error("Error in fallback search:", fallbackError)
      return []
    }
  }
}

// Process submissions with optimized batch user/tournament data fetching
async function processSubmissions(submissionDocs: any[]) {
  if (submissionDocs.length === 0) {
    return []
  }

  const submissions = []
  const userIds = new Set()
  const tournamentIds = new Set()

  // Collect all unique IDs
  for (const doc of submissionDocs) {
    const data = doc.data()
    if (data.user_id) userIds.add(data.user_id)
    if (data.tournament_id) tournamentIds.add(data.tournament_id)
  }

  // Batch fetch only the specific users and tournaments we need
  const userPromises = []
  const tournamentPromises = []

  // Split into batches of 10 (Firestore 'in' query limit)
  const userIdArray = Array.from(userIds)
  const tournamentIdArray = Array.from(tournamentIds)

  for (let i = 0; i < userIdArray.length; i += 10) {
    const batch = userIdArray.slice(i, i + 10)
    userPromises.push(
      db.collection("users").where("__name__", "in", batch).get()
    )
  }

  for (let i = 0; i < tournamentIdArray.length; i += 10) {
    const batch = tournamentIdArray.slice(i, i + 10)
    tournamentPromises.push(
      db.collection("tournaments").where("__name__", "in", batch).get()
    )
  }

  // Execute all promises in parallel
  const [userResults, tournamentResults] = await Promise.all([
    Promise.all(userPromises),
    Promise.all(tournamentPromises)
  ])

  // Create lookup maps
  const usersMap = new Map()
  const tournamentsMap = new Map()

  userResults.forEach(snap => {
    snap.docs.forEach(doc => {
      usersMap.set(doc.id, doc.data())
    })
  })

  tournamentResults.forEach(snap => {
    snap.docs.forEach(doc => {
      tournamentsMap.set(doc.id, doc.data())
    })
  })

  // Process submissions
  for (const doc of submissionDocs) {
    const submission = doc.data()
    const userData = usersMap.get(submission.user_id) || {}
    const tournamentData = tournamentsMap.get(submission.tournament_id) || {}

    submissions.push({
      id: doc.id,
      title: submission.title || 'Untitled',
      applicant_name: submission.applicant_name || 'N/A',
      submission_number: submission.submission_number || 'N/A',
      payment_status: submission.payment_status || 'unpaid',
      created_at: submission.created_at?.toDate?.().toISOString() || null,
      user: {
        id: submission.user_id,
        name: userData?.name || 'N/A',
        email: userData?.email || 'N/A',
      },
      tournament: {
        id: submission.tournament_id,
        title: tournamentData?.title || 'N/A',
      }
    })
  }

  return submissions
}

// Create payment record and update submission
export async function createPaymentRecord(formData: {
  submission_id: string
  paid_amount: number
  payment_date: string
  payment_method: string
  payment_status: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  tournament_id: string
  user_id: string
}) {
  try {
    const { submission_id, paid_amount, payment_date, payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, tournament_id, user_id } = formData

    // Validate required fields
    if (!submission_id || !paid_amount || !payment_date || !payment_method || !payment_status || !tournament_id || !user_id) {
      return {
        success: false,
        message: "Missing required fields"
      }
    }

    // Check if submission exists
    const submissionSnap = await db.collection("submissions").doc(submission_id).get()
    if (!submissionSnap.exists) {
      return {
        success: false,
        message: "Submission not found"
      }
    }

    // Create payment record
    const paymentData = {
      submission_id,
      tournament_id,
      user_id,
      paid_amount: paid_amount * 100, // Convert to paise
      payment_date: new Date(payment_date),
      payment_method,
      payment_status,
      razorpay_order_id: razorpay_order_id || '',
      razorpay_payment_id,
      razorpay_signature: razorpay_signature || '',
      created_at: new Date(),
    }

    await db.collection('payments').add(paymentData)

    // Update submission with payment details
    await db.collection("submissions").doc(submission_id).update({
      payment_status: "paid",
      paid_amount: paid_amount * 100, // Convert to paise
      razorpay_payment_id,
      razorpay_order_id: razorpay_order_id || '',
      updated_at: new Date(),
    })

    return {
      success: true,
      message: "Payment record created and submission updated successfully"
    }
  } catch (error) {
    console.error("Error in createPaymentRecord:", error)
    return {
      success: false,
      message: "Failed to create payment record"
    }
  }
}


