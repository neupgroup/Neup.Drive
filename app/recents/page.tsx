/*
::neup.documentation::recents-page
::route /recents
::title Recent Items Page
::owner Neup Drive

::public

Shows the most recent activity across Drive, WebDisk, and Signed items using
the shared file manager experience.

::returns
::datatype Promise<JSX.Element>

The recent-items page for the configured Drive and WebDisk owners.

::public end

::private

The page is server-backed through Prisma so it stays aligned with live drive
state instead of the older mock-data implementation.

::private end

::end
*/
import { RecentPageManager } from '@/components/prodrive/recent-page-manager';
import { getRecentDriveFiles } from '@/core/lib/drive-files';

export default async function RecentsPage() {
  const files = await getRecentDriveFiles();

  return <RecentPageManager files={files} />;
}
