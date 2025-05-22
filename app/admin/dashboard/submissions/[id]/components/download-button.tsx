"use client"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"

export function DownloadButton({ url, fileName }: { url: string, fileName: string }) {

    const handleDownload = async (fileUrl: string, fileName: string) => {
        try {
          // Use fetch API to get the file
          const response = await fetch(fileUrl)
          const blob = await response.blob()
          
          // Create a download link
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = fileName || 'download'
          document.body.appendChild(a)
          a.click()
          
          // Clean up
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } catch (error) {
          console.error("Error downloading file:", error)
          toast({
            title: "Error",
            description: "Failed to download file",
            variant: "destructive",
          })
        }
      }
      
  return (
    <Button 
      variant="secondary"
      size="sm"
      onClick={() => handleDownload(url, fileName)}
    >
      <Download className="h-4 w-4 mr-2" />
      Download
    </Button>
  )
} 