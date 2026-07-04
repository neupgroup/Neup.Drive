import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageStoragePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Storage</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Inspect storage tiers, capacity usage, and file distribution across Drive systems.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Controls</CardTitle>
          <CardDescription>
            This page is reserved for storage management, tier controls, and capacity reporting.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Connect operational storage tools here when the management workflows are ready.
        </CardContent>
      </Card>
    </div>
  );
}
