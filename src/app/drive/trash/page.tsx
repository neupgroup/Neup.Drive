import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function TrashPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Trash</h1>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Trash2 className="mx-auto h-12 w-12" />
          <p className="mt-4">Items in your trash will appear here.</p>
          <p className="text-sm">Items are deleted forever after 30 days.</p>
        </CardContent>
      </Card>
    </div>
  );
}
