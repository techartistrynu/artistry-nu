import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { getSubmissionsByUserId } from "@/app/actions/submissions"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import SubmissionActions from "@/components/submission-action"
import { Eye, Search } from "lucide-react"

export default async function DashboardSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getServerSession(authOptions)
  const params = await searchParams
  const query = typeof params?.query === 'string' ? params.query : ""
  const activeTab = typeof params?.tab === 'string' ? params.tab : "all"

  if (!session?.user) {
    redirect("/login")
  }

  let submissions: any[] = await getSubmissionsByUserId(session.user.id)
  
  // Filter submissions based on search query
  if (query) {
    submissions = submissions.filter(submission => 
      submission.title.toLowerCase().includes(query.toLowerCase()) ||
      submission.tournaments?.title.toLowerCase().includes(query.toLowerCase())
    )
  }

  const draftSubmissions = submissions.filter((submission) => submission.status === "draft")
  const pendingSubmissions = submissions.filter((submission) => submission.status === "pending_review")
  const completedSubmissions = submissions.filter((submission) => submission.status === "completed")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">My Submissions</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search submissions..."
            className="w-full pl-10"
            defaultValue={query}
            name="query"
          />
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        {/* All Submissions Tab */}
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>View all your submissions across all tournaments</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left text-sm font-medium">Title</th>
                        <th className="p-4 text-left text-sm font-medium hidden sm:table-cell">Tournament</th>
                        <th className="p-4 text-left text-sm font-medium">Status</th>
                        <th className="p-4 text-left text-sm font-medium hidden md:table-cell">Submitted</th>
                        <th className="p-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-muted/50">
                          <td className="p-4 font-medium">{submission.title}</td>
                          <td className="p-4 hidden sm:table-cell">{submission.tournaments?.title || "N/A"}</td>
                          <td className="p-4">
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
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {submission.created_at
                              ? new Date(submission.created_at._seconds * 1000).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="p-4 text-right">
                            <SubmissionActions 
                              imageUrl={submission.submission_file?.file_url || 
                                `https://storage.googleapis.com/artistrynu-9e245.firebasestorage.app/${submission.submission_file?.file_path}` || "https://fastly.picsum.photos/id/128/536/354.jpg?hmac=pCYNKsYogBpCUxVsJbYskR7nC2a1X2Y5YVgCtUOlX8E"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">
                    {query ? "No matching submissions found" : "You haven't made any submissions yet"}
                  </p>
                  <Link href="/dashboard/tournaments">
                    <Button>Browse Tournaments</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Draft Submissions Tab */}
        <TabsContent value="draft" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Submissions</CardTitle>
              <CardDescription>Submissions you've started but not yet submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {draftSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left text-sm font-medium">Title</th>
                        <th className="p-4 text-left text-sm font-medium hidden sm:table-cell">Tournament</th>
                        <th className="p-4 text-left text-sm font-medium hidden md:table-cell">Created</th>
                        <th className="p-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {draftSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-muted/50">
                          <td className="p-4 font-medium">{submission.title}</td>
                          <td className="p-4 hidden sm:table-cell">{submission.tournaments?.title || "N/A"}</td>
                          <td className="p-4 hidden md:table-cell">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <Link href={`/dashboard/submissions/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                <span className="sr-only">View</span>
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">
                    {query ? "No matching drafts found" : "You don't have any draft submissions"}
                  </p>
                  <Link href="/dashboard/tournaments">
                    <Button>Browse Tournaments</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Submissions Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Submissions waiting for jury review</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left text-sm font-medium">Title</th>
                        <th className="p-4 text-left text-sm font-medium hidden sm:table-cell">Tournament</th>
                        <th className="p-4 text-left text-sm font-medium hidden md:table-cell">Submitted</th>
                        <th className="p-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-muted/50">
                          <td className="p-4 font-medium">{submission.title}</td>
                          <td className="p-4 hidden sm:table-cell">{submission.tournaments?.title || "N/A"}</td>
                          <td className="p-4 hidden md:table-cell">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <Link href={`/dashboard/submissions/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                <span className="sr-only">View</span>
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">
                    {query ? "No pending submissions found" : "You don't have any submissions pending review"}
                  </p>
                  <Link href="/dashboard/tournaments">
                    <Button>Browse Tournaments</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Submissions Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Submissions</CardTitle>
              <CardDescription>Submissions that have been reviewed and scored</CardDescription>
            </CardHeader>
            <CardContent>
              {completedSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left text-sm font-medium">Title</th>
                        <th className="p-4 text-left text-sm font-medium hidden sm:table-cell">Competition Enrollment</th>
                        <th className="p-4 text-left text-sm font-medium">Score</th>
                        <th className="p-4 text-left text-sm font-medium hidden md:table-cell">Rank</th>
                        <th className="p-4 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {completedSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-muted/50">
                          <td className="p-4 font-medium">{submission.title}</td>
                          <td className="p-4 hidden sm:table-cell">{submission.tournaments?.title || "N/A"}</td>
                          <td className="p-4">{submission.score ? `${submission.score}/100` : "N/A"}</td>
                          <td className="p-4 hidden md:table-cell">{submission.rank ? getOrdinal(submission.rank) : "N/A"}</td>
                          <td className="p-4 text-right">
                            <Link href={`/dashboard/submissions/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                <span className="sr-only">View</span>
                                <span className="hidden sm:inline">View</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">
                    {query ? "No completed submissions found" : "You don't have any completed submissions"}
                  </p>
                  <Link href="/dashboard/tournaments">
                    <Button>Browse Tournaments</Button>
                  </Link>
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
      return "Pending"
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