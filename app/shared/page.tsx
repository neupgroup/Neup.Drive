import { Card, CardContent } from "@/components/ui/card";
import { Share } from "lucide-react";

export default function SharedPage() {
  return (
    <div>
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Shared with me</h1>
        <p className="text-sm text-muted-foreground">
          Files and folders other people have shared with your account.
        </p>
      </div>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Share className="mx-auto h-12 w-12" />
          <p className="mt-4">Files and folders shared with you will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
