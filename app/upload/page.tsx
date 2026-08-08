/*
::neup.documentation::upload-page
::route /upload
::title Upload Page
::owner Neup Drive

::public

Renders the upload center for the currently signed-in account and scopes all
new uploads to that account.

::returns
::datatype Promise<JSX.Element>

The upload center UI or an authentication-required state when no signed-in
account is available.

::public end

::private

The page resolves the current account from the `auth_account` cookie on the
server so the client upload flow cannot fall back to the demo owner.

::private end

::end
*/
import { FileUpload } from '@/components/prodrive/file-upload';
import { makeAppPath } from '@/core/appconfig';
import { getCookie } from '@/core/helpers/cookie';
import { resolveAuthenticatedAccountId } from '@/lib/bridge-api';

const WEBDISK_TYPES = ['assets', 'signed'] as const;

function normalizeWebdiskType(value: string | string[] | undefined) {
    const rawValue = Array.isArray(value) ? value[0] : value;
    return rawValue && WEBDISK_TYPES.includes(rawValue as (typeof WEBDISK_TYPES)[number]) ? rawValue : 'assets';
}

function normalizeUploadPath(value: string | string[] | undefined) {
    const rawValue = Array.isArray(value) ? value[0] : value;
    return (rawValue || '').trim().replace(/^\/+/, '');
}

async function getSignedInAccountId() {
    return resolveAuthenticatedAccountId(await getCookie('auth_account'));
}

export default async function UploadPage({
    searchParams,
}: {
    searchParams?: Promise<{
        saveto?: string | string[];
        type?: string | string[];
        path?: string | string[];
    }>;
}) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const accountId = await getSignedInAccountId();
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';
    const saveTo = Array.isArray(resolvedSearchParams?.saveto)
        ? resolvedSearchParams?.saveto[0]
        : resolvedSearchParams?.saveto;
    const webdiskType = normalizeWebdiskType(resolvedSearchParams?.type);
    const webdiskPath = normalizeUploadPath(resolvedSearchParams?.path);
    const drivePath = normalizeUploadPath(resolvedSearchParams?.path);
    const uploadMode = saveTo === 'webdisk' ? 'webdisk' as const : 'drive' as const;
    const params = new URLSearchParams();

    params.set('folder_type', saveTo === 'webdisk' ? webdiskType : uploadMode);

    if (saveTo === 'webdisk') {
        params.set('saveto', 'webdisk');
        if (webdiskPath) params.set('path', webdiskPath);
    } else if (drivePath) {
        params.set('path', drivePath);
    }

    const uploadInitEndpoint = makeAppPath(`/bridge/api.v1/upload/init?${params.toString()}`);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="mb-2 text-3xl font-bold font-headline tracking-tight">
                    Upload Center
                </h1>
                <p className="text-muted-foreground">
                    {saveTo === 'webdisk'
                        ? `Uploading to WebDisk /${webdiskType}${webdiskPath ? `/${webdiskPath}` : ''}`
                        : drivePath
                            ? `Uploading to Drive /${drivePath}`
                            : 'Upload files directly to your drive'}
                </p>
            </div>

            {accountId ? (
                <FileUpload
                    accountId={accountId}
                    keyId={keyId}
                    secretKey={secretKey}
                    uploadPath="uploads"
                    uploadMode={uploadMode}
                    uploadInitEndpoint={uploadInitEndpoint}
                />
            ) : (
                <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
                    Sign in to upload files to your account.
                </div>
            )}
        </div>
    );
}
