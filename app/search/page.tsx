/*
::neup.documentation::search-page
::function SearchPage()
::title Search Page
::owner Neup Drive

::public

Renders file search results for the header search flow.

::returns
::datatype Promise<JSX.Element>

The `/search` page UI.

::public end

::private

The page reads the `q` query parameter, filters drive files by name, and reuses
the main file manager layout with search-specific heading and empty-state copy.

::private end

::end
*/
import { FileManager } from '@/components/prodrive/file-manager';
import { getDriveFiles } from '@/core/lib/drive-files';

function normalizeQuery(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim() || '';
  }

  return value?.trim() || '';
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const query = normalizeQuery(resolvedSearchParams?.q);
  const files = query ? await getDriveFiles({ query, includeFolders: false }) : [];

  return (
    <FileManager
      initialFiles={files}
      title="Search"
      subtitle={query ? `Drive file results for "${query}"` : 'Search for files in your drive from the header input.'}
      emptyMessage={query ? `No drive files found for "${query}".` : 'Enter a search term to find files.'}
    />
  );
}
