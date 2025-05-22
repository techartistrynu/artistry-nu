"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function DownloadButton({ url }: { url: string }) {
  return (
    <Button 
      variant="secondary"
      size="sm"
      onClick={() => window.open(url, '_blank')}
    >
      <Download className="h-4 w-4 mr-2" />
      Download
    </Button>
  )
} 