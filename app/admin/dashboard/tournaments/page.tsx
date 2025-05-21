"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { deleteTournament, getAllTournaments } from "@/app/actions/tournaments"

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    setIsLoading(true)
    try {
      const data = await getAllTournaments();
      setTournaments(data || [])
    } catch (error) {
      console.error("Error fetching tournaments:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tournaments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (tournament: any) => {
    const now = new Date()
    // Parse ISO strings to Date objects
    const registrationStart = tournament.registration_start ? new Date(tournament.registration_start) : null
    const registrationEnd = tournament.registration_end ? new Date(tournament.registration_end) : null
    const submissionEnd = tournament.submission_deadline ? new Date(tournament.submission_deadline) : null

    if (!registrationStart || !registrationEnd || !submissionEnd) {
      return <Badge className="bg-gray-500">Invalid Dates</Badge>
    }

    if (now < registrationStart) {
      return <Badge className="bg-gray-500">Coming Soon</Badge>
    } else if (now >= registrationStart && now <= registrationEnd) {
      return <Badge className="bg-green-500">Open</Badge>
    } else if (now > registrationEnd && now <= submissionEnd) {
      return <Badge className="bg-yellow-500">Submission Period</Badge>
    } else {
      return <Badge className="bg-red-500">Closed</Badge>
    }
  }

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) {
      return
    }

    try {
      await deleteTournament(id)

      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      })

      // Refresh the tournaments list
      fetchTournaments()
    } catch (error) {
      console.error("Error deleting tournament:", error)
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    try {
      // Debug log to see what we're receiving
      console.log('Formatting date:', dateString)
      
      // Parse the date string
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return 'Invalid Date'
      }
      
      return format(date, "MMM d, yyyy")
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Invalid Date'
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tournaments</h2>
        <Link href="/admin/dashboard/tournaments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Tournament
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading tournaments...</p>
        ) : tournaments.length === 0 ? (
          <p>No tournaments found.</p>
        ) : (
          tournaments.map((tournament) => (
            <Card key={tournament.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>{tournament.title}</CardTitle>
                  <CardDescription>{tournament.description}</CardDescription>
                </div>
                <div className="flex space-x-2">{getStatusBadge(tournament)}</div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Registration Period</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tournament.registration_start)} - {formatDate(tournament.registration_end)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Submission Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tournament.submission_deadline)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Entry Fee</p>
                      <p className="text-sm text-muted-foreground">₹{tournament.entry_fee}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">{tournament.category}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Link href={`/admin/dashboard/tournaments/${tournament.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/admin/dashboard/tournaments/new?tournamentId=${tournament.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteTournament(tournament.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
