import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getSubmissionById, updateSubmissionScore } from "@/app/actions/submissions"
import { notFound } from "next/navigation"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Star, User, Mail, Award, FileText, Calendar, CheckCircle2, XCircle, Phone, Cake, Ear } from "lucide-react"
import Link from "next/link"
import { DownloadButton } from "./components/download-button"
import { SubmissionReviewForm } from "./components/submission-review-form"

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const submission = await getSubmissionById(id)
  
  if (!submission) {
    return notFound()
  }

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard/submissions">
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
                      <div className="absolute bottom-4 right-4">
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
              <SubmissionReviewForm submissionId={id} initialScore={submission.score} />
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
                  <div className="mt-1">
                    <Badge 
                      variant={submission.payment_status === "paid" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {submission.payment_status || "N/A"}
                    </Badge>
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
    </div>
  )
}