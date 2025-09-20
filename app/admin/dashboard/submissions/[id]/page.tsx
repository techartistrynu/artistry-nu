"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSubmissionById, updateSubmissionScore } from "@/app/actions/submissions"
import { createPaymentRecord } from "@/app/actions/payments"
import { notFound, useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Star, User, Mail, Award, FileText, Calendar, CheckCircle2, XCircle, Phone, Cake, Ear, Download, CreditCard } from "lucide-react"
import Link from "next/link"
import { DownloadButton } from "../../../../../components/download-button"
import { SubmissionReviewForm } from "./components/submission-review-form"
import { useRef, useState, useEffect, useCallback } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { getAgeRangeFromCategory, getCategoryLabels } from "@/lib/utils"

export default function SubmissionDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [submission, setSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    submission_id: '',
    paid_amount: 0,
    payment_date: new Date().toISOString().slice(0, 16),
    payment_method: 'razorpay',
    payment_status: 'paid',
    razorpay_order_id: '',
    razorpay_payment_id: '',
    razorpay_signature: '',
    tournament_id: '',
    user_id: ''
  })
  const receiptRef = useRef<HTMLDivElement>(null)

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getSubmissionById(params.id as string)
      setSubmission(data)
    } catch (error) {
      console.error("Failed to fetch submission:", error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  const handleSubmissionUpdate = useCallback((updatedScore: number, status: string) => {
    setSubmission((prev: any) => prev ? {
      ...prev,
      score: updatedScore,
      status: status,
      reviewed_at: new Date().toISOString()
    } : null)
  }, [])

  const openPaymentDialog = useCallback(() => {
    alert('Are you sure, you want to create a payment record?');
    if (!submission) return
    
    setPaymentForm({
      submission_id: submission.id,
      paid_amount: 0,
      payment_date: new Date().toISOString().slice(0, 16),
      payment_method: 'razorpay',
      payment_status: 'paid',
      razorpay_order_id: '',
      razorpay_payment_id: '',
      razorpay_signature: 'manual',
      tournament_id: submission.tournament_id,
      user_id: submission.user_id
    })
    setPaymentDialogOpen(true)
  }, [submission])

  const handlePaymentSubmit = async () => {
    if (!submission) return

    setIsSubmittingPayment(true)
    try {
      const result = await createPaymentRecord(paymentForm)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
        setPaymentDialogOpen(false)
        // Refresh submission data
        fetchSubmission()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating payment:', error)
      toast({
        title: "Error",
        description: "Failed to create payment record",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingPayment(false)
    }
  }

  useEffect(() => {
    fetchSubmission()
  }, [params.id])

  const handleDownloadReceipt = async () => {
    if (!submission) return

    try {
      // Create a custom HTML template for the PDF
      const pdfContainer = document.createElement('div')
      pdfContainer.style.position = 'absolute'
      pdfContainer.style.left = '-9999px'
      pdfContainer.style.top = '0'
      pdfContainer.style.width = '1000px'
      pdfContainer.style.backgroundColor = 'white'
      pdfContainer.style.padding = '40px'
      pdfContainer.style.fontFamily = 'Arial, sans-serif'
      pdfContainer.style.fontSize = '14px'
      pdfContainer.style.lineHeight = '1.6'
      pdfContainer.style.color = '#333'
      
      // Create the PDF content
              pdfContainer.innerHTML = `
          <div style="text-align: center; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 15px;">
            <img src="/drawing111.png" alt="Artistrynu Logo" style="width: 60px; height: 60px;" />
            <h1 style="font-size: 24px; font-weight: bold; margin: 0; color: #1a1a1a;">Review Form</h1>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0; color: #2a2a2a;">
              ${submission.tournament?.title || 'Tournament Submission'}
            </h2>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #2a2a2a;">Tournament Details</h3>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                <div><strong>Age Group:</strong> ${getAgeRangeFromCategory(submission.tournament?.age_category) || 'N/A'}</div>
                <div><strong>Category:</strong> ${getCategoryLabels(submission.tournament?.categories) || 'N/A'}</div>
                <div><strong>Deadline:</strong> ${submission.tournament?.submission_deadline ? new Date(submission.tournament.submission_deadline).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Status:</strong> 
                  <span style="
                    padding: 1px 6px; 
                    border-radius: 3px; 
                    font-size: 11px; 
                    font-weight: bold;
                    ${submission.status === 'approved' ? 'background: #d4edda; color: #155724;' : 
                      submission.status === 'pending' ? 'background: #fff3cd; color: #856404;' : 
                      'background: #f8d7da; color: #721c24;'}
                  ">${submission.status || 'pending'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            ${submission.files?.length > 0 && submission.files[0].file_url ? `
              <div style="text-align: center;">
                <img 
                  src="${submission.files[0].file_url}" 
                  alt="Submission" 
                  style="max-width: 100%; max-height: 50vh; width: auto; height: auto; object-fit: contain; border: 2px solid #ddd; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"
                />
              </div>
            ` : '<p style="text-align: center; color: #666; font-size: 12px;">No image available</p>'}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 8px 0; color: #2a2a2a;">Submission Details</h3>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
                <div><strong>Applicant:</strong> ${submission.applicant_name || 'N/A'}</div>
                <div><strong>Date of Birth:</strong> ${submission.date_of_birth || 'N/A'}</div>
                <div><strong>Submitted:</strong> ${submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Source:</strong> ${submission.source || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 15px 0; color: #2a2a2a; border-bottom: 1px solid #e9ecef; padding-bottom: 8px;">
              Evaluation
            </h3>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
              <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <label style="font-weight: bold; font-size: 12px; min-width: 80px;">Score:</label>
                <div style="
                  flex: 1;
                  padding: 6px 10px; 
                  background: white; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  min-height: 25px;
                  font-size: 12px;
                "></div>
              </div>
              
              <div style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
                <label style="font-weight: bold; font-size: 12px; min-width: 80px; margin-top: 6px;">Review Notes:</label>
                <div style="
                  flex: 1;
                  padding: 8px; 
                  background: white; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  min-height: 50px;
                  white-space: pre-wrap;
                  font-size: 12px;
                "></div>
              </div>
              
              <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <label style="font-weight: bold; font-size: 12px; min-width: 80px;">Reviewer:</label>
                <div style="
                  flex: 1;
                  padding: 6px 10px; 
                  background: white; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  min-height: 25px;
                  font-size: 12px;
                "></div>
              </div>
              
              ${submission.reviewed_at ? `
                <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                  <label style="font-weight: bold; font-size: 12px; min-width: 80px;">Reviewed On:</label>
                  <div style="
                    flex: 1;
                    padding: 6px 10px; 
                    background: white; 
                    border: 1px solid #ddd; 
                    border-radius: 4px; 
                    min-height: 25px;
                    font-size: 12px;
                  ">${new Date(submission.reviewed_at).toLocaleDateString()}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `
      
      document.body.appendChild(pdfContainer)

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1000,
        height: pdfContainer.scrollHeight,
        logging: false,
      })
      
      // Clean up
      document.body.removeChild(pdfContainer)
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const imgWidth = pageWidth - (2 * margin)
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // Calculate how many pages we need
      const pagesNeeded = Math.ceil(imgHeight / (pageHeight - (2 * margin)))
      
      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        const sourceY = i * (canvas.height / pagesNeeded)
        const sourceHeight = canvas.height / pagesNeeded
        
        const destY = margin
        const destHeight = pageHeight - (2 * margin)
        
        pdf.addImage(
          imgData, 
          'JPEG', 
          margin, 
          destY, 
          imgWidth, 
          destHeight
        )
      }

      pdf.save(`submission-review-${submission.submission_number || params.id}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!submission) {
    return notFound()
  }

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-12" ref={receiptRef}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <Link 
            href={submission?.tournament_id 
              ? `/admin/dashboard/submissions?tournamentId=${submission.tournament_id}&${searchParams.toString()}`
              : `/admin/dashboard/submissions?${searchParams.toString()}`
            }
          >
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Submission Review</h1>
            <p className="text-muted-foreground">
              {submission.tournament?.title || "Tournament submission"}
            </p>
          </div>
        </div>
        <Button onClick={handleDownloadReceipt} className="gap-2 w-full md:w-auto" data-pdf-exclude>
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Submission Image Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative aspect-[4/3] w-full rounded-lg bg-muted overflow-hidden">
                  {submission.files?.length > 0 && submission.files[0].file_url ? (
                    <>
                      <Image
                        src={submission.files[0].file_url}
                        alt="Submission preview"
                        fill
                        className="object-contain"
                        priority
                      />
                      <div className="absolute bottom-4 right-4" data-pdf-exclude>
                        <DownloadButton url={submission.files[0].file_url} fileName={submission.files[0].file_name} />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No files available</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    Submission Notes
                  </h3>
                  <p className="text-muted-foreground">
                    {submission.description || "No additional notes provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      Submitted by
                    </Label>
                    <p className="font-medium">{submission.applicant_name || "N/A"}</p>
                  </div>
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{submission.user?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="font-medium">
                      {submission.phone_number || "N/A"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Cake className="h-4 w-4" />
                      Date of Birth
                    </Label>
                    <p className="font-medium">
                      {submission.date_of_birth || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Submitted on
                    </Label>
                    <p className="font-medium">
                      {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      Current Status
                    </Label>
                    <Badge 
                      variant={
                        submission.status === "approved" 
                          ? "default" 
                          : submission.status === "pending" 
                            ? "secondary" 
                            : "destructive"
                      }
                      className="capitalize"
                    >
                      {submission.status || "pending"}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Ear className="h-4 w-4" />
                      Heard from
                    </Label>
                    <p className="font-medium">
                      {submission.source || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Review Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Evaluation
              </CardTitle>
              <CardDescription>
                Score and review this submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionReviewForm 
                submissionId={params.id as string} 
                initialScore={submission.score}
                paid={submission.payment_status === 'paid'} 
                onUpdate={handleSubmissionUpdate}
              />
            </CardContent>
          </Card>

          {/* Tournament Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Tournament Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Tournament</Label>
                  <p className="font-medium">
                    {submission.tournament?.title || "N/A"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Payment Status</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge 
                      variant={submission.payment_status === "paid" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {submission.payment_status || "N/A"}
                    </Badge>
                    {submission.payment_status !== "paid" && (
                      <Button
                        size="sm"
                        onClick={openPaymentDialog}
                        className="h-6 px-2 text-xs"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Update Payment
                      </Button>
                    )}
                  </div>
                </div>
                
                {submission.tournament?.submission_deadline && (
                  <div>
                    <Label className="text-muted-foreground">Deadline</Label>
                    <p className="font-medium">
                      {new Date(submission.tournament.submission_deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link 
                href={`/admin/dashboard/tournaments/${submission.tournament_id}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  View Tournament
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
              <CardDescription>
                Previous evaluations for this submission
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submission.score ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-medium">{submission.score.toFixed(2)}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge 
                      variant={submission.status === "approved" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {submission.status}
                    </Badge>
                  </div>
                  {submission.reviewed_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reviewed on</span>
                      <span className="font-medium">
                        {new Date(submission.reviewed_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No review history yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Payment Record</DialogTitle>
            <DialogDescription>
              Create a payment record for {submission?.applicant_name} - {submission?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paid_amount">Paid Amount (₹)</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  value={paymentForm.paid_amount}
                  onChange={(e) => setPaymentForm({
                    ...paymentForm,
                    paid_amount: parseFloat(e.target.value) || 0
                  })}
                  placeholder="1299.00"
                />
              </div>
              <div>
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="datetime-local"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({
                    ...paymentForm,
                    payment_date: e.target.value
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={paymentForm.payment_method}
                onValueChange={(value) => setPaymentForm({
                  ...paymentForm,
                  payment_method: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select
                value={paymentForm.payment_status}
                onValueChange={(value) => setPaymentForm({
                  ...paymentForm,
                  payment_status: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="razorpay_order_id">Razorpay Order ID</Label>
              <Input
                id="razorpay_order_id"
                value={paymentForm.razorpay_order_id}
                onChange={(e) => setPaymentForm({
                  ...paymentForm,
                  razorpay_order_id: e.target.value
                })}
                placeholder="order_xyz123"
              />
            </div>

            <div>
              <Label htmlFor="razorpay_payment_id">Razorpay Payment ID</Label>
              <Input
                id="razorpay_payment_id"
                value={paymentForm.razorpay_payment_id}
                onChange={(e) => setPaymentForm({
                  ...paymentForm,
                  razorpay_payment_id: e.target.value
                })}
                placeholder="pay_xyz123"
              />
            </div>

            <div>
              <Label htmlFor="razorpay_signature">Razorpay Signature</Label>
              <Input
                id="razorpay_signature"
                value={paymentForm.razorpay_signature}
                onChange={(e) => setPaymentForm({
                  ...paymentForm,
                  razorpay_signature: e.target.value
                })}
                placeholder="signature_xyz123"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setPaymentDialogOpen(false)}
                disabled={isSubmittingPayment}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={isSubmittingPayment || !paymentForm.paid_amount || !paymentForm.razorpay_payment_id}
              >
                {isSubmittingPayment ? 'Creating...' : 'Create Payment Record'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}