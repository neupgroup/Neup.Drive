/*
::neup.documentation::drive-route-redirect
::route /drive
::title Drive Route Redirect
::owner Neup Drive

::public

Redirects the legacy Drive route to the canonical storage route while
preserving the folder query string.

::returns
::datatype never

The response always redirects to `/storage`.

::public end

::end
*/
import { redirect } from 'next/navigation';
import { PRODRIVE_STORAGE_PATH } from '@/components/prodrive/routes';

export default async function DriveRouteRedirect({
  searchParams,
}: {
  searchParams?: Promise<{ path?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawPath = Array.isArray(resolvedSearchParams?.path)
    ? resolvedSearchParams?.path[0]
    : resolvedSearchParams?.path;
  const target = rawPath?.trim()
    ? `${PRODRIVE_STORAGE_PATH}?path=${encodeURIComponent(rawPath)}`
    : PRODRIVE_STORAGE_PATH;
  redirect(target);
}
