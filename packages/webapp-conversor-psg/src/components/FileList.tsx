import { FileRow } from './FileRow';
import type { ProcessedFile } from '@/hooks/usePsgFiles';

interface FileListProps {
  files: ProcessedFile[];
  onRemove: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="file-list">
      {files.map((f) => (
        <FileRow key={f.id} file={f} onRemove={onRemove} />
      ))}
    </div>
  );
}
