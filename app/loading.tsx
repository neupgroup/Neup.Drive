/*
::neup.documentation::home-loading-page
::function Loading()
::title Home Loading Page
::owner Neup Drive

::public

Renders the homepage loading shell while the recent-files section is still
unavailable.

::returns
::datatype JSX.Element

The loading UI for `/`.

::public end

::private

The heading text is rendered immediately instead of as a skeleton, while the
files area keeps a list-style skeleton to preserve layout stability.

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
          <h1 className="text-2xl font-bold font-headline tracking-tight">Welcome back, ...</h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s some files you might be interested in.
          </p>
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
