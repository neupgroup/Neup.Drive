import type { ImagePlaceholder } from './placeholder-images';

export type User = {
  id: string;
  name: string;
  avatar: ImagePlaceholder;
};

export type FileOrFolder = {
  id: string;
  name: string;
  type: 'folder' | 'doc' | 'pdf' | 'jpg' | 'png' | 'mp4';
  size: string | null;
  lastModified: string;
  members: User[];
  thumbnail?: ImagePlaceholder;
};
