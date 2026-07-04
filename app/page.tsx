import { FileManager } from '@/components/prodrive/file-manager';
import { getDriveFiles } from '@/core/lib/drive-files';

export default async function Home() {
  const files = await getDriveFiles();
  return <FileManager initialFiles={files} />;
}
