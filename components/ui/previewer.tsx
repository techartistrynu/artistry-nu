'use client';

import { useState } from 'react';
import Image from 'next/image';

type ImagePreviewProps = {
  imageUrl: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  onClose?: () => void;
};

export default function ImagePreview({
  imageUrl,
  alt = 'Preview',
  className = '',
  width = 200,
  height = 200,
  onClose,
}: ImagePreviewProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute right-4 top-4 z-50 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-70"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Image container with max dimensions */}
      <div 
        className="relative max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={1200}
          height={800}
          className="max-h-[90vh] max-w-[90vw] object-contain"
          style={{
            maxHeight: '90vh',
            maxWidth: '90vw',
          }}
        />
      </div>
    </div>
  );
}