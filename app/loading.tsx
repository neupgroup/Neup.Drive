/*
::neup.documentation::home-loading-page
::function Loading()
::title Home Loading Page
::owner Neup Drive

::public

Renders the homepage skeleton while the root drive page is loading.

::returns
::datatype JSX.Element

The loading UI for `/`.

::public end

::private

The skeleton mirrors the default list-style drive layout so the page remains
stable while the server-rendered homepage data is loading.

::private end

::end
*/
import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_ROWS = 8;

export default function Loading() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="space-y-0">
          {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
            <div
              key={`home-loading-row-${index}`}
              className={`border border-border/70 bg-background px-4 py-3 ${
                index === 0 ? 'rounded-t-3xl' : 'border-t-0'
              } ${index === SKELETON_ROWS - 1 ? 'rounded-b-3xl' : ''}`}
            >
              <div className="flex min-h-20 items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
