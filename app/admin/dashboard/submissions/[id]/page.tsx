"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Award, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"

export default function AdminSubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()
  const [submission, setSubmission] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [score, setScore] = useState<number>(0)
  const [feedback, setFeedback] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchSubmission(params.id as string)
    }
  }, [params.id])

  const fetchSubmission = async (id: string) => {
    setIsLoading(true)
    try {
      // Fetch submission details
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select(`
          *,
          users:user_id (name, email),
          tournaments:tournament_id (title)
        `)
        .eq("id", id)
        .single()

      if (submissionError) {
        throw submissionError
      }

      setSubmission(submissionData)
      setScore(submissionData.score || 0)
      setFeedback(submissionData.feedback || "")

      // Fetch submission files
      const { data: filesData, error: filesError } = await supabase
        .from("submission_files")
        .select("*")
        .eq("submission_id", id)

      if (filesError) {
        throw filesError
      }

      setFiles(filesData || [])
    } catch (error) {
      console.error("Error fetching submission:", error)
      toast({
        title: "Error",
        description: "Failed to fetch submission details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveScore = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          score,
          feedback,
          status: "scored",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Submission scored successfully",
      })
    } catch (error) {
      console.error("Error saving score:", error)
      toast({
        title: "Error",
        description: "Failed to save score",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateCertificate = async () => {
    try {
      // Check if certificate already exists
      const { data: existingCert, error: certCheckError } = await supabase
        .from("certificates")
        .select("*")
        .eq("submission_id", params.id)
        .single()

      if (existingCert) {
        toast({
          title: "Certificate Exists",
          description: "A certificate has already been generated for this submission",
        })
        return
      }

      // Generate a unique certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`

      // Create certificate record
      const { error: createError } = await supabase
        .from("certificates")
        .insert({
          user_id: submission.user_id,
          submission_id: submission.id,
          tournament_id: submission.tournament_id,
          certificate_number: certificateNumber,
          issue_date: new Date().toISOString(),
          status: "issued",
          file_path: null, // Will be updated when actual file is generated
        })

      if (createError) {
        throw createError
      }

      toast({
        title: "Success",
        description: "Certificate generated successfully",
      })

      // Redirect to certificates page
      router.push("/admin/certificates")
    } catch (error) {
      console.error("Error generating certificate:", error)
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-500"
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "scored":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading submission details...</div>
  }

  if (!submission) {
    return <div className="p-8">Submission not found</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Submission Details</h2>
        </div>
        <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{submission.title}</CardTitle>
          <CardDescription>
            By {submission.users?.name || "Unknown"} for {submission.tournaments?.title || "Unknown Tournament"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-muted-foreground">{submission.description || "No description provided"}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Submission Files</h3>
            {files.length === 0 ? (
              <p className="text-muted-foreground">No files attached</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-muted-foreground">{file.file_type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Evaluation</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <span>{score}/100</span>
                </div>
                <Slider
                  id="score"
                  min={0}
                  max={100}
                  step={1}
                  value={[score]}
                  onValueChange={(value) => setScore(value[0])}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Provide feedback for the submission..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button onClick={handleSaveScore} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Evaluation"}
                </Button>
                {submission.status === "scored" && (
                  <Button onClick={handleGenerateCertificate}>
                    <Award className="mr-2 h-4 w-4" />
                    Generate Certificate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
