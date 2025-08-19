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

  const categoryOptions = [
    { value: "photography", label: "Photography" },
    { value: "illustration", label: "Illustration" },
    { value: "3d-modeling", label: "3D Modeling" },
    { value: "painting", label: "Painting" },
    { value: "sculpture", label: "Sculpture" },
    { value: "drawing", label: "Drawing" },
    { value: "print-making-art", label: "Print Making Art" },
    { value: "other", label: "Other" },
  ];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const handleCategoryChange = (value: string) => {
    setSelectedCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const ageCategoryOptions = [
    { value: "5-12", label: "5-12" },
    { value: "13-20", label: "13-20" },
    { value: "21-34", label: "21-34" },
    { value: "21+", label: "21+" },
    { value: "35+", label: "35+" },
  ];
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>("18-25");

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentById(tournamentId).then(data => {
        setDefaultValues(data)
        // Update the selected values when data is loaded
        if (data && typeof data === 'object') {
          const tournamentData = data as any
          if (Array.isArray(tournamentData.categories)) {
            setSelectedCategories(tournamentData.categories)
          }
          if (tournamentData.ageCategory && typeof tournamentData.ageCategory === 'string') {
            setSelectedAgeCategory(tournamentData.ageCategory)
          }
        }
      })
    }
  }, [tournamentId])
  console.log(defaultValues);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    selectedCategories.forEach((cat) => formData.append('categories[]', cat));
    formData.append('ageCategory', selectedAgeCategory);
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
          {tournamentId ? 'Edit Tournament' : 'Create New Competition'}
        </h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Competition Details</CardTitle>
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
              <Label htmlFor="category">Categories</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex justify-between items-center"
                  onClick={() => setShowCategoryDropdown((prev) => !prev)}
                >
                  {selectedCategories.length > 0
                    ? selectedCategories.map((cat) => categoryOptions.find((o) => o.value === cat)?.label).join(", ")
                    : "Select categories"}
                  <span className="ml-2">▼</span>
                </Button>
                {showCategoryDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-white border rounded shadow p-2 space-y-1">
                    {categoryOptions.map((option) => (
                      <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="categories[]"
                          value={option.value}
                          checked={selectedCategories.includes(option.value)}
                          onChange={() => handleCategoryChange(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageCategory">Age Category</Label>
              <Select 
                name="ageCategory" 
                value={selectedAgeCategory} 
                onValueChange={setSelectedAgeCategory}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age category" />
                </SelectTrigger>
                <SelectContent>
                  {ageCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationStartDate">Registration Start Date</Label>
                <Input id="registrationStartDate" name="registrationStartDate" type="date" defaultValue={defaultValues?.registration_start?.slice(0, 10)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationEndDate">Registration End Date</Label>
                <Input id="registrationEndDate" name="registrationEndDate" type="date" defaultValue={defaultValues?.registration_end?.slice(0, 10)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submissionEndDate">Submission End Date</Label>
                <Input id="submissionEndDate" name="submissionEndDate" type="date" defaultValue={defaultValues?.submission_deadline?.slice(0, 10)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resultDate">Result Date</Label>
                <Input id="resultDate" name="resultDate" type="date" defaultValue={defaultValues?.result_date?.slice(0, 10)} />
              </div>
            </div>
            
            {/* Price Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              <div className="space-y-2">
                <Label htmlFor="entryFee">Entry Fee (₹)</Label>
                <Input id="entryFee" name="entryFee" type="number" min="0" step="0.01" defaultValue={defaultValues?.entry_fee} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercent">Discount (%)</Label>
                <Input 
                  id="discountPercent" 
                  name="discountPercent" 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01"
                  defaultValue={Number(defaultValues?.discount_percent) || 0}
                />
                <p className="text-sm text-muted-foreground">Enter discount percentage (0-100)</p>
              </div>
            </div>

            {/* Prize Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prizes (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstPrize">1st Prize (₹)</Label>
                  <Input id="firstPrize" name="firstPrize" type="text"  defaultValue={defaultValues?.first_prize} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondPrize">2nd Prize (₹)</Label>
                  <Input id="secondPrize" name="secondPrize" type="text"  defaultValue={defaultValues?.second_prize} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thirdPrize">3rd Prize (₹)</Label>
                  <Input id="thirdPrize" name="thirdPrize" type="text"  defaultValue={defaultValues?.third_prize} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thirdPrize">Hounorable mentions Prize (₹)</Label>
                  <Input id="mentionPrize" name="mentionPrize" type="text"  defaultValue={defaultValues?.mention_prize} />
                </div>
              </div>
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
                  accept=".jpg,.jpeg,.png,.svg"
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
