"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { db, storage } from "@/lib/firebase/client"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { ref, uploadBytes } from "firebase/storage"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function NewSubmissionPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tournamentId, setTournamentId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [tournaments, setTournaments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Watch auth state
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })

    return () => unsubscribe()
  }, [])

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const q = query(
          collection(db, "tournaments"),
          where("status", "==", "open"),
          orderBy("title", "asc")
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTournaments(data)
      } catch (error) {
        console.error("Error fetching tournaments:", error)
        toast({
          title: "Error",
          description: "Failed to load tournaments.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingTournaments(false)
      }
    }

    fetchTournaments()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) throw new Error("You must be logged in to submit")

      const submissionRef = await addDoc(collection(db, "submissions"), {
        title,
        description,
        tournament_id: tournamentId,
        user_id: user.uid,
        status: "pending",
        createdAt: Timestamp.now(),
      })

      const submissionId = submissionRef.id

      if (file) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${submissionId}.${fileExt}`
        const filePath = `submissions/${submissionId}/${fileName}`
        const fileRef = ref(storage, filePath)

        await uploadBytes(fileRef, file)

        await addDoc(collection(db, "submission_files"), {
          submission_id: submissionId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          uploadedAt: Timestamp.now(),
        })
      }

      toast({
        title: "Submission Created",
        description: "Your submission has been successfully uploaded.",
      })

      router.push(`/dashboard/tournaments/${tournamentId}/payment?submission_id=${submissionId}`)
    } catch (error: any) {
      console.error("Error creating submission:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create submission",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>New Submission</CardTitle>
          <CardDescription>Create a new submission for a tournament</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Submission Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament">Tournament</Label>
              {isLoadingTournaments ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tournaments.length > 0 ? (
                <Select value={tournamentId} onValueChange={setTournamentId} required>
                  <SelectTrigger><SelectValue placeholder="Select a tournament" /></SelectTrigger>
                  <SelectContent>
                    {tournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        {tournament.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded-md">
                  No open tournaments available
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                accept="image/*,application/pdf"
              />
              <p className="text-xs text-muted-foreground">Accepted: Images, PDF. Max size: 10MB</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || isLoadingTournaments || tournaments.length === 0}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
