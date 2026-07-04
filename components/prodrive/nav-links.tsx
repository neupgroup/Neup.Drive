'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertCircle, BarChart3, Globe, HardDrive, Home, Share, Trash2, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/core/lib/utils';

const primaryNavLinks = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/drive', icon: HardDrive, label: 'Drive' },
  { href: '/shared', icon: Share, label: 'Shared' },
  { href: '/webdisk', icon: Globe, label: 'WebDisk' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/errors', icon: AlertCircle, label: 'System Errors' },
  { href: '/trash', icon: Trash2, label: 'Trash' },
];

const managementNavLinks = [
  { href: '/manage', icon: Home, label: 'Home' },
  { href: '/manage/profiles', icon: Users, label: 'Profiles' },
  { href: '/manage/storage', icon: HardDrive, label: 'Storage' },
  { href: '/manage/analytics', icon: BarChart3, label: 'Analytics' },
];

function NavSection({
  title,
  links,
  pathname,
}: {
  title?: string;
  links: Array<{ href: string; icon: React.ComponentType<{ className?: string }>; label: string }>;
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {title ? (
        <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </div>
      ) : null}
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Button
            key={link.href}
            variant="ghost"
            asChild
            className={cn(
              'justify-start rounded-xl text-muted-foreground transition-colors hover:bg-primary/[0.07] hover:text-foreground',
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

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3">
      <NavSection links={primaryNavLinks} pathname={pathname} />
      <NavSection title="Management" links={managementNavLinks} pathname={pathname} />
    </div>
  );
}

export function MobileNavLinks({
  tone = 'default',
}: {
  tone?: 'default' | 'header';
}) {
  const pathname = usePathname();
  const activeClassName =
    tone === 'header' ? 'bg-blue-500/12 text-blue-700' : 'bg-primary/10 text-primary';
  const inactiveClassName =
    tone === 'header'
      ? 'text-muted-foreground hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8'
      : 'text-muted-foreground hover:bg-primary/[0.07] hover:text-foreground';

  return (
    <>
      <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Main
      </div>
      {primaryNavLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-4 rounded-xl px-2.5 py-2 transition-colors',
              isActive ? activeClassName : inactiveClassName
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        );
      })}
      <div className="px-2.5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Management
      </div>
      {managementNavLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-4 rounded-xl px-2.5 py-2 transition-colors',
              isActive ? activeClassName : inactiveClassName
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
