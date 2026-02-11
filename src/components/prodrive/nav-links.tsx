'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HardDrive, Share, Trash2, Globe, Clock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinksData = [
  { href: '/', icon: HardDrive, label: 'Drive' },
  { href: '/recents', icon: Clock, label: 'Recent' },
  { href: '/shared', icon: Share, label: 'Shared' },
  { href: '/webdisk', icon: Globe, label: 'WebDisk' },
  { href: '/errors', icon: AlertCircle, label: 'System Errors' },
  { href: '/trash', icon: Trash2, label: 'Trash' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {navLinksData.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Button
            key={link.href}
            variant="ghost"
            asChild
            className={cn(
              'justify-start',
              isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary'
            )}
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export function MobileNavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinksData.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-4 px-2.5',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
