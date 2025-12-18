import type { LucideProps } from 'lucide-react';
import { File, FileImage, FileText, FileVideo, Folder } from 'lucide-react';
import type { FileOrFolder } from '@/lib/types';

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
    default:
      return <File {...props} />;
  }
}
