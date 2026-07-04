/*
::neup.documentation::drive-root-page
::route /drive
::title Drive Root Page
::owner Neup Drive

::public

Hosts the main drive browser, including folder breadcrumb navigation and
drive-scoped uploads, after the homepage moved to the recent-items surface.

::returns
::datatype Promise<JSX.Element>

The main drive file browser for the requested internal path.

::public end

::private

The `path` search param is normalized on the server before loading files so the
client manager only receives safe internal drive paths.

::private end

::end
*/
import { DrivePageManager } from '@/components/prodrive/drive-page-manager';
import { normalizeInternalPath } from '@/core/lib/bridge-api';
import { getDriveFiles } from '@/core/lib/drive-files';

function getCurrentPath(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  try {
    return normalizeInternalPath(rawValue);
  } catch {
    return '';
  }
}

export default async function DriveRootPage({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPath = getCurrentPath(resolvedSearchParams?.path);
  const files = await getDriveFiles({ internalPath: currentPath });

  return (
    <DrivePageManager currentPath={currentPath} files={files} />
  );
}
