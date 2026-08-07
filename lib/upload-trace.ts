export async function logUploadTrace(onPage: string, message: string, context: Record<string, unknown> = {}) {
    const lowerMessage = message.toLowerCase();
    if (!lowerMessage.includes('failed') && !lowerMessage.includes('error')) return;

    try {
        await fetch('/bridge/api.v1/log-error', {
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
    } catch {
        console.log(`Error happened of type "UPLOAD_TRACE": ${message}`);
    }
}
