import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Database,
  HardDrive,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const managementLinks = [
  {
    href: '/manage/profiles',
    icon: Users,
    title: 'Profiles',
    description: 'Review internal profiles, roles, and account ownership details.',
  },
  {
    href: '/manage/storage',
    icon: HardDrive,
    title: 'Storage',
    description: 'Inspect storage tiers, capacity usage, and Drive storage distribution.',
  },
  {
    href: '/manage/analytics',
    icon: BarChart3,
    title: 'Analytics',
    description: 'Monitor operational metrics, upload activity, and internal reporting trends.',
  },
  {
    href: '/errors',
    icon: AlertCircle,
    title: 'System Errors',
    description: 'Inspect recent application errors and debugging context.',
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
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Manage</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Monitor core Drive operations, account connections, upload flows, and system health.
          </p>
        </div>
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
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8"
              >
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
