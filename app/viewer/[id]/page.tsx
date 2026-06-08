import Link from 'next/link';
import { ArrowLeft, Download, ExternalLink, FileQuestion } from 'lucide-react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Prisma } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/core/lib/db';
import { createBridgeFileUrl, isActiveFileDetails } from '@/core/lib/bridge-api';

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function getMimeType(details: Prisma.JsonObject) {
  return typeof details.mimeType === 'string' ? details.mimeType : 'application/octet-stream';
}

function getDeviceIpFromHeaders(requestHeaders: Headers) {
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || '';

  return (
    requestHeaders.get('cf-connecting-ip') ||
    requestHeaders.get('x-real-ip') ||
    ''
  );
}

function viewerForMime(params: { mimeType: string; name: string; viewUrl: string }) {
  const { mimeType, name, viewUrl } = params;

  if (mimeType.startsWith('image/')) {
    return (
      <div className="flex min-h-[60vh] w-full min-w-0 items-center justify-center overflow-hidden bg-slate-50 p-4">
        <img src={viewUrl} alt={name} className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-sm" />
      </div>
    );
  }

  if (mimeType.startsWith('video/')) {
    return (
      <div className="w-full min-w-0 overflow-hidden bg-black">
        <video controls className="block max-h-[75vh] w-full max-w-full object-contain">
          <source src={viewUrl} type={mimeType} />
        </video>
      </div>
    );
  }

  if (mimeType.startsWith('audio/')) {
    return (
      <div className="flex min-h-[45vh] w-full min-w-0 items-center justify-center overflow-hidden bg-slate-50 p-8">
        <audio controls className="w-full max-w-2xl">
          <source src={viewUrl} type={mimeType} />
        </audio>
      </div>
    );
  }

  if (mimeType === 'application/pdf') {
    return <iframe src={viewUrl} title={name} className="h-[75vh] w-full max-w-full bg-white" />;
  }

  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-4 bg-slate-50 p-8 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <div>
        <h2 className="text-lg font-semibold">Preview is not available</h2>
        <p className="mt-1 text-sm text-muted-foreground">Open or download the file to view it.</p>
      </div>
      <Button asChild>
        <a href={viewUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open file
        </a>
      </Button>
    </div>
  );
}

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const file = await prisma.fileFolder.findUnique({
    where: { id: decodeURIComponent(id) },
  });

  if (!file) notFound();

  const details = getDetails(file.details);
  if (!isActiveFileDetails(file.details)) notFound();

  const requestHeaders = await headers();
  const tokenOptions = {
    deviceIp: getDeviceIpFromHeaders(requestHeaders),
    userAgent: requestHeaders.get('user-agent') || '',
  };
  const viewUrl = createBridgeFileUrl(file, 'view', tokenOptions);
  const downloadUrl = createBridgeFileUrl(file, 'download', tokenOptions);
  const mimeType = getMimeType(details);

  return (
    <div className="w-full min-w-0 space-y-4 overflow-hidden">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0 flex-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="max-w-full break-words text-2xl font-bold tracking-tight">{file.name}</h1>
          <p className="break-words text-sm text-muted-foreground">{mimeType}</p>
        </div>
      </div>

      <Card className="w-full min-w-0 overflow-hidden">
        <CardContent className="p-0">
          {viewerForMime({ mimeType, name: file.name, viewUrl })}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-start gap-2">
        <Button variant="outline" asChild>
          <a href={viewUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open
          </a>
        </Button>
        <Button asChild>
          <a href={downloadUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}
