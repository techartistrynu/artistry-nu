'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export function ShareButton({ url, title = 'View Certificate', text = 'Check out this certificate!' }: ShareButtonProps) {
    const handleShare = async () => {
        if (navigator.share && url) {
          try {
            await navigator.share({
              title,
              text,
              url,
            });
          } catch (err: any) {
            // Suppress "Share canceled" error
            if (err.name !== 'AbortError') {
              console.error('Error sharing document:', err);
            }
          }
        } else {
          alert('Sharing is not supported on this browser.');
        }
      };

  return (
    <Button
      variant="outline"
      className="mt-2 flex items-center gap-2"
      onClick={handleShare}
    >
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
