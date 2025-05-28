// components/pdf-viewer-enhanced.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerEnhancedProps {
  downloadUrl: string;
}

export function PDFViewerEnhanced({ downloadUrl }: PDFViewerEnhancedProps) {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        setLoading(true);
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        
        const blob = await response.blob();
        setPdfBlob(blob);
        setError(null);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();
  }, [downloadUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading PDF...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full max-w-3xl overflow-auto border rounded-lg bg-white">
        {pdfBlob && (
          <Document
            file={URL.createObjectURL(pdfBlob)}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center p-4">Loading PDF pages...</div>}
            error={<div className="text-center text-red-500 p-4">Failed to render PDF</div>}
          >
            <Page
              pageNumber={pageNumber}
              width={Math.min(800, window.innerWidth - 40)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>

      <div className="flex items-center justify-center mt-4 gap-4">
        <Button
          variant="outline"
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(p => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        
        <span className="text-sm">
          Page {pageNumber} of {numPages || '...'}
        </span>
        
        <Button
          variant="outline"
          disabled={pageNumber >= (numPages || 1)}
          onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
        >
          Next
        </Button>
      </div>

      <div className="flex gap-4 mt-6">
        <Button asChild variant="outline">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in new tab
          </a>
        </Button>
        
        <Button onClick={handleDownload} disabled={!pdfBlob}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  );
}