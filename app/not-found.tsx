import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-6">
                        <FileQuestion className="h-24 w-24 text-primary" />
                    </div>
                </div>

                <h1 className="mb-2 text-6xl font-bold font-headline tracking-tight">404</h1>
                <h2 className="mb-4 text-2xl font-semibold text-muted-foreground">Page Not Found</h2>

                <p className="mb-8 max-w-md text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for. The file or folder you're trying to access may have been moved or deleted.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/">
                            Go to My Drive
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/shared">
                            View Shared Files
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
