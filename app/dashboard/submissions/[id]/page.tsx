"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSubmissionById } from "@/app/actions/submissions"
import Image from "next/image"
import { fetchTournamentById } from "@/app/actions/tournaments"

export default function SubmissionDetailPage() {
  const { id: submissionId } = useParams()
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null)

  const [submission, setSubmission] = useState<any>(null)
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) {
        router.push("/dashboard")
        return
      }

      const submissionData = await getSubmissionById(submissionId as string)
      if (!submissionData) {
        router.push("/dashboard")
        return
      }

      const tournamentData = await fetchTournamentById(submissionData.tournament_id)
      setSubmission(submissionData)
      setTournament(tournamentData)
      setLoading(false)
    }

    fetchData()
  }, [submissionId, router])

  const handleDownloadReceipt = () => {
    if (!receiptRef.current) return

    const printContent = receiptRef.current.innerHTML
    const printWindow = window.open("", "", "height=600,width=800")
    if (!printWindow) return

    printWindow.document.write("<html><head><title>Submission Receipt</title>")
    printWindow.document.write(
      `<style>
        body { font-family: sans-serif; padding: 20px; }
        h2 { color: green; }
        .line { margin-bottom: 8px; }
        img { max-width: 100%; height: auto; margin-top: 10px; }
      </style>`
    )
    printWindow.document.write("</head><body>")
    printWindow.document.write(printContent)
    printWindow.document.write("</body></html>")
    printWindow.document.close()
    printWindow.print()
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl">
      <div ref={receiptRef}>
        <h2 className="text-2xl font-bold mb-4 text-green-600">🎨 Submission Details</h2>

        <div className="line"><strong>Submission No.:</strong> {submission.submission_number}</div>
        <div className="line"><strong>Title:</strong> {submission.title}</div>
        <div className="line"><strong>Description:</strong> {submission.description || "N/A"}</div>
        <div className="line"><strong>Status:</strong> {submission.status}</div>
        <div className="line"><strong>Applicant:</strong> {submission.applicant_name || "N/A"}</div>
        <div className="line"><strong>Phone:</strong> {submission.phone_number || "N/A"}</div>
        <div className="line"><strong>Payment Status:</strong> {submission.payment_status || "unpaid"}</div>
        <div className="line"><strong>Paid Amount:</strong> ₹{(submission.paid_amount ?? 0) / 100}</div>
        <div className="line">
          <strong>Submitted At:</strong>{" "}
          {submission.created_at
            ? new Date(submission.created_at).toLocaleString()
            : "N/A"}
        </div>

        <div className="mt-6 mb-4">
          <h3 className="text-lg font-semibold">Tournament Details</h3>
          <div className="line"><strong>Title:</strong> {tournament?.title || "N/A"}</div>
          <div className="line"><strong>Categories:</strong> {Array.isArray(tournament?.categories) ? tournament.categories.join(', ') : tournament?.category || "N/A"}
          {tournament?.ageCategory && (
            <span className="ml-2 text-xs text-muted-foreground">(Age: {tournament.ageCategory})</span>
          )}
          </div>
        </div>

        {submission.submission_files?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Attached Files</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {submission.submission_files.map((file: any) => (
                <div key={file.id} className="border rounded p-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={file.url}
                      alt={file.name || "Submission file"}
                      width={200}
                      height={200}
                      className="rounded shadow"
                    />
                  </a>
                  <p className="text-sm mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleDownloadReceipt}>Download Receipt</Button>
      </div>
    </div>
  )
}
