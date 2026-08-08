/*
::neup.documentation::storage-root-page
::route /storage
::title Storage Root Page
::owner Neup Drive

::public

Hosts the main storage browser, including folder breadcrumb navigation and
drive-scoped uploads.

::returns
::datatype Promise<JSX.Element>

The main storage file browser for the requested internal path.

::public end

::private

The `path` search param is normalized on the server before loading files so the
client manager only receives safe internal drive paths.

::private end

::end
*/
import { DrivePageManager } from '@/components/prodrive/drive-page-manager';
import { getCookie } from '@/core/helpers/cookie';
import { normalizeInternalPath, resolveAuthenticatedAccountId } from '@/lib/bridge-api';
import { getDriveFiles } from '@/lib/drive-files';

function getCurrentPath(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  try {
    return normalizeInternalPath(rawValue);
  } catch {
    return '';
  }
}

async function getSignedInAccountId() {
  return resolveAuthenticatedAccountId(await getCookie('auth_account'));
}

export default async function StorageRootPage({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPath = getCurrentPath(resolvedSearchParams?.path);
  const accountId = await getSignedInAccountId();
  const files = accountId
    ? await getDriveFiles({ owner: accountId, internalPath: currentPath })
    : [];

  return <DrivePageManager currentPath={currentPath} files={files} />;
}
