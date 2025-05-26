'use client'

import dynamic from 'next/dynamic'

const PDFViewer = dynamic(() => import('@/components/pdf-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Loading PDF viewer...</p>
    </div>
  ),
})

interface PDFViewerWrapperProps {
  url: string
}

export default function PDFViewerWrapper({ url }: PDFViewerWrapperProps) {
  return <PDFViewer pdfUrl={url} />
} 