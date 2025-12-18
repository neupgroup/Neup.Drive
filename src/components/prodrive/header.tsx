'use client';
import Link from 'next/link';
import { PanelLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/icons';
import { MobileNavLinks } from './nav-links';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';


function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs bg-card">
        <nav className="flex h-full flex-col gap-6 text-lg font-medium">
          <Link href="/drive" className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base">
            <Logo className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">ProDrive</span>
          </Link>
          <MobileNavLinks />
          <div className="mt-auto">
            <Card>
              <CardHeader>
                <CardTitle>Upgrade to Pro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 mt-2 text-center text-2xl font-bold">$10 <span className="text-base font-normal text-muted-foreground">/month</span></div>
                <Button size="sm" className="w-full">Upgrade</Button>
              </CardContent>
            </Card>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}


export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <MobileSidebar />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search files..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
        </header>
    );
}
