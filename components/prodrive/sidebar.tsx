import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

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
import { Logo } from '@/components/icons';
import { NavLinks } from '@/components/prodrive/nav-links';
import { prisma } from '@/core/lib/db';
import { isActiveFileDetails } from '@/core/lib/bridge-api';
import {
  formatStorageBytes,
  STORAGE_LIMIT_BYTES,
  storageTierFromStoredAs,
  type StorageTier,
} from '@/core/lib/storage-tiers';

const STORAGE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

async function getStorageUsage() {
  const rows = await prisma.fileFolder.findMany({
    where: { owner: STORAGE_OWNER },
    select: {
      size: true,
      stored_as: true,
      details: true,
    },
  });

  const totals: Record<StorageTier, number> = {
    cold: 0,
    warm: 0,
    hot: 0,
  };

  for (const row of rows) {
    if (row.stored_as === 'trash' || !isActiveFileDetails(row.details)) continue;
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
  const storage = await getStorageUsage();
  const usedPercent = Math.min(100, (storage.used / STORAGE_LIMIT_BYTES) * 100);
  const storageTiers: Array<{ tier: StorageTier; color: string }> = [
    { tier: 'cold', color: 'bg-blue-500' },
    { tier: 'warm', color: 'bg-orange-500' },
    { tier: 'hot', color: 'bg-red-500' },
  ];
  const visibleTiers = storageTiers.filter(({ tier }) => storage.totals[tier] > 0);

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] z-0 hidden w-64 flex-col border-r bg-white sm:flex">
      <nav className="flex flex-col gap-4 p-4 sm:py-5">
        <Button className="font-semibold" size="lg" asChild>
          <Link href="/upload">
            <PlusCircle className="mr-2 h-5 w-5" />
            New
          </Link>
        </Button>
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
                      <TooltipTrigger asChild>
                        <span
                          className={`inline-block h-2.5 w-2.5 rounded-full ${color}`}
                          aria-label={`${tierTitle(tier)}: ${formatStorageBytes(storage.totals[tier])}`}
                        />
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
                <AvatarImage src="https://picsum.photos/seed/101/40/40" alt="Avatar" data-ai-hint="person face" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">Admin</div>
                <div className="text-xs text-muted-foreground">admin@prodrive.io</div>
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
