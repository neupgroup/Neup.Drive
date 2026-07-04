/*
::neup.documentation::analytics-page
::route /analytics
::title Account Analytics Page
::owner Neup Drive

::public

Shows account-scoped CDN analytics, including most-loaded files, ingress and
egress totals, and the domains/pages embedding the account's files.

::returns
::datatype Promise<JSX.Element>

The analytics dashboard for the current signed-in account or configured demo
account fallback.

::public end

::private

The page aggregates data from the CDN activity log on the server and renders
bandwidth, file, domain, and page breakdowns without needing a client fetch.

::private end

::end
*/
import { BarChart3, Globe, HardDriveDownload, HardDriveUpload, Link2, TrendingUp } from 'lucide-react';

import { getDriveAnalytics } from '@/core/lib/analytics';
import { getSignedInAccountIdentity } from '@/core/lib/account-session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
}

function formatTimestamp(value: string | null) {
  if (!value) return 'No activity yet';
  return new Date(value).toLocaleString();
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-2xl">{value}</CardTitle>
        </div>
        <div className="rounded-md border bg-background p-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const account = await getSignedInAccountIdentity();
  const analytics = await getDriveAnalytics({
    accountId: account?.accountId,
    displayName: account?.displayName,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Analytics</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Track which files are loaded the most, how much data was uploaded and served, and which domains and pages are embedding this account&apos;s files.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-3 py-1">
            Account: {analytics.displayName || analytics.accountId}
          </span>
          <span className="rounded-full border px-3 py-1">
            Generated: {formatTimestamp(analytics.generatedAt)}
          </span>
          <span className="rounded-full border px-3 py-1">
            Tracked files: {analytics.totals.trackedFiles}
          </span>
          <span className="rounded-full border px-3 py-1">
            Activity log: {analytics.sourceLogPath ? 'Connected' : 'Not found'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Most Loaded File"
          value={analytics.topFile ? `${analytics.topFile.loads} loads` : 'No loads'}
          description={analytics.topFile ? analytics.topFile.name : 'No file views have been recorded yet.'}
          icon={TrendingUp}
        />
        <StatCard
          title="Egress"
          value={formatBytes(analytics.totals.egressBytes)}
          description={`${analytics.totals.fileViews} file views served from the CDN.`}
          icon={HardDriveDownload}
        />
        <StatCard
          title="Ingress"
          value={formatBytes(analytics.totals.ingressBytes)}
          description={`${analytics.totals.uploads} completed uploads recorded for this account.`}
          icon={HardDriveUpload}
        />
        <StatCard
          title="Embedded Views"
          value={String(analytics.totals.embeddedViews)}
          description={`${analytics.totals.unattributedViews} additional views did not include a source page.`}
          icon={Link2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="rounded-md border bg-background p-2">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Top Files</CardTitle>
              <CardDescription>
                Files with the most loads, egress, and embed activity for this account.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No file activity has been recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.files.map((file) => (
                  <div key={file.path} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="mt-1 break-all text-xs text-muted-foreground">{file.path}</p>
                      </div>
                      <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:min-w-[320px]">
                        <p>Loads: <span className="font-medium text-foreground">{file.loads}</span></p>
                        <p>Egress: <span className="font-medium text-foreground">{formatBytes(file.egressBytes)}</span></p>
                        <p>Uploads: <span className="font-medium text-foreground">{file.uploadCount}</span></p>
                        <p>Ingress: <span className="font-medium text-foreground">{formatBytes(file.ingressBytes)}</span></p>
                        <p>Embedded: <span className="font-medium text-foreground">{file.embeddedLoads}</span></p>
                        <p>Last seen: <span className="font-medium text-foreground">{formatTimestamp(file.lastSeen)}</span></p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                      <p>Top domain: <span className="font-medium text-foreground">{file.topDomain || 'Unknown'}</span></p>
                      <p className="break-all">Top page: <span className="font-medium text-foreground">{file.topPage || 'Unknown'}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="rounded-md border bg-background p-2">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Top Domains</CardTitle>
              <CardDescription>
                Domains where this account&apos;s files appear most often.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.domains.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attributed embed traffic yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.domains.map((domain) => (
                  <div key={domain.domain} className="rounded-xl border p-4">
                    <p className="break-all font-medium">{domain.domain}</p>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                      <p>Requests: <span className="font-medium text-foreground">{domain.requests}</span></p>
                      <p>Egress: <span className="font-medium text-foreground">{formatBytes(domain.egressBytes)}</span></p>
                      <p>Pages: <span className="font-medium text-foreground">{domain.pageCount}</span></p>
                      <p>Files: <span className="font-medium text-foreground">{domain.fileCount}</span></p>
                      <p>Last seen: <span className="font-medium text-foreground">{formatTimestamp(domain.lastSeen)}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>
              Source pages sending the most file loads for this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.pages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No source pages were captured in the CDN log.</p>
            ) : (
              <div className="space-y-3">
                {analytics.pages.map((page) => (
                  <div key={`${page.domain}-${page.page}`} className="rounded-xl border p-4">
                    <p className="font-medium">{page.domain}</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">{page.page}</p>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <p>Loads: <span className="font-medium text-foreground">{page.requests}</span></p>
                      <p>Egress: <span className="font-medium text-foreground">{formatBytes(page.egressBytes)}</span></p>
                      <p>Files: <span className="font-medium text-foreground">{page.fileCount}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Embedded Loads</CardTitle>
            <CardDescription>
              Most recent source-attributed file requests captured by the CDN activity log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.recentEmbeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent embedded file loads are available yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentEmbeds.map((entry) => (
                  <div key={`${entry.timestamp}-${entry.filePath}-${entry.page}`} className="rounded-xl border p-4">
                    <p className="font-medium">{entry.fileName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
                    <p className="mt-2 break-all text-sm text-muted-foreground">{entry.domain}</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">{entry.page}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
