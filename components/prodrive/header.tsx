'use client';
import Link from 'next/link';
import * as React from 'react';
import { PanelLeft, Search, Upload } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons';
import { MobileNavLinks } from './nav-links';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/core/lib/utils';


function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="sm:hidden border-border bg-white text-foreground hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8"
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs bg-card">
        <nav className="flex h-full flex-col gap-6 text-lg font-medium">
          <Link
            href="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-white text-lg font-semibold text-foreground md:text-base"
          >
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Neup.Drive</span>
          </Link>
          <MobileNavLinks tone="header" />
          <div className="mt-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 mt-2 text-center text-2xl font-bold">$10 <span className="text-base font-normal text-muted-foreground">/month</span></div>
                <Button
                  size="sm"
                  className="w-full bg-blue-600 text-white hover:bg-blue-600/90 active:bg-blue-600/90"
                >
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get('q') ?? '');
  const headerNavLinks = [
    { href: '/', label: 'Files' },
    { href: '/shared', label: 'Shared' },
    { href: '/recents', label: 'Recent' },
  ];

  React.useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const handleSearchSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      router.push('/search');
      return;
    }

    const params = new URLSearchParams({ q: trimmedQuery });
    router.push(`/search?${params.toString()}`);
  }, [query, router]);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-white backdrop-blur-sm shadow-lg">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 flex items-center gap-4">
        <MobileSidebar />
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Logo className="h-6 w-6 transition-all hover:scale-110" />
          <span className="font-bold">Neup.Drive</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 ml-8">
          {headerNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8',
                  isActive ? 'bg-blue-500/12 text-blue-700' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <form onSubmit={handleSearchSubmit} className="relative flex-1 ml-auto max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="w-full rounded-lg bg-background pl-8"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </form>
        <div className="hidden sm:flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl border-border bg-white text-foreground hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8"
            asChild
          >
            <Link href="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
