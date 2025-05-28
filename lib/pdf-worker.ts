// lib/pdf-worker.ts
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = 
  // For production (bundled worker)
  process.env.NODE_ENV === 'production'
    ? new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString()
    // For development (CDN)
    : `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;