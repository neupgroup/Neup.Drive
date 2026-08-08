import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { NavLinks } from '@/components/prodrive/nav-links';
import type { Prisma } from '@/core/database/prisma';
import { prisma } from '@/core/database/prisma';
import { isActiveFileDetails } from '@/lib/bridge-api';
import {
  formatStorageBytes,
  STORAGE_LIMIT_BYTES,
  storageTierFromStoredAs,
  type StorageTier,
} from '@/lib/storage-tiers';
import { getCookie } from '@/core/helpers/cookie';
import { account } from '@/logica/account';

const STORAGE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const DEFAULT_ACCOUNT_LABEL = 'Signed out';
const DEFAULT_ACCOUNT_SECONDARY_LABEL = 'No connected account';

function isFileFolderSchemaDriftError(error: unknown) {
  return (
    error instanceof Error &&
    (
      ('code' in error && error.code === 'P2022') ||
      error.message.includes('The column') ||
      error.message.includes('stored_as')
    )
  );
}

function isFileFolderUnavailableError(error: unknown) {
  return (
    error instanceof Error &&
    (
      ('code' in error && typeof error.code === 'string' && (
        error.code === 'P2022' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'P1001'
      )) ||
      error.message.includes('The column') ||
      error.message.includes('stored_as') ||
      error.message.includes('Can\'t reach database server') ||
      error.message.includes('ECONNREFUSED')
    )
  );
}

type SignedInAccountInfo = {
  accountId: string;
  displayName: string | null;
  displayImage: string | null;
  neupid: string | null;
};

async function getSignedInAccountInfo(): Promise<SignedInAccountInfo | null> {
  const authAccountToken = (await getCookie('auth_account'))?.trim();
  if (!authAccountToken) return null;

  const response = await account.lookup.current.get(authAccountToken, [
    'accountId',
    'displayName',
    'displayImage',
    'neupid',
  ]);

  if (!response.ok || !response.body.success || !response.body.accountId) {
    return null;
  }

  return {
    accountId: response.body.accountId,
    displayName: response.body.displayName || null,
    displayImage: response.body.displayImage || null,
    neupid: response.body.neupid || null,
  };
}

async function getStorageUsage(owner: string) {
  let rows: Array<{
    size: bigint;
    details: Prisma.JsonValue;
    stored_as: string;
  }>;

  try {
    rows = await prisma.fileFolder.findMany({
      where: { owner },
      select: {
        size: true,
        stored_as: true,
        details: true,
      },
    });
  } catch (error) {
    if (!isFileFolderUnavailableError(error)) throw error;

    let fallbackRows: Array<{
      size: bigint;
      details: Prisma.JsonValue;
    }>;
    try {
      fallbackRows = await prisma.fileFolder.findMany({
        where: { owner },
        select: {
          size: true,
          details: true,
        },
      });
    } catch (fallbackError) {
      if (!isFileFolderUnavailableError(fallbackError)) throw fallbackError;
      return {
        totals: { cold: 0, warm: 0, hot: 0 },
        used: 0,
        empty: STORAGE_LIMIT_BYTES,
      };
    }

    rows = fallbackRows.map((row) => ({
      ...row,
      stored_as: 'drive',
    }));
  }

  const totals: Record<StorageTier, number> = {
    cold: 0,
    warm: 0,
    hot: 0,
  };

  for (const row of rows) {
    if (!isActiveFileDetails(row.details)) continue;
    totals[storageTierFromStoredAs(row.stored_as)] += Number(row.size || 0);
  }

  const used = totals.cold + totals.warm + totals.hot;
  const empty = Math.max(STORAGE_LIMIT_BYTES - used, 0);

  return { totals, used, empty };
}

function segmentWidth(bytes: number) {
  return `${Math.max(0, Math.min(100, (bytes / STORAGE_LIMIT_BYTES) * 100))}%`;
}

function tierTitle(tier: StorageTier) {
  if (tier === 'cold') return 'Cold Storage';
  if (tier === 'warm') return 'Warm Storage';
  return 'Hot Storage';
}

export async function Sidebar() {
  const signedInAccount = await getSignedInAccountInfo();
  const storage = await getStorageUsage(signedInAccount?.accountId || STORAGE_OWNER);
  const usedPercent = Math.min(100, (storage.used / STORAGE_LIMIT_BYTES) * 100);
  const storageTiers: Array<{ tier: StorageTier; color: string }> = [
    { tier: 'cold', color: 'bg-blue-500' },
    { tier: 'warm', color: 'bg-orange-500' },
    { tier: 'hot', color: 'bg-red-500' },
  ];
  const visibleTiers = storageTiers.filter(({ tier }) => storage.totals[tier] > 0);
  const displayName = signedInAccount?.displayName || signedInAccount?.neupid || DEFAULT_ACCOUNT_LABEL;
  const secondaryLabel = signedInAccount?.neupid || signedInAccount?.accountId || DEFAULT_ACCOUNT_SECONDARY_LABEL;
  const avatarFallback = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() || '')
    .join('') || 'NA';

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] z-0 hidden w-64 flex-col border-r bg-white sm:flex">
      <nav className="flex flex-col gap-4 p-4 sm:py-5">
        <NavLinks />
      </nav>
      <div className="mt-auto flex flex-col gap-4 p-4">
        <Card className="bg-background">
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle className="text-base font-medium">Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <div className="text-center text-sm text-muted-foreground">
              <span className="font-bold">{formatStorageBytes(storage.used)}</span> of {formatStorageBytes(STORAGE_LIMIT_BYTES)} used
            </div>
            <div
              className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-100"
              aria-label={`${usedPercent.toFixed(1)}% storage used`}
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number(usedPercent.toFixed(1))}
            >
              <div className="h-full bg-blue-500" style={{ width: segmentWidth(storage.totals.cold) }} />
              <div className="h-full bg-orange-500" style={{ width: segmentWidth(storage.totals.warm) }} />
              <div className="h-full bg-red-500" style={{ width: segmentWidth(storage.totals.hot) }} />
              <div className="h-full bg-slate-200" style={{ width: segmentWidth(storage.empty) }} />
            </div>
            {visibleTiers.length > 0 ? (
              <TooltipProvider>
                <div className="mt-3 flex items-center justify-center gap-3">
                  {visibleTiers.map(({ tier, color }) => (
                    <Tooltip key={tier}>
                      <TooltipTrigger
                        type="button"
                        className="inline-flex h-3 w-3 items-center justify-center rounded-full"
                        aria-label={`${tierTitle(tier)}: ${formatStorageBytes(storage.totals[tier])}`}
                      >
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        {tierTitle(tier)}: {formatStorageBytes(storage.totals[tier])}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            ) : null}
          </CardContent>
          <CardFooter className="p-2 pt-0 md:p-4">
            <Button size="sm" className="w-full">
              Upgrade Storage
            </Button>
          </CardFooter>
        </Card>
        <Separator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center justify-start gap-2 p-1">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={signedInAccount?.displayImage || undefined} alt={displayName} data-ai-hint="person face" />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">{displayName}</div>
                <div className="text-xs text-muted-foreground">{secondaryLabel}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
