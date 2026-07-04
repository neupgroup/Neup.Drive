import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageProfilesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Profiles</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Review internal profile records, roles, and related account ownership details.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Directory</CardTitle>
          <CardDescription>
            This section is prepared for member profiles and role-management tools.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Add profile management widgets here as those backend surfaces are wired in.
        </CardContent>
      </Card>
    </div>
  );
}
