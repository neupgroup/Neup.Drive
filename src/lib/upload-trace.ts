export async function logUploadTrace(onPage: string, message: string, context: Record<string, unknown> = {}) {
    try {
        await fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                on_page: onPage,
                context: {
                    type: 'UPLOAD_TRACE',
                    message,
                    ...context,
                },
            }),
        });
    } catch (error) {
        console.error('Failed to report upload trace:', error);
    }
}
