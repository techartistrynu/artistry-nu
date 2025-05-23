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
import { Calendar, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
export default async function TournamentsPage() {
  let tournaments: any[] = [];
  const toISOString = (timestamp: any) => {
    if (!timestamp) return null
    if (timestamp.toDate) return timestamp.toDate().toISOString()
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString()
    if (typeof timestamp === 'string') return timestamp
    return null
  }
  
  try {
    const snapshot = await db
      .collection("tournaments")
      .orderBy("registration_start", "desc")
      .get();

    tournaments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching tournaments:", error);
  }

  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Competition Enrolment</h1>
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
                    <CardDescription className="mt-1">{tournament.category}</CardDescription>
                  </div>
                  <Badge className="capitalize">{tournament.status}</Badge>
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
                      {new Date(toISOString(tournament.registration_start ?? "")).toLocaleDateString()} -{" "}
                      {new Date(toISOString(tournament.registration_end ?? "")).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Submission Deadline:{" "}
                      {new Date(toISOString(tournament.submission_deadline ?? "")).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
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
            <p className="text-muted-foreground">No tournaments available at the moment. Please check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
