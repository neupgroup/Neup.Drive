/*
::neup.documentation::trash-operation-route
::api POST /bridge/api.v1/trash/operation
::title Trash Operation Route
::owner Neup Drive

Handles trash-specific restore, restore-to, and permanent delete operations for
Drive and WebDisk items.

::param filefolder_id
::location body

The trashed `filefolder` record to mutate.

::param action
::location body

The requested trash operation: `restore`, `restore_to`, or
`delete_permanently`.

::end
*/
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { buildFileFolderActivityUpdate, webdiskStoredAs } from '@/core/lib/filefolder';
import { assertSafePathSegment, isMissingCdnFileError, isReservedWebdiskRootFolder, normalizeInternalPath } from '@/core/lib/bridge-api';

type TrashOperationAction = 'restore' | 'restore_to' | 'delete_permanently';
type TrashDestinationType = 'drive' | 'assets' | 'signed';

interface TrashOperationRequest {
  filefolder_id?: string;
  action?: TrashOperationAction;
  destination_type?: TrashDestinationType;
  destination_path?: string;
}

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
const CDN_OPERATION_BASE = getCdnOperationBase();

function getCdnOperationBase() {
  const explicit = process.env.CDN_OPERATION_URL;
  if (!explicit) return `${CDN_BASE_URL}/operate`;

  try {
    const url = new URL(explicit);
    if (url.pathname.endsWith('/operation') || url.pathname.endsWith('/operate')) {
      return `${url.origin}/operate`;
    }
    return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
  } catch {
    return explicit.replace(/\/$/, '');
  }
}

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function normalizeDestinationType(value?: string): TrashDestinationType {
  const safeType = assertSafePathSegment((value || 'drive').trim(), 'destination_type') as TrashDestinationType;
  if (!['drive', 'assets', 'signed'].includes(safeType)) {
    throw new Error('Invalid destination_type');
  }
  return safeType;
}

function buildStoragePath(owner: string, folderType: TrashDestinationType, filename: string, internalPath?: string) {
  const normalizedPath = normalizeInternalPath(internalPath);
  return path.posix.join('uploads', owner, folderType, normalizedPath, filename);
}

async function callCdnOperation(action: 'move' | 'delete', token: string) {
  const response = await fetch(`${CDN_OPERATION_BASE}/${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-file-operation-token': token,
    },
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.success) {
    const message = data?.error || data?.message || `CDN operation failed with ${response.status}`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = typeof data?.error === 'string' ? data.error : undefined;
    throw error;
  }

  return data as { success: true; action: 'move' | 'delete'; path?: string; destination_path?: string; deleted_path?: string };
}

export async function POST(request: NextRequest) {
  let body: TrashOperationRequest | undefined;

  try {
    if (!PRIVATE_KEY) {
      return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
    }

    body = await request.json();
    if (!body?.filefolder_id || !body.action) {
      return NextResponse.json({ error: 'filefolder_id and action are required' }, { status: 400 });
    }

    if (!['restore', 'restore_to', 'delete_permanently'].includes(body.action)) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    const filefolder = await prisma.fileFolder.findUnique({
      where: { id: body.filefolder_id },
    });

    if (!filefolder || filefolder.stored_as !== 'trash') {
      return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });
    }

    const details = getDetails(filefolder.details);
    const previousMode = typeof details.previous_mode === 'string' ? details.previous_mode : '';
    const previousPath = typeof details.previous_path === 'string' ? details.previous_path : '';
    const currentPath = filefolder.path;
    const fileName = filefolder.name;

    let destinationType: TrashDestinationType;
    let destinationPath: string | undefined;
    let action: 'move' | 'delete' = 'move';

    if (body.action === 'restore') {
      if (!previousMode || !previousPath) {
        return NextResponse.json({ error: 'File cannot be restored' }, { status: 409 });
      }
      destinationType = normalizeDestinationType(previousMode);
      destinationPath = previousPath;
    } else if (body.action === 'restore_to') {
      destinationType = normalizeDestinationType(body.destination_type);
      const destinationInternalPath = normalizeInternalPath(body.destination_path);
      if (isReservedWebdiskRootFolder(destinationType, destinationInternalPath)) {
        return NextResponse.json({ error: 'The "signed" folder name is reserved at the top level of assets' }, { status: 400 });
      }
      destinationPath = buildStoragePath(filefolder.owner, destinationType, fileName, destinationInternalPath);
    } else {
      destinationType = normalizeDestinationType(previousMode || 'drive');
      action = 'delete';
    }

    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
      action,
      account_id: filefolder.owner,
      account_folder: filefolder.owner,
      folder_type: '.trash',
      path: currentPath,
      destination_path: destinationPath,
      method: 'POST',
    }, action === 'delete' ? 60 : undefined), PRIVATE_KEY);

    let cdnResult;
    if (action === 'delete') {
      try {
        cdnResult = await callCdnOperation(action, encodeSignedCdnToken(signedToken));
      } catch (error) {
        if (!isMissingCdnFileError(error)) throw error;
        cdnResult = {
          success: true as const,
          action,
          path: currentPath,
          deleted_path: currentPath,
        };
      }

      await prisma.file.deleteMany({
        where: { path: currentPath },
      });
      await prisma.fileFolder.delete({
        where: { id: filefolder.id },
      });

      return NextResponse.json({ success: true, action: body.action, cdn: cdnResult }, { status: 200 });
    }

    cdnResult = await callCdnOperation(action, encodeSignedCdnToken(signedToken));
    const finalPath = cdnResult.destination_path || destinationPath || currentPath;
    const {
      deleted_on: _deletedOn,
      deletes_in: _deletesIn,
      trash_path: _trashPath,
      ...restoredDetails
    } = details as Record<string, unknown>;
    const activityUpdate = buildFileFolderActivityUpdate({
      currentActivity: filefolder.activity,
      action: 'restored',
      details: {
        path: finalPath,
        previous_path: currentPath,
        folder_type: destinationType,
      },
    });

    const nextStoredAs = destinationType === 'drive' ? 'drivefile' : webdiskStoredAs(destinationType);

    const updated = await prisma.fileFolder.update({
      where: { id: filefolder.id },
      data: {
        path: finalPath,
        stored_as: nextStoredAs,
        details: {
          ...restoredDetails,
          mode: destinationType === 'drive' ? 'drive' : 'webdisk',
          folder_type: destinationType,
          previous_mode: '.trash',
          previous_path: currentPath,
          status: 'VERIFIED',
        },
        activity: activityUpdate.activity,
        lastActivityOn: activityUpdate.lastActivityOn,
        totalActivity: activityUpdate.totalActivity,
      },
    });

    await prisma.file.updateMany({
      where: { path: currentPath },
      data: {
        path: finalPath,
        status: 'VERIFIED',
      },
    });

    return NextResponse.json({
      success: true,
      action: body.action,
      file: {
        id: updated.id,
        path: updated.path,
        stored_as: updated.stored_as,
      },
      cdn: cdnResult,
    }, { status: 200 });
  } catch (error) {
    return handleServerError(error, '/bridge/api.v1/trash/operation', { method: 'POST', body });
  }
}
