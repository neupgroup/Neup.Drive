/*
::neup.documentation::quota-page
::route /quota
::title Account Quota Page
::owner Neup Drive

::public

Shows the signed-in account quota, including storage usage, available
capacity, and Drive item counts.

::returns
::datatype Promise<JSX.Element>

The quota dashboard for the current account.

::public end

::private

The page resolves the current account from the auth cookie on the server and
loads storage totals through the existing Drive status API.

::private end

::end
*/
import { FileAudio, FileImage, FileText, FileVideo, Flame, FolderOpen, HardDrive, Upload } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getCookie } from '@/core/helpers/cookie';
import { formatStorageBytes, STORAGE_LIMIT_BYTES } from '@/lib/storage-tiers';
import { getDriveQuotaDetails } from '@/lib/drive-files';
import { logica } from '@/logica';

function getPercent(usedBytes: number) {
  if (STORAGE_LIMIT_BYTES <= 0) return 0;
  return Math.max(0, Math.min(100, (usedBytes / STORAGE_LIMIT_BYTES) * 100));
}

function getSegmentPercent(bytes: number) {
  if (STORAGE_LIMIT_BYTES <= 0) return 0;
  return Math.max(0, Math.min(100, (bytes / STORAGE_LIMIT_BYTES) * 100));
}

function getUsedPercent(bytes: number, usedBytes: number) {
  if (usedBytes <= 0) return 0;
  return Math.max(0, Math.min(100, (bytes / usedBytes) * 100));
}

