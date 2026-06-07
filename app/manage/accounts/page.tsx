import React from 'react';
import { prisma } from '@/core/lib/db';

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({ orderBy: { created_on: 'desc' }, take: 200 });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Accounts</h1>
      <div className="space-y-2">
        {accounts.map((a) => (
          <div key={a.id} className="p-3 border rounded">
            <div className="font-medium">{a.display_name ?? '(no display name)'}</div>
            <div className="text-sm text-muted-foreground">ID: {a.id}</div>
            <div className="text-sm">Connection: {a.connection_id ?? '-'}</div>
            <div className="text-sm">Neupid: {a.neupid ?? '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
