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
