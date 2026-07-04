/*
::neup.documentation::home-page
::route /
::title Personalized Home Page
::owner Neup Drive

::public

Shows the recent-items landing page at the application root with a personalized
welcome message derived from the signed-in account when available.

::returns
::datatype JSX.Element

The homepage recent-items experience for the current account.

::public end

::private

The page streams the greeting name and the recent-files list in separate
Suspense boundaries so the shell copy appears immediately while account and
file data resolve independently.

::private end

::end
*/
import { Suspense } from 'react';
import { RecentPageManager } from '@/components/prodrive/recent-page-manager';
import { getSignedInAccountIdentity } from '@/core/lib/account-session';
import { getRecentDriveFiles } from '@/core/lib/drive-files';
import { Skeleton } from '@/components/ui/skeleton';

async function getHomepageDisplayName() {
  const account = await getSignedInAccountIdentity();
  return account?.displayName || null;
}

async function HomeGreetingName() {
  const displayName = await getHomepageDisplayName();
  return displayName || '...';
}

async function HomeRecentFiles() {
  const files = await getRecentDriveFiles();
  return <RecentPageManager files={files} showHeader={false} />;
}

function HomeFilesSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`home-files-skeleton-${index}`}
          className={`border border-border/70 bg-background px-4 py-3 ${
            index === 0 ? 'rounded-t-3xl' : 'border-t-0'
          } ${index === 7 ? 'rounded-b-3xl' : ''}`}
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
  );
}

export default function HomePage() {

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Welcome back,{' '}
          <Suspense fallback="...">
            <HomeGreetingName />
          </Suspense>
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s some files you might be interested in.
        </p>
      </div>

      <Suspense fallback={<HomeFilesSkeleton />}>
        <HomeRecentFiles />
      </Suspense>
    </div>
  );
}
