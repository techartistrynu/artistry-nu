"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye, Award } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { getAllSubmissions } from "@/app/actions/submissions"

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadSubmissions = async () => {
      setIsLoading(true)
      try {
        const data = await getAllSubmissions()
        setSubmissions(data)
      } catch (error) {
        console.error("Error fetching submissions:", error)
        toast({
          title: "Error",
          description: "Failed to fetch submissions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSubmissions()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "pending_review":
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p>No submissions found.</p>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{submission.title}</CardTitle>
                  <CardDescription>
                    By {submission.users?.name || "Unknown"} for {submission.tournaments?.title || "Unknown Tournament"}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(submission.status)}>{submission.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{submission.description || "No description"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.created_at
                          ? format(new Date(submission.created_at), "MMM d, yyyy")
                          : "Unknown"}
                      </p>
                    </div>
                    {submission.score !== undefined && (
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Score</p>
                        <p className="text-sm text-muted-foreground">{submission.score}/100</p>
                      </div>
                    )}
                    {submission.rank !== undefined && (
                      <div className="flex justify-between">
                        <p className="text-sm font-medium">Rank</p>
                        <p className="text-sm text-muted-foreground">#{submission.rank}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Link href={`/admin/submissions/${submission.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                  {submission.status === "scored" && (
                    <Link href={`/admin/certificates/generate/${submission.id}`}>
                      <Button size="sm">
                        <Award className="mr-2 h-4 w-4" />
                        Generate Certificate
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
