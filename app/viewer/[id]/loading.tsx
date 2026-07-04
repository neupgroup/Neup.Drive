/*
::neup.documentation::viewer-loading-page
::function Loading()
::title Viewer Loading Page
::owner Neup Drive

::public

Renders the loading shell for `/viewer/[id]` while the file metadata and preview
state are still resolving.

::returns
::datatype JSX.Element

The loading UI for the viewer route.

::public end

::private

The shell mirrors the final viewer layout with a header, preview frame, and
action area so the page does not jump when the real file content arrives.

::private end

::end
*/
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full min-w-0 space-y-4 overflow-hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-40 max-w-full" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-5xl space-y-4">
            <Skeleton className="h-[52vh] w-full rounded-lg" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}
