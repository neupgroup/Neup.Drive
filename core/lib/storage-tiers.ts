export type StorageTier = 'cold' | 'warm' | 'hot';

export const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024;

export function storageTierFromStoredAs(storedAs?: string | null): StorageTier {
  if (storedAs === 'assets') return 'hot';
  if (storedAs === 'signed') return 'warm';
  return 'cold';
}

export function storageTierFromWebdiskType(type?: string | null): StorageTier {
  if (type === 'assets') return 'hot';
  if (type === 'signed') return 'warm';
  return 'cold';
}

export function formatStorageBytes(size: bigint | number | null | undefined) {
  const bytes = Number(size ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function storageTierLabel(tier: StorageTier) {
  if (tier === 'hot') return 'Hot';
  if (tier === 'warm') return 'Warm';
  return 'Cold';
}

export function storageTierBadgeClass(tier: StorageTier) {
  if (tier === 'hot') return 'border-red-200 bg-red-50 text-red-700';
  if (tier === 'warm') return 'border-orange-200 bg-orange-50 text-orange-700';
  return 'border-blue-200 bg-blue-50 text-blue-700';
}

export function storageTierDotClass(tier: StorageTier) {
  if (tier === 'hot') return 'bg-red-500';
  if (tier === 'warm') return 'bg-orange-500';
  return 'bg-blue-500';
}
