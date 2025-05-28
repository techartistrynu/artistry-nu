// components/pdf-viewer-wrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(
  () => import('./react-pdf-viewer').then(mod => mod.PDFViewerEnhanced),
  {
    ssr: false,
    loading: () => <div className="text-center p-4">Loading PDF viewer...</div>
  }
);

export function PDFViewerWrapper({ url }: { url: string }) {
  return <PDFViewer downloadUrl={url} />;
}