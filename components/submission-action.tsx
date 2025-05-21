'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import ImagePreview from "@/components/ui/previewer";

export default function SubmissionActions({ imageUrl }: { imageUrl: string }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsPreviewOpen(true)}
      >
        <Eye className="mr-2 h-4 w-4" />
        View
      </Button>
      
      {isPreviewOpen && (
        <ImagePreview 
          imageUrl={imageUrl}
          alt="Submission preview"
          className="rounded-lg shadow-md"
          width={300}
          height={200}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}