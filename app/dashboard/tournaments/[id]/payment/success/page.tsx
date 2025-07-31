"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { fetchSubmissionById, getSubmissionById } from "@/app/actions/submissions"
import { fetchTournamentById } from "@/app/actions/tournaments"
import Image from "next/image"
import { getCategoryLabels } from "@/lib/utils"

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

      const submissionData = await getSubmissionById(submissionId)
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
    const printWindow = window.open("", "", "height=842,width=595")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body {
              font-family: 'Roboto', sans-serif;
              padding: 20px 40px;
              margin: 0;
              color: #333;
              line-height: 1.4;
              font-size: 13px;
            }
            .receipt-container {
              max-height: 742px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .receipt-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #1e40af;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              margin: 15px 0 8px 0;
              color: #1e293b;
            }
            .receipt-line {
              display: flex;
              margin-bottom: 4px;
            }
            .receipt-label {
              font-weight: 500;
              min-width: 120px;
              color: #475569;
            }
            .divider {
              border-top: 1px dashed #cbd5e1;
              margin: 12px 0;
            }
            .payment-details {
              background-color: #f8fafc;
              padding: 12px;
              border-radius: 4px;
              margin-top: 8px;
            }
            .total-amount {
              font-weight: 600;
              margin-top: 6px;
            }
            .footer {
              margin-top: 15px;
              font-size: 12px;
              color: #64748b;
            }
            .authorized {
              margin-top: 20px;
              text-align: right;
              font-size: 12px;
              color: #64748b;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContent}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 300)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate amounts based on submission data
  const baseAmount = submission.paid_amount / 100
  // const gstAmount = (baseAmount * 0.18).toFixed(2)
  const totalAmount = (baseAmount).toFixed(2)

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-col items-center justify-center text-xl font-sans font-bold text-green-600">Payment Successfull!</div>
      <div ref={receiptRef} className="w-full max-w-lg bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
        {/* Receipt Header */}
        <div className="receipt-header">
          <Image src={"/drawing111.png"} alt="Artistrynu Logo" width={80} height={80} className="mx-auto mb-2" />
          <div className="company-name font-bold text-xl font-sans text-center">ARTISTRYNU PRIVATE LIMITED</div>
          <div className="text-sm text-gray-600 mb-2">GST No: 10ABCCA9309E1Z7</div>
          <div className="receipt-title text-lg font-semibold text-blue-800">Receipt of Payment</div>
        </div>

        {/* Competition Details */}
        <div>
          <div className="section-title font-medium text-gray-800">Competition Details:</div>
          <div className="receipt-line">
            <span className="receipt-label">Category:</span>
            <span>First Category</span>
          </div>
          <div className="receipt-line">
            <span className="receipt-label">Title:</span>
            <span>{getCategoryLabels(tournament.categories)}</span>
          </div>
        </div>

        <div className="divider border-t border-dashed border-gray-300 my-4" />

        {/* Applicant Details */}
        <div>
          <div className="section-title font-medium text-gray-800">Applicant Details:</div>
          <div className="receipt-line">
            <span className="receipt-label">Name:</span>
            <span>{submission.applicant_name || "N/A"}</span>
          </div>
          <div className="receipt-line">
            <span className="receipt-label">Contact:</span>
            <span>{submission.phone_number || "N/A"}</span>
          </div>
          <div className="receipt-line">
            <span className="receipt-label">Title of Work:</span>
            <span>{submission.title}</span>
          </div>
          <div className="receipt-line">
            <span className="receipt-label">Submission Number:</span>
            <span>{submission.submission_number}</span>
          </div>
          <div className="receipt-line">
            <span className="receipt-label">Payment Status:</span>
            <span className="font-medium text-green-600">Paid</span>
          </div>
        </div>

        <div className="divider border-t border-dashed border-gray-300 my-4" />

        {/* Payment Details */}
        <div>
          <div className="section-title font-medium text-gray-800">Payment Details:</div>
          <div className="payment-details bg-gray-50 p-4 rounded">
            <div className="receipt-line">
              <span className="receipt-label">Base Amount:</span>
              <span>₹{baseAmount.toFixed(2)}</span>
            </div>
            {/* <div className="receipt-line">
              <span className="receipt-label">GST (18%):</span>
              <span>₹{gstAmount}</span>
            </div> */}
            <div className="receipt-line total-amount">
              <span className="receipt-label">Total Paid:</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Payment Date:</span>
              <span>{submission.created_at ? new Date(submission.created_at).toLocaleDateString('en-GB') : "N/A"}</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Mode of Payment:</span>
              <span>Google Pay</span>
            </div>
            <div className="receipt-line">
              <span className="receipt-label">Payment Reference ID:</span>
              <span>{submission.razorpay_payment_id}</span>
            </div>
          </div>
        </div>

        <div className="divider border-t border-dashed border-gray-300 my-4" />

        {/* Confirmation Text */}
        <p className="text-sm text-gray-600 mt-4">
          This is to confirm that the above-named applicant has successfully submitted their entry and paid
          the full fee for participating in the Drawing and Painting competition under the First Category
          organized by Artistrynu Private Limited.
        </p>

        {/* Footer */}
        <div className="footer text-sm text-gray-500 mt-6">
          <p>Thank you for your participation.</p>
          <p>For queries, contact: support@artistrynu.com</p>
        </div>

        {/* Authorized Signature */}
        <div className="authorized text-sm text-gray-500 mt-8 text-right">
          <p>Authorized by: Artistrynu Private Limited</p>
          <p>Date of Issue: {submission.created_at ? new Date(submission.created_at).toLocaleDateString('en-GB') : "N/A"}</p>
        </div>

        {/* Submission Files (hidden from print) */}
        {submission.submission_files?.length > 0 && (
          <div className="mt-8 print:hidden">
            <h3 className="text-lg font-semibold mb-3">Attached Submission</h3>
            <div className="grid grid-cols-2 gap-3">
              {submission.submission_files.map((file: any) => (
                <div key={file.id} className="border rounded p-2">
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <Image
                      src={file.url}
                      alt={file.name || "Submission file"}
                      width={200}
                      height={200}
                      className="rounded shadow w-full h-auto"
                    />
                  </a>
                  <p className="text-xs mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Download Button (hidden from print) */}
      <div className="mt-6 print:hidden">
        <Button onClick={handleDownloadReceipt}>
          Download Receipt
        </Button>
      </div>
    </div>
  )
}