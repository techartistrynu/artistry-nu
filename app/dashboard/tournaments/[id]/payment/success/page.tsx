"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { fetchSubmissionById } from "@/app/actions/submissions"
import { fetchTournamentById } from "@/app/actions/tournaments"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { id: tournamentId } = useParams()
  const submissionId = searchParams.get("submissionId")
  const receiptRef = useRef<HTMLDivElement>(null)

  const [submission, setSubmission] = useState<any>(null)
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId || !submissionId) {
        router.push("/dashboard")
        return
      }

      const submissionData = await fetchSubmissionById(submissionId)
      if (!submissionData || submissionData.tournament_id !== tournamentId || submissionData.payment_status !== "paid") {
        router.push("/dashboard")
        return
      }

      const tournamentData = await fetchTournamentById(tournamentId as string)
      setSubmission(submissionData)
      setTournament(tournamentData)
      setLoading(false)
    }

    fetchData()
  }, [tournamentId, submissionId, router])

  const handleDownloadReceipt = () => {
    if (!receiptRef.current) return

    const printContent = receiptRef.current.innerHTML
    const printWindow = window.open("", "", "height=600,width=800")
    if (!printWindow) return

    printWindow.document.write("<html><head><title>Payment Receipt</title>")
    printWindow.document.write(
      `<style>
        body { font-family: sans-serif; padding: 20px; }
        h2 { color: green; }
        .line { margin-bottom: 8px; }
      </style>`
    )
    printWindow.document.write("</head><body>")
    printWindow.document.write(printContent)
    printWindow.document.write("</body></html>")
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow">
      <div ref={receiptRef}>
        <h2 className="text-2xl font-bold mb-4 text-green-600">🎉 Payment Successful!</h2>

        <div className="line"><strong>Tournament:</strong> {tournament?.title ?? "N/A"}</div>
        <div className="line"><strong>Submission ID:</strong> {submissionId ?? "N/A"}</div>
        <div className="line"><strong>Submission Title:</strong> {submission.title}</div>
        <div className="line"><strong>Applicant:</strong> {submission.applicant_name}</div>
        <div className="line"><strong>Phone:</strong> {submission.phone_number}</div>
        <div className="line"><strong>Amount Paid:</strong> ₹{(submission.paid_amount ?? 0) / 100}</div>
        <div className="line">
          <strong>Date:</strong>{" "}
          {submission.created_at
            ? new Date(submission.created_at._seconds * 1000).toLocaleString()
            : "N/A"}
        </div>
        <div className="line"><strong>Razorpay Payment ID:</strong> {submission.razorpay_payment_id}</div>
      </div>

      <div className="mt-6">
        <Button onClick={handleDownloadReceipt}>Download Receipt</Button>
      </div>
    </div>
  )
}
