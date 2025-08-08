"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { updateSubmissionScore } from "@/app/actions/submissions"

export function SubmissionReviewForm({ 
  submissionId, 
  initialScore,
  paid, 
  onUpdate 
}: { 
  submissionId: string, 
  initialScore?: number,
  paid?: boolean,
  onUpdate?: (score: number, status: string) => void
}) {
  async function handleSubmit(formData: FormData) {
    const score = formData.get("score")
    const status = formData.get("status")
    
    if (!score || !status) return
    
    alert("Are you sure you want to update the submission score?" + score + " ")
    const result = await updateSubmissionScore(
      submissionId,
      parseFloat(score as string),
      status as "approved" | "rejected"
    )
    
    if (result.success) {
      toast({
        title: "Submission Updated",
        description: `Submission ${status} with score ${score}`,
      })
      
      // Call the onUpdate callback to update parent component data
      if (onUpdate) {
        onUpdate(parseFloat(score as string), status as "approved" | "rejected")
      }
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.message,
      })
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="score" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Score (0-10)
        </Label>
        <Input
          id="score"
          name="score"
          type="number"
          min="0"
          max="10"
          step="0.01"
          defaultValue={initialScore || ""}
          placeholder="Enter score"
          required
          disabled={!!initialScore || !paid}
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          type="submit"
          name="status"
          value="rejected"
          variant="destructive"
          className="flex-1 gap-2"
          disabled={!!initialScore || !paid}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
        <Button
          type="submit"
          name="status"
          value="approved"
          className="flex-1 gap-2"
          disabled={!!initialScore || !paid}
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </Button>
      </div>
    </form>
  )
} 