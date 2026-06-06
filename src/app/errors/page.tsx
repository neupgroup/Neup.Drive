'use client';

import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ErrorLog {
    id: string;
    on_page: string;
    context: string;
    created_on: string;
}

function parseLogContext(context: string) {
    try {
        return JSON.parse(context);
    } catch {
        return null;
    }
}

export default function ErrorsPage() {
    const [errors, setErrors] = React.useState<ErrorLog[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchErrors = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/log-error');
            if (res.ok) {
                const data = await res.json();
                setErrors(data);
            }
        } catch (error) {
            console.error('Failed to fetch errors:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchErrors();
    }, [fetchErrors]);

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

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Error Log</CardTitle>
                        <CardDescription>
                            Showing last 100 errors
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchErrors} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Context / Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {errors.length === 0 && !loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            No errors recorded.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    errors.map((error) => (
                                        <TableRow key={error.id}>
                                            <TableCell>
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            </TableCell>
                                            <TableCell className="font-medium">{error.on_page}</TableCell>
                                            <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                                                {formatDistanceToNow(new Date(error.created_on), { addSuffix: true })}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                <pre className="max-w-[600px] overflow-auto whitespace-pre-wrap">
                                                    {JSON.stringify(parseLogContext(error.context), null, 2) || error.context}
                                                </pre>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
