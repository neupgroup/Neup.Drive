import type { LucideProps } from 'lucide-react';
import { File, FileImage, FileQuestion, FileText, FileVideo, Folder, Music } from 'lucide-react';
import type { FileOrFolder } from '@/core/lib/types';

export function FileIcon({ type, ...props }: { type: FileOrFolder['type'] } & LucideProps) {
  switch (type) {
    case 'folder':
      return <Folder {...props} />;
    case 'doc':
      return <FileText {...props} />;
    case 'pdf':
      return <FileText {...props} />;
    case 'jpg':
    case 'png':
      return <FileImage {...props} />;
    case 'mp4':
      return <FileVideo {...props} />;
    case 'audio':
      return <Music {...props} />;
    case 'unknown':
      return <FileQuestion {...props} />;
    default:
      return <File {...props} />;
  }
}
