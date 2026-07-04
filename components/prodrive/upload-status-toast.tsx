'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/core/hooks/use-toast';
import { getUploads } from '@/core/lib/upload-persistence';
import { ToastAction } from '@/components/ui/toast';

const ACTIVE_UPLOAD_STATUSES = new Set([
  'PENDING',
  'HASHING',
  'HASHED',
  'TOKEN_ISSUED',
  'UPLOADING',
  'VERIFIED',
]);

export function UploadStatusToast() {
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const uploadToastIdRef = React.useRef<string | null>(null);
  const completedToastIdRef = React.useRef<string | null>(null);
  const hadActiveUploadsRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;

    const syncUploadToast = async () => {
      try {
        const uploads = await getUploads();
        if (cancelled) return;

        const activeUploads = uploads.filter((item) => ACTIVE_UPLOAD_STATUSES.has(item.status));
        const remainingCount = activeUploads.length;

        if (remainingCount <= 0) {
          if (uploadToastIdRef.current) {
            dismiss(uploadToastIdRef.current);
            uploadToastIdRef.current = null;
          }

          if (hadActiveUploadsRef.current && !completedToastIdRef.current) {
            const completedToast = toast({
              title: 'Upload Completed',
              action: (
                <ToastAction
                  altText="View uploaded files"
                  onClick={() => {
                    router.push('/');
                    if (completedToastIdRef.current) {
                      dismiss(completedToastIdRef.current);
                      completedToastIdRef.current = null;
                    }
                  }}
                >
                  View uploaded files
                </ToastAction>
              ),
            });

            completedToastIdRef.current = completedToast.id;
          }

          hadActiveUploadsRef.current = false;
          return;
        }

        hadActiveUploadsRef.current = true;

        if (completedToastIdRef.current) {
          dismiss(completedToastIdRef.current);
          completedToastIdRef.current = null;
        }

        const description = `${remainingCount} files remaining.`;
        const title = (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Uploading</span>
          </span>
        );

        if (uploadToastIdRef.current) {
          toast({
            id: uploadToastIdRef.current,
            title,
            description,
            hideClose: true,
          });
          return;
        }

        const uploadToast = toast({
          title,
          description,
          hideClose: true,
        });

        uploadToastIdRef.current = uploadToast.id;
      } catch {
        if (uploadToastIdRef.current) {
          dismiss(uploadToastIdRef.current);
          uploadToastIdRef.current = null;
        }
      }
    };

    void syncUploadToast();
    const interval = window.setInterval(() => {
      void syncUploadToast();
    }, 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [dismiss, router, toast]);

  return null;
}
