"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Award, BadgeIndianRupee } from "lucide-react"
import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getTournamentById } from "@/app/actions/tournaments"
import { getAgeRangeFromCategory, getCategoryLabels, getTournamentStatusText } from "@/lib/utils"

export default function TournamentPage() {
  const params = useParams()
  const tournamentId = params.id as string
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tournament details
        const tournamentData = await getTournamentById(tournamentId)

        if (!tournamentData) {
           new Error("Tournament not found")
        }

        setTournament(tournamentData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load tournament details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tournamentId, session])


  if (loading) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleRegister = async () => {
    if (!session) {
      // Redirect to Google login with callback to registration
      await signIn("google", {
        callbackUrl: `/dashboard/tournaments/${tournamentId}/submit`
      })
      return
    }
  }

  const isRegistrationOpen = tournament?.status === "open" && 
    new Date(tournament.registration_start) <= new Date() && 
    new Date(tournament.registration_end) >= new Date()

  if (loading) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Competition Not Found</CardTitle>
            <CardDescription>The competition you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/tournaments">
              <Button>Back to Competitions</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20">
      <div className="flex items-center space-x-2 mb-8">
        <Link href="/tournaments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{tournament.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competition Details</CardTitle>
              <CardDescription>Information about this competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                  <img
                    src={tournament.image_url || "/placeholder.svg"}
                    alt={tournament.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="text-muted-foreground">{tournament.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rules & Guidelines</CardTitle>
              <CardDescription>Please read carefully before submitting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Eligibility</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Open to all candidates</li>
                    <li>Participants must be {getAgeRangeFromCategory(tournament.age_category || "21-34")}</li>
                    <li>Previous winners are eligible to participate</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Submission Requirements</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>All submissions come under these categories: {getCategoryLabels(tournament.categories)} are only accepted.</li>
                    <li>All submissions must be original work created by the participant</li>
                    <li>Age verification will be conducted after the competition and submissions may be rejected if verification fails</li>
                    <li>Submissions must adhere to the competition theme</li>
                    <li>File formats: JPG, PNG (max 5MB per file)</li>
                    <li>Maximum of 5 entries per participant</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Judging Criteria</h3>
                  <ul className="list-disc pl-5 text-muted-foreground">
                    <li>Creativity and originality (30%)</li>
                    <li>Technical skill and execution (30%)</li>
                    <li>Adherence to theme (20%)</li>
                    <li>Overall presentation (20%)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competition Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`capitalize ${tournament.status === "open" ? "bg-green-500 hover:bg-green-600" : tournament.status === "coming_soon" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-red-500 hover:bg-red-600"}`}>
                    {getTournamentStatusText(tournament.status)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Registration Period:</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tournament.registration_start).toLocaleDateString()} -{" "}
                    {new Date(tournament.registration_end).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Submission Deadline:</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tournament.submission_deadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Entry Fee:</span>
                    </div>
                    <span className="text-sm font-medium">₹{tournament.entry_fee}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleRegister}
                disabled={!isRegistrationOpen}
              >
               Register Now
              </Button>
            </CardFooter>
          </Card>

          {(tournament.first_prize || tournament.second_prize || tournament.third_prize || tournament.mention_prize) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span>Prizes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {tournament.first_prize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">1st Place:</span>
                        <span className="text-sm">₹{tournament.first_prize} (Framed Certificate + Gift Hamper + Free Voucher)</span>
                      </div>
                    )}
                    {tournament.second_prize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">2nd Place:</span>
                        <span className="text-sm">₹{tournament.second_prize} (Framed Certificate + Gift Hamper + Free Voucher)</span>
                      </div>
                    )}
                    {tournament.third_prize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">3rd Place:</span>
                        <span className="text-sm">₹{tournament.third_prize} (Framed Certificate + Gift Hamper + Free Voucher)</span>
                      </div>
                    )}
                    {tournament.mention_prize && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Honorable Mentions:</span>
                        <span className="text-sm">₹{tournament.mention_prize}+ E-Certificate</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Registration Opens:</span>
                    <span className="text-sm">{new Date(tournament.registration_start).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Registration Closes:</span>
                    <span className="text-sm">{new Date(tournament.registration_end).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Submission Deadline:</span>
                    <span className="text-sm">{new Date(tournament.submission_deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Results Announcement:</span>
                    <span className="text-sm">
                      {(tournament?.certificate_generated_at && new Date(tournament?.certificate_generated_at).toLocaleDateString()) ?? new Date(
                        new Date(tournament.submission_deadline).getTime() + 14 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}