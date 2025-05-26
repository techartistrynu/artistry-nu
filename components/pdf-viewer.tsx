'use client';

import { useEffect, useState } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, className = '' }: PDFViewerProps) {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error('Failed to fetch PDF');

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setIframeSrc(blobUrl);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF file.');
      }

      return () => {
        if (iframeSrc) {
          URL.revokeObjectURL(iframeSrc);
        }
      };
    };

    loadPdf();
  }, [pdfUrl]);

  return (
    <div className={`w-full h-[100vh] p-2 ${className}`}>
      {error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        iframeSrc && (
          <iframe
            src={iframeSrc}
            className="w-full h-full border-none rounded shadow"
            title="PDF Viewer"
          />
        )
      )}
    </div>
  );
}
