"use client"
import { db } from "@/lib/firebase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BadgeIndianRupee } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getAllTournaments } from "../actions/tournaments";
import { toast } from "sonner";

export default function TournamentsPage() {
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tournament details
        const tournamentData = await getAllTournaments()

        if (!tournamentData) {
           new Error("Tournament not found")
        }

        setTournaments(tournamentData.filter((tournament: any) => tournament.status !== "closed"))
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load tournament details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  if (loading) {
    return (
      <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  
  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Competition Enrollment</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Showcase your talent and compete with other creative minds
          </p>
        </div>
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
                    src={tournament.image_url || "/placeholder.svg?height=400&width=600"}
                    alt={tournament.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-muted-foreground line-clamp-3">{tournament.description}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Registration:{" "}
                      {new Date(tournament.registration_start ?? "").toLocaleDateString()} -{" "}
                      {new Date(tournament.registration_end ?? "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Submission Deadline:{" "}
                      {new Date(tournament.submission_deadline ?? "").toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BadgeIndianRupee className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Entry Fee: ₹{tournament.entry_fee}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/tournaments/${tournament.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No competitions available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
