import { Card, CardContent } from "@/components/ui/card";
import { Share } from "lucide-react";

export default function SharedPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-headline tracking-tight mb-4">Shared with me</h1>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Share className="mx-auto h-12 w-12" />
          <p className="mt-4">Files and folders shared with you will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
