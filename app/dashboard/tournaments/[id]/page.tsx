// app/dashboard/tournaments/[id]/page.tsx
import { getTournamentById, getUserSubmissionForTournament } from "@/app/actions/tournaments"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function TournamentDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")
  const { id: paramId } = await params
  const userId = session.user.id
  const tournament : any = await getTournamentById(paramId)
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

  const existingSubmission = await getUserSubmissionForTournament(userId, paramId)

  const isRegistrationOpen =
    tournament.status === "open" &&
    new Date(tournament.registration_start.toDate?.() ?? tournament.registration_start) <= new Date() &&
    new Date(tournament.registration_end.toDate?.() ?? tournament.registration_end) >= new Date()

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{tournament.title}</CardTitle>
          <CardDescription>Tournament Details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert">
            <p>{tournament.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Registration Period</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(tournament.registration_start.toDate?.() ?? tournament.registration_start).toLocaleDateString()} to{" "}
                {new Date(tournament.registration_end.toDate?.() ?? tournament.registration_end).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Submission Deadline</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(tournament.submission_deadline.toDate?.() ?? tournament.submission_deadline).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Entry Fee</h3>
              <p className="text-sm text-muted-foreground">₹{tournament.entry_fee}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Status</h3>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tournament.status === "open"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {tournament.status === "open" ? "Open" : "Coming Soon"}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Submission Guidelines</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All submissions must be original work</li>
              <li>Accepted file formats: JPG, PNG, PDF</li>
              <li>Maximum file size: 10MB</li>
              <li>One submission per participant</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard/tournaments">
            <Button variant="outline">Back to Tournaments</Button>
          </Link>

          {existingSubmission ? (
            <Link href={`/dashboard/submissions/${existingSubmission.id}`}>
              <Button>View Your Submission</Button>
            </Link>
          ) : isRegistrationOpen ? (
            <Link href={`/dashboard/tournaments/${tournament.id}/submit`}>
              <Button>Submit Entry</Button>
            </Link>
          ) : (
            <Button disabled>Registration Closed</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
