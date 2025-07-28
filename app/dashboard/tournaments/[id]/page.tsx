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
import { getTournamentStatusText } from "@/lib/utils"

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
            <CardTitle>Competition Not Found</CardTitle>
            <CardDescription>The competition you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/tournaments">
              <Button>Back to Competitions</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const existingSubmission = null;

  // const existingSubmission = await getUserSubmissionForTournament(userId, paramId)

  const isRegistrationOpen =
    tournament.status === "open" &&
    new Date(tournament.registration_start.toDate?.() ?? tournament.registration_start) <= new Date() &&
    new Date(tournament.registration_end.toDate?.() ?? tournament.registration_end) >= new Date()

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{tournament.title}</CardTitle>
          <CardDescription>Competition Details</CardDescription>
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
            
            {/* Prize Section */}
            {(tournament.first_prize || tournament.second_prize || tournament.third_prize || tournament.mention_prize) && (
              <div className="space-y-2">
                <h3 className="font-medium">Prizes</h3>
                <div className="space-y-1">
                  {tournament.first_prize && (
                    <p className="text-sm text-muted-foreground">1st Prize: ₹{tournament.first_prize}</p>
                  )}
                  {tournament.second_prize && (
                    <p className="text-sm text-muted-foreground">2nd Prize: ₹{tournament.second_prize}</p>
                  )}
                  {tournament.third_prize && (
                    <p className="text-sm text-muted-foreground">3rd Prize: ₹{tournament.third_prize}</p>
                  )}
                  {tournament.mention_prize && (
                    <p className="text-sm text-muted-foreground">3rd Prize: ₹{tournament.mention_prize}</p>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-medium">Status</h3>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tournament.status === "open"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : tournament.status === "coming_soon" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" 
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {getTournamentStatusText(tournament.status)}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Submission Guidelines</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>All submissions must be original work</li>
              <li>Accepted file formats: JPG, PNG</li>
              <li>Maximum file size: 5MB</li>
              <li>One submission per participant</li>
            </ul>
          </div>
          <div className="space-y-2 pt-4">
              <h3 className="text-lg font-medium">Benefits for Participants</h3>
              <ul className="list-disc pl-5 text-muted-foreground">
                <li><strong>Exposure:</strong> Winning artworks will be featured on Artistrynu's website, social media, and in promotional materials.</li>
                <li><strong>Professional Development:</strong> Free vouchers for lectures and seminars provide access to industry insights and networking opportunities.</li>
                <li><strong>Recognition:</strong> Cash prizes, gift hampers, mementos, and shawls (for Categories 3 and 4) enhance artists' portfolios and credibility.</li>
                <li><strong>Exhibition Opportunity:</strong> Senior artists (Category 4) gain the chance to showcase their work in a prestigious group exhibition.</li>
              </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row md:justify-between gap-2">
          <Link href="/dashboard/tournaments">
            <Button variant="outline">Back to Competition Enrollment</Button>
          </Link>

          {existingSubmission ? (
            // <Link href={`/dashboard/submissions/${existingSubmission?.id}`}>
              <Button>View Your Submission</Button>
            // </Link>
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
