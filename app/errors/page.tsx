/*
::neup.documentation::errors-page
::function ErrorsPage()
::title Errors Page
::owner Neup Drive

::public

Renders the application error dashboard with a paginated list of error entries.

::returns
::datatype JSX.Element

The `/errors` page UI.

::public end

::private

The page fetches 10 errors at a time from `/bridge/api.v1/log-error` and keeps
pagination state on the client so operators can move through older entries
without leaving the page.

::private end

::end
*/
'use client';

import * as React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface ErrorLog {
    id: string;
    on_page: string;
    context: string;
    created_on: string;
}

interface ErrorLogResponse {
    items: ErrorLog[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const PAGE_SIZE = 10;
const MIN_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePageParam(value: string | null) {
    const parsed = Number(value ?? '1');
    if (!Number.isFinite(parsed) || parsed < 1) {
        return 1;
    }

    return Math.floor(parsed);
}

function parsePageSizeParam(value: string | null) {
    const parsed = Number(value ?? String(PAGE_SIZE));
    if (!Number.isFinite(parsed)) {
        return PAGE_SIZE;
    }

    const normalized = Math.floor(parsed);
    if (normalized < MIN_PAGE_SIZE || normalized > MAX_PAGE_SIZE) {
        return PAGE_SIZE;
    }

    return normalized;
}

function parseLogContext(context: string) {
    try {
        return JSON.parse(context);
    } catch {
        return null;
    }
}

function formatLogContext(context: string) {
    const parsed = parseLogContext(context);
    return parsed === null ? context : JSON.stringify(parsed, null, 2);
}

export default function ErrorsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [errors, setErrors] = React.useState<ErrorLog[]>([]);
    const [totalPages, setTotalPages] = React.useState(1);
    const [loading, setLoading] = React.useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = React.useState(false);
    const [lastResolvedCount, setLastResolvedCount] = React.useState(PAGE_SIZE);
    const page = React.useMemo(() => parsePageParam(searchParams.get('page')), [searchParams]);
    const pageSize = React.useMemo(() => parsePageSizeParam(searchParams.get('pagesize')), [searchParams]);

    const updateQuery = React.useCallback((nextPage: number, nextPageSize: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(nextPage));
        params.set('pagesize', String(nextPageSize));
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const fetchErrors = React.useCallback(async (nextPage: number, nextPageSize: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(nextPage),
                pagesize: String(nextPageSize),
            });
            const res = await fetch(`/bridge/api.v1/log-error?${params.toString()}`);
            if (res.ok) {
                const data: ErrorLogResponse = await res.json();
                setErrors(data.items);
                setTotalPages(data.totalPages);
                setLastResolvedCount(data.items.length || nextPageSize);
                setHasLoadedOnce(true);

                if (data.page !== nextPage || data.pageSize !== nextPageSize) {
                    updateQuery(data.page, data.pageSize);
                }
            }
        } catch (error) {
            console.error('Failed to fetch errors:', error);
        } finally {
            setLoading(false);
        }
    }, [updateQuery]);

    React.useEffect(() => {
        fetchErrors(page, pageSize);
    }, [fetchErrors, page, pageSize]);

    const skeletonCount = hasLoadedOnce ? lastResolvedCount : pageSize;

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">
                    System Errors
                </h1>
                <p className="text-muted-foreground">
                    Log of recent application errors for debugging.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: skeletonCount }).map((_, index) => (
                                <div
                                    key={`skeleton-${index}`}
                                    className="rounded-xl border border-border/70 bg-background p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <Skeleton className="h-5 w-56 max-w-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-4/5" />
                                        <Skeleton className="h-16 w-full rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : errors.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                            No errors recorded.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {errors.map((error) => (
                                <div key={error.id} className="rounded-xl border border-border/70 bg-background p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 rounded-full bg-destructive/10 p-2">
                                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-base font-medium break-words">{error.on_page}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(new Date(error.created_on), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <pre className="mt-4 w-full overflow-hidden rounded-md bg-muted/50 p-4 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
                                        {formatLogContext(error.context)}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-4">
                        <p className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuery(Math.max(1, page - 1), pageSize)}
                                disabled={loading || page <= 1}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuery(Math.min(totalPages, page + 1), pageSize)}
                                disabled={loading || page >= totalPages}
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
