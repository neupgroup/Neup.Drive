import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function TeamDrivesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Team Drives</h1>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Users className="mx-auto h-12 w-12" />
          <p className="mt-4">Your team drives will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
