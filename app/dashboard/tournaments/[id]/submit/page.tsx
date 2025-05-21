"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Loader2, Link } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { submitArtwork, updatePaymentDetails } from "@/app/actions/create-submission"
import { getTournamentById, getUserSubmissionForTournament } from "@/app/actions/tournaments"

export default function SubmitToTournamentPage() {
  const router = useRouter()
  const params = useParams()
  const tournamentId = params?.id as string
  const { data: session } = useSession()
  const userId = session?.user?.id 
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [applicantName, setApplicantName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [tournament, setTournament] = useState<any>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId || !userId) {
        router.push("/dashboard")
        return
      }


      const tournamentData = await getTournamentById(tournamentId as string)
      const existingSubmission = await getUserSubmissionForTournament(userId, tournamentId)
      setTournament(tournamentData)
      setExistingSubmission(existingSubmission)
    }

    fetchData()
  }, [tournamentId, router])

  
  if (!tournament) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Tournament Not Found</CardTitle>
            <CardDescription>The tournament you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/tournaments">
              <Button>Back to Tournaments</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (existingSubmission) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Submission Already Exists</CardTitle>
            <CardDescription>You have already submitted an artwork for this tournament. Please check your submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <Link href={`/dashboard/submissions/${existingSubmission.id}`}> */}
              <Button variant="outline" onClick={() => router.push(`/dashboard/submissions/${existingSubmission.id}`)}>Back to Submissions</Button>
            {/* </Link> */}
          </CardContent>
        </Card>
      </div>
    )
  }

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const triggerPayment = async (submissionId: string) => {
    const res = await fetch("/api/payment/order", {
      method: "POST",
      body: JSON.stringify({ amount: tournament?.entry_fee || 1000, submissionId }), // ₹100
    })

    const data = await res.json()
    const isScriptLoaded = await loadRazorpay()

    if (!isScriptLoaded || !data.id) {
      toast({
        title: "Payment failed",
        description: "Razorpay script load or order creation failed.",
        variant: "destructive",
      })
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: data.currency,
      name: tournament?.title,
      description: "Entry Fee",
      order_id: data.id,
      handler: async function (response: any) {
        toast({ title: "Payment Successful", description: "Don't refresh the page, it will redirect you to the success page." })
        const result = await updatePaymentDetails({
          submissionId,
          paymentData: {
            paid_amount: data.amount,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          },
          tournamentId: tournamentId,
          userId: session?.user?.id ?? "",
        })
      
        if (!result.success) {
          toast({
            title: "Payment Recorded Failed",
            description: result.error,
            variant: "destructive",
          })
          return
        }
      
        toast({ title: "Payment Successful", description: "Thank you!" })
        router.push(`/dashboard/tournaments/${tournamentId}/payment/success?submissionId=${submissionId}`)
      },
      prefill: {
        name: applicantName,
        email: session?.user?.email ?? "",
      },
      theme: {
        color: "#6366f1",
      },
    }

    const razorpay = new (window as any).Razorpay(options)
    razorpay.open()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!files || !dateOfBirth) {
      toast({
        title: "Missing Fields",
        description: "Please upload files and select your date of birth.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("applicantName", applicantName)
      formData.append("dateOfBirth", dateOfBirth.toISOString())
      formData.append("phoneNumber", phoneNumber)
      formData.append("tournamentId", tournamentId)
      formData.append("userId", session?.user?.id ?? "")
      Array.from(files).forEach((file) => formData.append("files", file))

      const result = await submitArtwork(formData)

      if (!result) {
        toast({
          title: "Submission Failed",
          description: "Failed to submit artwork",
          variant: "destructive",
        })
        return
      }

      toast({ title: "Submission Received", description: "Proceeding to payment..." })
      await triggerPayment(result.submissionId)
    } catch (error) {
      console.error(error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Artwork</CardTitle>
          <CardDescription>Complete this form to submit your artwork to the tournament.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Applicant Name*</Label>
                <Input
                  id="applicantName"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date"
                onChange={(e) => setDateOfBirth(new Date(e.target.value))}
                 required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="[0-9]{10}"
                  placeholder="10-digit number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title of Your Work*</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Upload Files*</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                <Input
                  id="files"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFiles(e.target.files)}
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.svg"
                  required
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("files")?.click()}>
                  Select Files
                </Button>
              </div>
              {files && (
                <ul className="text-sm mt-2 text-gray-500 list-disc list-inside">
                  {Array.from(files).map((file, idx) => (
                    <li key={idx}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting || isUploading} className="w-full">
              {isUploading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading Files..." : "Submitting..."}
                </>
              ) : (
                `Submit and Pay ₹${tournament?.entry_fee}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