const quotaCategoryStyles = {
  documents: {
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
  },
  images: {
    dot: 'bg-amber-400',
    bar: 'bg-amber-400',
  },
  videos: {
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
  audio: {
    dot: 'bg-violet-300',
    bar: 'bg-violet-300',
  },
  other: {
    dot: 'bg-neutral-400',
    bar: 'bg-neutral-400',
  },
} as const;

function fileCardAppearance(type: 'action' | 'folder' | 'doc' | 'pdf' | 'jpg' | 'png' | 'mp4' | 'audio' | 'unknown') {
  if (type === 'jpg' || type === 'png') {
    return {
      icon: FileImage,
      iconClassName: 'bg-amber-100 text-amber-600',
    };
  }

  if (type === 'mp4') {
    return {
      icon: FileVideo,
      iconClassName: 'bg-rose-100 text-rose-600',
    };
  }

  if (type === 'audio') {
    return {
      icon: FileAudio,
      iconClassName: 'bg-violet-100 text-violet-600',
    };
  }

  return {
    icon: FileText,
    iconClassName: 'bg-blue-100 text-blue-600',
  };
}

export default async function QuotaPage() {
  const authAccountToken = await getCookie('auth_account');
  const account = authAccountToken?.trim()
    ? await logica.account.lookup.current
        .get(authAccountToken, ['accountId', 'displayName', 'neupid'])
        .then((response) => {
          if (!response.ok || !response.body.success || !response.body.accountId) {
            return null;
          }

          return {
            accountId: response.body.accountId,
            displayName: response.body.displayName || response.body.neupid || response.body.accountId,
            neupid: response.body.neupid || null,
          };
        })
    : null;

  const statusResponse = account
    ? await logica.drive.account(account.accountId).status()
    : null;
  const storage = statusResponse?.ok && statusResponse.body.success
    ? statusResponse.body.storage
    : {
        bytes_used: 0,
        file_count: 0,
        folder_count: 0,
        item_count: 0,
      };
  const quotaDetails = account
    ? await getDriveQuotaDetails({ owner: account.accountId, take: 10 })
    : { usedBytes: 0, categories: [], largestFiles: [] };

  const availableBytes = Math.max(STORAGE_LIMIT_BYTES - storage.bytes_used, 0);
  const usedPercent = getPercent(storage.bytes_used);

  return (
    <div className="space-y-6">
      <section className="space-y-8 px-1 py-2">
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">
                {formatStorageBytes(storage.bytes_used)} of {formatStorageBytes(STORAGE_LIMIT_BYTES)} used
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {account?.displayName || 'Not connected'} • {usedPercent.toFixed(1)}% used • {formatStorageBytes(availableBytes)} available
              </p>
            </div>
          </div>
        </div>

        <TooltipProvider>
          <div className="space-y-5">
            <div
              className="flex h-4 w-full overflow-hidden rounded-full bg-slate-200"
              aria-label={`${usedPercent.toFixed(1)}% storage used`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Number(usedPercent.toFixed(1))}
              role="meter"
            >
              {quotaDetails.categories.map((category) => {
                const percentOfPlan = getSegmentPercent(category.bytes);
                const percentOfUsed = getUsedPercent(category.bytes, quotaDetails.usedBytes);

                return (
                  <Tooltip key={category.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`${quotaCategoryStyles[category.id].bar} transition-opacity hover:opacity-80`}
                        style={{ width: `${percentOfPlan}%` }}
                        aria-label={`${category.label}: ${formatStorageBytes(category.bytes)} used`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.label}</p>
                      <p>{formatStorageBytes(category.bytes)} used</p>
                      <p>{percentOfUsed.toFixed(1)}% of used storage</p>
                      <p>{percentOfPlan.toFixed(1)}% of plan</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="transition-opacity hover:opacity-80"
                    style={{ width: `${getSegmentPercent(availableBytes)}%` }}
                    aria-label={`${formatStorageBytes(availableBytes)} available`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Available</p>
                  <p>{formatStorageBytes(availableBytes)} free</p>
                  <p>{(100 - usedPercent).toFixed(1)}% of plan</p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">
              {quotaDetails.categories.map((category) => {
                const percentOfPlan = getSegmentPercent(category.bytes);
                const percentOfUsed = getUsedPercent(category.bytes, quotaDetails.usedBytes);

                return (
                  <Tooltip key={category.id}>
                    <TooltipTrigger asChild>
                      <span
                        tabIndex={0}
                        className="inline-flex cursor-help items-center gap-2 rounded-full px-1 py-0.5 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        aria-label={`${category.label}: ${formatStorageBytes(category.bytes)}`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${quotaCategoryStyles[category.id].dot}`} />
                        <span>{category.label}</span>
                        <span className="text-slate-500">({formatStorageBytes(category.bytes)})</span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{category.label}</p>
                      <p>{formatStorageBytes(category.bytes)} used</p>
                      <p>{percentOfUsed.toFixed(1)}% of used storage</p>
                      <p>{percentOfPlan.toFixed(1)}% of plan</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>
      </section>

      <section className="space-y-4 px-1 py-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Largest Files</h2>
          <p className="mt-1 text-sm text-slate-500">
            Files currently stored in Drive, sorted from largest to smallest.
          </p>
        </div>

        {quotaDetails.largestFiles.length === 0 ? (
          <p className="text-sm text-slate-500">No files are available for this account yet.</p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {quotaDetails.largestFiles.map((file, index) => {
              const appearance = fileCardAppearance(file.type);
              const Icon = appearance.icon;
              const isFirst = index === 0;
              const isLast = index === quotaDetails.largestFiles.length - 1;

              return (
                <Link
                  key={file.id}
                  href={`/viewer/${encodeURIComponent(file.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'flex cursor-pointer flex-col gap-4 bg-white p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between',
                    !isFirst ? 'border-t border-slate-200' : '',
                    isFirst ? 'rounded-t-3xl' : '',
                    isLast ? 'rounded-b-3xl' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${appearance.iconClassName}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {file.size} • Modified {file.lastModified}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4 px-1 py-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Purchase more storage now.</h2>
          <p className="mt-1 text-sm text-slate-500">
            Expand your account with additional hot storage capacity.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <a
            href="https://neupgroup.com/one/storage-plans?plan=10gb"
            target="_blank"
            rel="noopener noreferrer"
            className="block cursor-pointer bg-white px-4 py-4 transition-colors hover:bg-rose-50/60 sm:px-5 sm:py-4.5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 shadow-sm">
                <Flame className="h-5 w-5 text-rose-600" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">Hot 10 GB Storage</p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">USD 2</span> per Month
                </p>
              </div>
            </div>
          </a>

          <a
            href="https://neupgroup.com/one/storage-plans?plan=100gb"
            target="_blank"
            rel="noopener noreferrer"
            className="block cursor-pointer border-t border-slate-200 bg-white px-4 py-4 transition-colors hover:bg-rose-50/60 sm:px-5 sm:py-4.5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 shadow-sm">
                <Flame className="h-5 w-5 text-rose-600" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">Hot 100 GB Storage</p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">USD 15</span> per Month
                </p>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
