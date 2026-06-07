import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Database,
  HardDrive,
  Settings,
  Upload,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const managementLinks = [
  {
    href: '/manage/accounts',
    icon: Users,
    title: 'Accounts',
    description: 'Review connected accounts, Neup IDs, and bridge connection details.',
  },
  {
    href: '/errors',
    icon: AlertCircle,
    title: 'System Errors',
    description: 'Inspect recent application errors and debugging context.',
  },
  {
    href: '/uploads',
    icon: Upload,
    title: 'Upload Center',
    description: 'Open the upload workflow and monitor browser-side upload progress.',
  },
  {
    href: '/webdisk',
    icon: HardDrive,
    title: 'WebDisk',
    description: 'Check CDN-backed file records and storage integrations.',
  },
];

const systemStats = [
  { label: 'Storage mode', value: 'CDN-backed' },
  { label: 'Account bridge', value: 'Enabled' },
  { label: 'Upload hashing', value: 'SHA-256' },
];

export default function ManagePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1 text-sm text-muted-foreground">
            <Settings className="h-4 w-4" />
            Administration
          </div>
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Manage</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Monitor core Drive operations, account connections, upload flows, and system health.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/manage/accounts">
            View Accounts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {systemStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {managementLinks.map((item) => (
          <Card key={item.href} className="transition-colors hover:bg-muted/30">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="rounded-md border bg-background p-2">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href={item.href}>
                  Open
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="rounded-md border bg-background p-2">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Operational Notes</CardTitle>
            <CardDescription>
              Use this page as the main entry point for internal Drive maintenance tasks.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
