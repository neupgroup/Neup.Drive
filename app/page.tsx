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

export default async function Home({
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
