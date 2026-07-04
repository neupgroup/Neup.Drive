import type { ImagePlaceholder } from './placeholder-images';
import type { StorageTier } from './storage-tiers';

export type User = {
  id: string;
  name: string;
  avatar: ImagePlaceholder;
};

export type FileOrFolder = {
  id: string;
  name: string;
  type: 'action' | 'folder' | 'doc' | 'pdf' | 'jpg' | 'png' | 'mp4' | 'audio' | 'unknown';
  size: string | null;
  storageTier: StorageTier;
  lastModified: string;
  members: User[];
  thumbnail?: ImagePlaceholder;
  actionHref?: string;
  description?: string;
};
