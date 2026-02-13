import { Card, CardContent } from "@/components/ui/card";
import { Globe, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WebdiskPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tight">WebDisk</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Link>
        </Button>
      </div>
      <Card className="flex h-96 items-center justify-center">
        <CardContent className="text-center text-muted-foreground pt-6">
          <Globe className="mx-auto h-12 w-12" />
          <p className="mt-4">Your WebDisk files will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
