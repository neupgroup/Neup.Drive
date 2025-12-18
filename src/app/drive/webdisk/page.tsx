import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

export default function WebdiskPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">WebDisk</h1>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Globe className="mx-auto h-12 w-12" />
          <p className="mt-4">Your WebDisk files will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
