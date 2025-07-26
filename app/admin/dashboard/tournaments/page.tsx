"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit, Trash, Eye, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { closeTournament, deleteTournament, getAllTournaments } from "@/app/actions/tournaments"
import { getTournamentStatusText } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    setIsLoading(true)
    try {
      const data = await getAllTournaments()
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
    const registrationStart = tournament.registration_start ? new Date(tournament.registration_start) : null
    const registrationEnd = tournament.registration_end ? new Date(tournament.registration_end) : null
    const submissionEnd = tournament.submission_deadline ? new Date(tournament.submission_deadline) : null

    if (!registrationStart || !registrationEnd || !submissionEnd) {
      return <Badge variant="secondary">Invalid Dates</Badge>
    }

    if (now < registrationStart) {
      return <Badge variant="secondary">{getTournamentStatusText("coming_soon")}</Badge>
    } else if (now >= registrationStart && now <= registrationEnd) {
      return <Badge className="bg-green-500 hover:bg-green-600">{getTournamentStatusText("open")}</Badge>
    } else if (now > registrationEnd && now <= submissionEnd) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{getTournamentStatusText("submission_period")}</Badge>
    } else {
      return <Badge variant="destructive">{getTournamentStatusText("closed")}</Badge>
    }
  }

    const handleDeleteTournament = async (id: string) => {
      if (!confirm("Are you sure you want to delete this tournament?")) return

      try {
        await deleteTournament(id)
        toast({
          title: "Success",
          description: "Tournament deleted successfully",
        })
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

    const handleCloseTournament = async (id: string) => {
      if (!confirm("Are you sure you want to close this tournament?")) return

      try {
        await closeTournament(id)
        toast({
          title: "Success",
          description: "Tournament closed successfully",
        })
      } catch (error) {
        console.error("Error closing tournament:", error)
        toast({
          title: "Error",
          description: "Failed to close tournament",
          variant: "destructive",
        })
      } finally {
        fetchTournaments()
      }
    }
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? 'Invalid Date' : format(date, "PP")
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return 'Invalid Date'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competition Enrollment</h1>
          <p className="text-muted-foreground">Manage all Competition Enrollment in your system</p>
        </div>
        <Link href="/admin/dashboard/tournaments/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Competition Enrollment
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          {/* <CardTitle>Tournament List</CardTitle> */}
          <CardDescription>All active and upcoming Competition Enrollment</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : tournaments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No Competition Enrollment found</p>
              <Link href="/admin/dashboard/tournaments/new">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first Competition
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Registration</TableHead>
                  <TableHead className="hidden md:table-cell">Submission</TableHead>
                  <TableHead className="hidden md:table-cell">Entry Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id}>
                    <TableCell>
                      <div className="font-medium">{tournament.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {tournament.description}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(tournament)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(tournament.registration_start)} - {formatDate(tournament.registration_end)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(tournament.submission_deadline)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ₹{tournament.entry_fee}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/tournaments/${tournament.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/tournaments/new?tournamentId=${tournament.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleCloseTournament(tournament.id)}
                          >
                            <Lock className="mr-2 h-4 w-4" />
                            Close
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteTournament(tournament.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}