"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X, FileImage, FileText, File } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

interface SubmissionFormProps {
  tournamentId: string
  tournamentName: string
}

export function SubmissionForm({ tournamentId, tournamentName }: SubmissionFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files)
    const validFiles = newFiles.filter((file) => {
      const fileType = file.type.toLowerCase()
      const validTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "application/illustrator"]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!validTypes.includes(fileType)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload JPG, PNG, GIF, PDF, or AI files.`,
          variant: "destructive",
        })
        return false
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB size limit.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setFiles((prev) => [...prev, ...validFiles])

    // Create previews for image files
    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      } else {
        // For non-image files, use a placeholder
        setPreviews((prev) => [...prev, "non-image"])
      }
    })
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit artwork.",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please upload at least one file for your submission.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 1. Create submission record
      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          tournament_id: tournamentId,
          title,
          description,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (submissionError) {
        throw submissionError
      }

      // 2. Upload files to Supabase Storage
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop()
        const fileName = `${submission.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `submissions/${fileName}`

        const { error: uploadError } = await supabase.storage.from("artwork").upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        // 3. Create submission_file record
        const { error: fileRecordError } = await supabase.from("submission_files").insert({
          submission_id: submission.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        })

        if (fileRecordError) {
          throw fileRecordError
        }

        return filePath
      })

      await Promise.all(uploadPromises)

      toast({
        title: "Submission Successful",
        description: "Your artwork has been submitted successfully.",
      })

      // Redirect to the submissions page
      router.push("/dashboard/submissions")
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission Failed",
        description: "An error occurred while submitting your artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase()

    if (fileType.startsWith("image/")) {
      return <FileImage className="h-6 w-6" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-6 w-6" />
    } else {
      return <File className="h-6 w-6" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Artwork</CardTitle>
        <CardDescription>Submit your artwork for {tournamentName}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Title of your artwork"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your artwork, techniques used, and inspiration"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Upload Files</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-muted/50 hover:bg-muted"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-1 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF, PDF, AI (Max 10MB)</p>
                </div>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.ai"
                  multiple
                />
              </label>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="flex items-center p-3 border rounded-md bg-muted/30">
                      {previews[index] && previews[index] !== "non-image" ? (
                        <div className="relative w-full aspect-square overflow-hidden rounded-md">
                          <Image
                            src={previews[index] || "/placeholder.svg"}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file)}
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Artwork"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
