"use client"

import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import ImagePreview from "@/components/ui/previewer"

export function ViewButton() {
  const handleClick = () => {
    return <ImagePreview 
      imageUrl="https://firebasestorage.googleapis.com/v0/b/art-tournament-2025.appspot.com/o/submissions%2F664866486486486486486486%2F664866486486486486486486%2Fimage.png?alt=media&token=66486648-6486-4864-8648-648648648648" 
      alt="Description of image"
      className="rounded-lg shadow-md"
      width={300}
      height={200}
    />
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Eye className="mr-2 h-4 w-4" />
      View
    </Button>
  )
} 