import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Step 6: Finalization - Server Callback
 * This endpoint is called by the CDN when an upload is verified and completed.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { upload_session_id, file_hash, status, metadata } = body;

        console.log('Received upload callback:', {
            upload_session_id,
            status,
            file_hash
        });

        // Verify the callback source (e.g., check shared secret or signature)
        // const signature = request.headers.get('x-callback-signature');
        // if (!verifySignature(signature, body)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });

        if (status === 'verified') {
            // Update file status in database
            const updated = await prisma.file.updateMany({
                where: {
                    path: metadata.path,
                    // We can also verify hash matches if needed, but path is strong enough for this demo
                },
                data: {
                    status: 'VERIFIED',
                    hash: file_hash // Ensure hash is consistent
                }
            });

            if (updated.count > 0) {
                console.log('✅ File verified and finalized in DB:', metadata.path);
            } else {
                console.warn('⚠️ File record not found for verification:', metadata.path);
            }
            
            return NextResponse.json({ success: true });
        } else {
            console.warn('❌ File verification failed:', metadata);
            // Handle failure cleanup - mark as FAILED
            await prisma.file.updateMany({
                where: { path: metadata.path },
                data: { status: 'FAILED' }
            });
            return NextResponse.json({ success: true }); // Acknowledge receipt even for failures
        }

    } catch (error) {
        console.error('Callback processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
