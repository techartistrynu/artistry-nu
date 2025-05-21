import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSubmissionsByUserId } from "@/app/actions/submissions"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import SubmissionActions from "@/components/submission-action"
import { Eye } from "lucide-react"

export default async function DashboardSubmissionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const submissions: any[] = await getSubmissionsByUserId(session.user.id)
  console.log("submissions", submissions)
  const draftSubmissions = submissions.filter((submission) => submission.status === "draft")
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending_review")
  const completedSubmissions = submissions.filter((submission) => submission.status === "completed")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Submissions</h2>
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>View all your submissions across all tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 text-sm font-medium">
                    <div>Title</div>
                    <div>Tournament</div>
                    <div>Status</div>
                    <div>Submitted Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="grid grid-cols-5 items-center p-4">
                        <div className="font-medium">{submission.title}</div>
                        <div>{submission.tournaments?.title}</div>
                        <div>
                          <Badge
                            variant={
                              submission.status === "completed"
                                ? "default"
                                : submission.status === "pending_review"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {formatStatus(submission.status)}
                          </Badge>
                        </div>
                        <div>
                          {submission.created_at
                            ? new Date(submission.created_at._seconds * 1000).toLocaleString()
                            : "N/A"}
                        </div>
                        <div className="flex justify-end">
                          <SubmissionActions 
                            imageUrl={submission.submission_file?.file_url || 
                              `https://storage.googleapis.com/artistrynu-9e245.firebasestorage.app/${submission.submission_file?.file_path}` || "https://fastly.picsum.photos/id/128/536/354.jpg?hmac=pCYNKsYogBpCUxVsJbYskR7nC2a1X2Y5YVgCtUOlX8E"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">You haven't made any submissions yet.</p>
                  <Link href="/dashboard/tournaments">
                    <Button>Browse Tournaments</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Submissions</CardTitle>
              <CardDescription>Submissions you've started but not yet submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {draftSubmissions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-4 text-sm font-medium">
                    <div>Title</div>
                    <div>Tournament</div>
                    <div>Created Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {draftSubmissions.map((submission) => (
                      <div key={submission.id} className="grid grid-cols-4 items-center p-4">
                        <div className="font-medium">{submission.title}</div>
                        <div>{submission.tournaments?.title}</div>
                        <div>{new Date(submission.created_at).toLocaleDateString()}</div>
                        <div className="flex justify-end">
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">You don't have any draft submissions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Submissions waiting for jury review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 p-4 text-sm font-medium">
                    <div>Title</div>
                    <div>Tournament</div>
                    <div>Submitted Date</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {pendingSubmissions.map((submission) => (
                      <div key={submission.id} className="grid grid-cols-4 items-center p-4">
                        <div className="font-medium">{submission.title}</div>
                        <div>{submission.tournaments?.title}</div>
                        <div>{new Date(submission.created_at).toLocaleDateString()}</div>
                        <div className="flex justify-end">
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">You don't have any submissions pending review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Submissions</CardTitle>
              <CardDescription>Submissions that have been reviewed and scored</CardDescription>
            </CardHeader>
            <CardContent>
              {completedSubmissions.length > 0 ? (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 text-sm font-medium">
                    <div>Title</div>
                    <div>Tournament</div>
                    <div>Score</div>
                    <div>Rank</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {completedSubmissions.map((submission) => (
                      <div key={submission.id} className="grid grid-cols-5 items-center p-4">
                        <div className="font-medium">{submission.title}</div>
                        <div>{submission.tournaments?.title}</div>
                        <div>{submission.score ? `${submission.score}/100` : "N/A"}</div>
                        <div>{submission.rank ? getOrdinal(submission.rank) : "N/A"}</div>
                        <div className="flex justify-end">
                          <Link href={`/dashboard/submissions/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">You don't have any completed submissions.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatStatus(status: string): string {
  switch (status) {
    case "draft":
      return "Draft"
    case "pending_review":
      return "Pending Review"
    case "reviewed":
      return "Reviewed"
    case "completed":
      return "Completed"
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}