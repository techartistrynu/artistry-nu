'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { createTournament, editTournament, fetchTournamentById } from '@/app/actions/tournaments'

function NewTournamentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tournamentId = searchParams.get('tournamentId')
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [files, setFiles] = useState<FileList | null>(null)
  const [defaultValues, setDefaultValues] = useState<any>(null)

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentById(tournamentId).then(data => setDefaultValues(data))
    }
  }, [tournamentId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    if (files) {
      for (const file of files) {
        formData.append('files', file)
      }
    }

    try {
      if (tournamentId) {
        formData.append('id', tournamentId)
        await editTournament(tournamentId, formData)
        toast({ title: 'Success', description: 'Tournament updated successfully!' })
      } else {
        await createTournament(formData)
        toast({ title: 'Success', description: 'Tournament created successfully!' })
      }
      router.push('/admin/dashboard/tournaments')
    } catch (error) {
      console.error('Error submitting tournament:', error)
      toast({ title: 'Error', description: 'Failed to submit tournament.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {tournamentId ? 'Edit Tournament' : 'Create New Tournament'}
        </h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={defaultValues?.title} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={defaultValues?.description} rows={4} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={defaultValues?.category} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital-art">Digital Art</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="graphic-design">Graphic Design</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="3d-modeling">3D Modeling</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationStartDate">Registration Start Date</Label>
                <Input id="registrationStartDate" name="registrationStartDate" type="date" defaultValue={defaultValues?.registration_start?.slice(0, 10)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationEndDate">Registration End Date</Label>
                <Input id="registrationEndDate" name="registrationEndDate" type="date" defaultValue={defaultValues?.registration_end?.slice(0, 10)} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionEndDate">Submission End Date</Label>
                <Input id="submissionEndDate" name="submissionEndDate" type="date" defaultValue={defaultValues?.submission_deadline?.slice(0, 10)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                <Input id="entryFee" name="entryFee" type="number" min="0" step="0.01" defaultValue={defaultValues?.entry_fee || 25} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="files">Upload Banner Image*</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                  <Input
                    id="files"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFiles(e.target.files)}
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.svg"
                    required={!tournamentId}
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("files")?.click()}>
                    Select Files
                  </Button>
                </div>
                {files && (
                  <ul className="text-sm mt-2 text-gray-500 list-disc list-inside">
                    {Array.from(files).map((file, idx) => (
                      <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (tournamentId ? "Updating..." : "Creating...") : (tournamentId ? "Update Tournament" : "Create Tournament")}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function NewTournamentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTournamentForm />
    </Suspense>
  )
}
