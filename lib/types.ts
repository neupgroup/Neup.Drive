/*
::neup.documentation::shared-types
::title Shared UI Types
::owner Neup Drive

::public

Shared TypeScript shapes used by Drive and WebDisk UI components.

::public end

::end
*/
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
  isPending?: boolean;
  type: 'action' | 'folder' | 'doc' | 'pdf' | 'jpg' | 'png' | 'mp4' | 'audio' | 'unknown';
  size: string | null;
  storageTier: StorageTier;
  lastModified: string;
  members: User[];
  thumbnail?: ImagePlaceholder;
  actionHref?: string;
  description?: string;
  locationType?: 'drive' | 'assets' | 'signed';
  navigationPath?: string;
  secondaryNavigationPrefix?: string;
  secondaryNavigationLabel?: string;
  secondaryNavigationPath?: string;
  secondaryActionLabel?: string;
};
