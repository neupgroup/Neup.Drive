/*
::neup.documentation::activity-route
::api POST /bridge/api.v1/activity
::title Filefolder Activity Route
::owner Neup Drive

::public

Records activity used by recents and suggestion features, including folder-open
 events that originate from client-side navigation.

::param action
::location body

The activity action to record. Currently supports `folder_opened`.

::end
*/
import { NextRequest, NextResponse } from 'next/server';
import { handleServerError } from '@/core/lib/error-server';
import { upsertFolderActivity } from '@/core/lib/filefolder';

interface RecordActivityRequest {
  action?: 'folder_opened';
  mode?: 'drive' | 'webdisk';
  folder_type?: 'drive' | 'assets' | 'signed';
  folder_path?: string;
  owner?: string;
}

const DRIVE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

export async function POST(request: NextRequest) {
  let body: RecordActivityRequest | undefined;

  try {
    body = await request.json();

    if (body?.action !== 'folder_opened') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    if (!body.folder_type || !body.folder_path) {
      return NextResponse.json({ error: 'folder_type and folder_path are required' }, { status: 400 });
    }

    const mode = body.mode === 'webdisk' ? 'webdisk' : 'drive';
    const owner = body.owner?.trim() || (mode === 'webdisk' ? WEBDISK_ACCOUNT_ID : DRIVE_OWNER);
    const folderType = body.folder_type;

    if (mode === 'drive' && folderType !== 'drive') {
      return NextResponse.json({ error: 'Drive folder activity must use the drive folder type' }, { status: 400 });
    }

    if (mode === 'webdisk' && folderType === 'drive') {
      return NextResponse.json({ error: 'WebDisk folder activity must use assets or signed' }, { status: 400 });
    }

    const record = await upsertFolderActivity({
      owner,
      mode,
      folderType,
      folderPath: body.folder_path,
      action: 'folder_opened',
    });

    return NextResponse.json({
      success: true,
      filefolder: {
        id: record.id,
        path: record.path,
        totalActivity: record.totalActivity,
        lastActivityOn: record.lastActivityOn,
      },
    }, { status: 200 });
  } catch (error) {
    return handleServerError(error, '/bridge/api.v1/activity', { method: 'POST', body });
  }
}
