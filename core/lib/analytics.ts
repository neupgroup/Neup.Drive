/*
::neup.documentation::drive-analytics-helper
::function getDriveAnalytics(params)
::title Get Drive Analytics
::owner Neup Drive

::public

Aggregates account-scoped CDN activity into analytics cards and breakdown
tables for the Drive analytics page.

::param external params
::datatype object

The account identity to analyze and optional display label overrides.

::returns
::datatype Promise<DriveAnalyticsSnapshot>

The summarized file access, bandwidth, domain, and page analytics for the
requested account.

::public end

::private

The helper reads newline-delimited JSON from the CDN activity log, combines it
with `fileFolder` metadata, and falls back to local file stats when older log
rows do not yet include byte sizes.

::private end

::end
*/
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { prisma } from '@/core/lib/db';

export const DEFAULT_ANALYTICS_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

type ActivityRecord = {
  timestamp?: string;
  event?: string;
  account_id?: string;
  path?: string;
  host?: string;
  referer?: string;
  origin?: string;
  sec_fetch_dest?: string;
  sec_fetch_site?: string;
  size?: number | string;
  status?: string;
};

type FileMetricAccumulator = {
  path: string;
  name: string;
  loads: number;
  embeddedLoads: number;
  uploadCount: number;
  egressBytes: number;
  ingressBytes: number;
  lastSeen: string | null;
  domains: Map<string, number>;
  pages: Map<string, number>;
};

type DomainMetricAccumulator = {
  domain: string;
  requests: number;
  egressBytes: number;
  pages: Set<string>;
  files: Set<string>;
  lastSeen: string | null;
};

type PageMetricAccumulator = {
  page: string;
  domain: string;
  requests: number;
  egressBytes: number;
  files: Set<string>;
  lastSeen: string | null;
};

export type DriveAnalyticsSnapshot = {
  accountId: string;
  displayName: string | null;
  generatedAt: string;
  sourceLogPath: string | null;
  totals: {
    trackedFiles: number;
    fileViews: number;
    uploads: number;
    embeddedViews: number;
    unattributedViews: number;
    egressBytes: number;
    ingressBytes: number;
  };
  topFile: {
    path: string;
    name: string;
    loads: number;
    embeddedLoads: number;
    egressBytes: number;
    lastSeen: string | null;
    topDomain: string | null;
    topPage: string | null;
  } | null;
  files: Array<{
    path: string;
    name: string;
    loads: number;
    embeddedLoads: number;
    uploadCount: number;
    egressBytes: number;
    ingressBytes: number;
    lastSeen: string | null;
    topDomain: string | null;
    topPage: string | null;
  }>;
  domains: Array<{
    domain: string;
    requests: number;
    egressBytes: number;
    pageCount: number;
    fileCount: number;
    lastSeen: string | null;
  }>;
  pages: Array<{
    page: string;
    domain: string;
    requests: number;
    egressBytes: number;
    fileCount: number;
    lastSeen: string | null;
  }>;
  recentEmbeds: Array<{
    timestamp: string;
    domain: string;
    page: string;
    fileName: string;
    filePath: string;
  }>;
};

