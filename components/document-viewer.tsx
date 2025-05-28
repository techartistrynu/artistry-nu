'use client';

import { useState, useEffect, useMemo } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { Button } from '@/components/ui/button';
import { Download, RotateCw } from 'lucide-react';

interface DocumentViewerProps {
  url: string;
}

export function DocumentViewer({ url }: DocumentViewerProps) {
  const [documentBlob, setDocumentBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState('pdf');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`);

        const blob = await response.blob();
        setDocumentBlob(blob);

        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('pdf')) {
          setFileType('pdf');
        } else if (contentType?.includes('word')) {
          setFileType('docx');
        } else {
          setFileType('pdf'); // default
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [url]);

  const documentUrl = useMemo(() => {
    if (!documentBlob) return null;
    return URL.createObjectURL(documentBlob);
  }, [documentBlob]);

  useEffect(() => {
    return () => {
      if (documentUrl) URL.revokeObjectURL(documentUrl);
    };
  }, [documentUrl]);

  const handleDownload = () => {
    if (!documentBlob) return;
    const tempUrl = URL.createObjectURL(documentBlob);
    const a = document.createElement('a');
    a.href = tempUrl;
    a.download = `certificate.${fileType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(tempUrl);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <RotateCw className="h-8 w-8 animate-spin mb-4" />
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="w-full h-full border rounded-md overflow-hidden bg-gray-50">
        {documentUrl && (
          <DocViewer
            documents={[
              {
                uri: documentUrl,
                fileType,
                fileName: 'certificate',
              },
            ]}
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
              },
              loadingRenderer: {
                overrideComponent: () => (
                  <div className="flex items-center justify-center h-full">
                    Rendering document...
                  </div>
                ),
              },
              pdfVerticalScrollByDefault: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
