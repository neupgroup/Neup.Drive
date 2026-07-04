/*
::neup.documentation::trash-restore-button
::title Trash Restore Button

Renders a restore action for a trashed file and calls the bridge restore API.

::private

Uses the existing `/bridge/api.v1/drive/files/operation` restore action, refreshes the Trash page on success, and keeps the button disabled while the request is in flight.

::private end

::end
*/
'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function TrashRestoreButton({
  filefolderId,
}: {
  filefolderId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleRestore = React.useCallback(async () => {
    try {
      setIsPending(true);

      const response = await fetch('/bridge/api.v1/drive/files/operation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filefolder_id: filefolderId,
          action: 'restore',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to restore file');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }, [filefolderId, router]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-full"
      onClick={handleRestore}
      disabled={isPending}
    >
      <RotateCcw className="mr-2 h-4 w-4" />
      {isPending ? 'Restoring...' : 'Restore'}
    </Button>
  );
}