function parseLogSize(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function normalizeStoragePath(value: string | undefined) {
  return (value || '').trim().replace(/^\/+/, '');
}

function formatFileLabel(storagePath: string) {
  const parts = storagePath.split('/');
  return parts[parts.length - 1] || storagePath;
}

function parseIsoTimestamp(value: string | undefined) {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function pickLatest(a: string | null, b: string | null) {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

function pickTopEntry(map: Map<string, number>) {
  let label: string | null = null;
  let count = -1;
  for (const [key, value] of map.entries()) {
    if (value > count) {
      label = key;
      count = value;
    }
  }
  return label;
}

function resolveSourceUrl(record: ActivityRecord) {
  const candidate = (record.referer || record.origin || '').trim();
  if (!candidate || candidate === 'about:client') return null;

  try {
    const url = new URL(candidate);
    return {
      domain: url.hostname,
      page: `${url.origin}${url.pathname}`,
    };
  } catch {
    return {
      domain: candidate,
      page: candidate,
    };
  }
}

async function readActivityLog() {
  const configured = process.env.CDN_ACTIVITY_LOG_PATH?.trim();
  const candidates = [
    configured,
    path.join(process.cwd(), 'neupcdn', 'logs', 'activity.log'),
    path.join(process.cwd(), 'logs', 'activity.log'),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    try {
      const content = await fs.readFile(candidate, 'utf8');
      return { content, sourceLogPath: candidate };
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') continue;
      throw error;
    }
  }

  return { content: '', sourceLogPath: null };
}

async function buildFileSizeLookup(accountId: string) {
  const rows = await prisma.fileFolder.findMany({
    where: { owner: accountId },
    select: {
      name: true,
      path: true,
      size: true,
    },
  });

  const lookup = new Map<string, { name: string; size: number }>();
  for (const row of rows) {
    lookup.set(normalizeStoragePath(row.path), {
      name: row.name,
      size: Number(row.size),
    });
  }

  return lookup;
}

async function resolveFileSize(
  storagePath: string,
  fileSizeLookup: Map<string, { name: string; size: number }>
) {
  const normalized = normalizeStoragePath(storagePath);
  const fromDb = fileSizeLookup.get(normalized);
  if (fromDb?.size) {
    return fromDb.size;
  }

  const configured = process.env.CDN_PUBLIC_ROOT?.trim();
  const candidates = [
    configured,
    path.join(process.cwd(), 'neupcdn', 'public'),
    path.join(process.cwd(), 'public'),
  ].filter((value): value is string => Boolean(value));

  for (const root of candidates) {
    try {
      const filePath = path.join(root, normalized);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) return stats.size;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code === 'ENOENT') continue;
    }
  }

  return 0;
}

function getOrCreateFileMetric(
  fileMetrics: Map<string, FileMetricAccumulator>,
  storagePath: string,
  fileSizeLookup: Map<string, { name: string; size: number }>
) {
  const normalized = normalizeStoragePath(storagePath);
  const existing = fileMetrics.get(normalized);
  if (existing) return existing;

  const seeded = fileSizeLookup.get(normalized);
  const created: FileMetricAccumulator = {
    path: normalized,
    name: seeded?.name || formatFileLabel(normalized),
    loads: 0,
    embeddedLoads: 0,
    uploadCount: 0,
    egressBytes: 0,
    ingressBytes: 0,
    lastSeen: null,
    domains: new Map<string, number>(),
    pages: new Map<string, number>(),
  };
  fileMetrics.set(normalized, created);
  return created;
}

export async function getDriveAnalytics(params: {
  accountId?: string;
  displayName?: string | null;
} = {}): Promise<DriveAnalyticsSnapshot> {
  const accountId = (params.accountId || DEFAULT_ANALYTICS_OWNER).trim() || DEFAULT_ANALYTICS_OWNER;
  const fileSizeLookup = await buildFileSizeLookup(accountId);
  const { content, sourceLogPath } = await readActivityLog();
  const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);

  const fileMetrics = new Map<string, FileMetricAccumulator>();
  const domainMetrics = new Map<string, DomainMetricAccumulator>();
  const pageMetrics = new Map<string, PageMetricAccumulator>();
  const recentEmbeds: DriveAnalyticsSnapshot['recentEmbeds'] = [];

  let fileViews = 0;
  let uploads = 0;
  let embeddedViews = 0;
  let unattributedViews = 0;
  let egressBytes = 0;
  let ingressBytes = 0;

  for (const line of lines) {
    let record: ActivityRecord;
    try {
      record = JSON.parse(line) as ActivityRecord;
    } catch {
      continue;
    }

    if (record.account_id !== accountId) continue;
    if (record.status && record.status !== 'served' && record.status !== 'completed') continue;

    const storagePath = normalizeStoragePath(record.path);
    if (!storagePath) continue;

    const timestamp = parseIsoTimestamp(record.timestamp);
    const fileMetric = getOrCreateFileMetric(fileMetrics, storagePath, fileSizeLookup);

    if (record.event === 'file_upload') {
      const uploadBytes = parseLogSize(record.size);
      uploads += 1;
      ingressBytes += uploadBytes;
      fileMetric.uploadCount += 1;
      fileMetric.ingressBytes += uploadBytes;
      fileMetric.lastSeen = pickLatest(fileMetric.lastSeen, timestamp);
      continue;
    }

    if (record.event !== 'file_view') continue;

    const source = resolveSourceUrl(record);
    const bytes = parseLogSize(record.size) || await resolveFileSize(storagePath, fileSizeLookup);

    fileViews += 1;
    egressBytes += bytes;
    fileMetric.loads += 1;
    fileMetric.egressBytes += bytes;
    fileMetric.lastSeen = pickLatest(fileMetric.lastSeen, timestamp);

    if (!source) {
      unattributedViews += 1;
      continue;
    }

    embeddedViews += 1;
    fileMetric.embeddedLoads += 1;
    fileMetric.domains.set(source.domain, (fileMetric.domains.get(source.domain) || 0) + 1);
    fileMetric.pages.set(source.page, (fileMetric.pages.get(source.page) || 0) + 1);

    const domainMetric = domainMetrics.get(source.domain) || {
      domain: source.domain,
      requests: 0,
      egressBytes: 0,
      pages: new Set<string>(),
      files: new Set<string>(),
      lastSeen: null,
    };
    domainMetric.requests += 1;
    domainMetric.egressBytes += bytes;
    domainMetric.pages.add(source.page);
    domainMetric.files.add(storagePath);
    domainMetric.lastSeen = pickLatest(domainMetric.lastSeen, timestamp);
    domainMetrics.set(source.domain, domainMetric);

    const pageKey = `${source.domain}::${source.page}`;
    const pageMetric = pageMetrics.get(pageKey) || {
      page: source.page,
      domain: source.domain,
      requests: 0,
      egressBytes: 0,
      files: new Set<string>(),
      lastSeen: null,
    };
    pageMetric.requests += 1;
    pageMetric.egressBytes += bytes;
    pageMetric.files.add(storagePath);
    pageMetric.lastSeen = pickLatest(pageMetric.lastSeen, timestamp);
    pageMetrics.set(pageKey, pageMetric);

    if (timestamp) {
      recentEmbeds.push({
        timestamp,
        domain: source.domain,
        page: source.page,
        fileName: fileMetric.name,
        filePath: storagePath,
      });
    }
  }

  const files = Array.from(fileMetrics.values())
    .filter((item) => item.loads > 0 || item.uploadCount > 0)
    .map((item) => ({
      path: item.path,
      name: item.name,
      loads: item.loads,
      embeddedLoads: item.embeddedLoads,
      uploadCount: item.uploadCount,
      egressBytes: item.egressBytes,
      ingressBytes: item.ingressBytes,
      lastSeen: item.lastSeen,
      topDomain: pickTopEntry(item.domains),
      topPage: pickTopEntry(item.pages),
    }))
    .sort((a, b) => {
      if (b.loads !== a.loads) return b.loads - a.loads;
      return b.egressBytes - a.egressBytes;
    });

  const domains = Array.from(domainMetrics.values())
    .map((item) => ({
      domain: item.domain,
      requests: item.requests,
      egressBytes: item.egressBytes,
      pageCount: item.pages.size,
      fileCount: item.files.size,
      lastSeen: item.lastSeen,
    }))
    .sort((a, b) => {
      if (b.requests !== a.requests) return b.requests - a.requests;
      return b.egressBytes - a.egressBytes;
    });

  const pages = Array.from(pageMetrics.values())
    .map((item) => ({
      page: item.page,
      domain: item.domain,
      requests: item.requests,
      egressBytes: item.egressBytes,
      fileCount: item.files.size,
      lastSeen: item.lastSeen,
    }))
    .sort((a, b) => {
      if (b.requests !== a.requests) return b.requests - a.requests;
      return b.egressBytes - a.egressBytes;
    });

  recentEmbeds.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));

  const topFile = files[0]
    ? {
        path: files[0].path,
        name: files[0].name,
        loads: files[0].loads,
        embeddedLoads: files[0].embeddedLoads,
        egressBytes: files[0].egressBytes,
        lastSeen: files[0].lastSeen,
        topDomain: files[0].topDomain,
        topPage: files[0].topPage,
      }
    : null;

  return {
    accountId,
    displayName: params.displayName || null,
    generatedAt: new Date().toISOString(),
    sourceLogPath,
    totals: {
      trackedFiles: fileSizeLookup.size,
      fileViews,
      uploads,
      embeddedViews,
      unattributedViews,
      egressBytes,
      ingressBytes,
    },
    topFile,
    files: files.slice(0, 12),
    domains: domains.slice(0, 12),
    pages: pages.slice(0, 12),
    recentEmbeds: recentEmbeds.slice(0, 10),
  };
}
