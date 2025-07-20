import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BadgeIndianRupee } from "lucide-react"
import Link from "next/link"
import { getAllTournamentForUser, getAllTournaments } from "@/app/actions/tournaments"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardTournamentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const fetchedTournaments: any = await getAllTournaments()
  let tournaments: any = []
  if(fetchedTournaments) {
    tournaments = fetchedTournaments.filter((tournament: any) => tournament.status !== "closed")
  }
  

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Competition Enrollment</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments && tournaments.length > 0 ? (
          tournaments.map((tournament: any) => (
            <Card key={tournament.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{tournament.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {Array.isArray(tournament.categories) ? tournament.categories.join(', ') : tournament.category}
                      {tournament.ageCategory && (
                        <span className="ml-2 text-xs text-muted-foreground">(Age: {tournament.ageCategory})</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className={`capitalize ${tournament.status === "open" ? "bg-green-500 hover:bg-green-600" : tournament.status === "coming_soon" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-500 hover:bg-red-600"}`}>{tournament.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="aspect-video overflow-hidden rounded-md bg-muted mb-4">
                  <img
                    src={tournament.image_url}
                    alt={tournament.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-muted-foreground line-clamp-3">{tournament.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Registration: {new Date(tournament.registration_start).toLocaleDateString()} -{" "}
                      {new Date(tournament.registration_end).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Submission Deadline: {new Date(tournament.submission_deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BadgeIndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Entry Fee: ₹{tournament.entry_fee}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/dashboard/tournaments/${tournament.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No Competition Enrollment available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  )
}
