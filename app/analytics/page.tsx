import { TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Analytics</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Review high-level Drive activity, storage usage patterns, and operational trends.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="rounded-md border bg-background p-2">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>
              This page is ready for upload, access, and storage metrics dashboards.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect reporting widgets here when analytics endpoints are available.
        </CardContent>
      </Card>
    </div>
  );
}
