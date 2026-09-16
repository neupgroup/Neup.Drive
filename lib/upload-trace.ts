import logica from '@neup/logica';

export async function logUploadTrace(onPage: string, message: string, context: Record<string, unknown> = {}) {
    const lowerMessage = message.toLowerCase();
    if (!lowerMessage.includes('failed') && !lowerMessage.includes('error')) return;

    try {
        await logica.logger.type('UPLOAD_TRACE').data({ onPage, message, ...context }).log();
    } catch {
        console.log(`Error happened of type "UPLOAD_TRACE": ${message}`);
    }
}
