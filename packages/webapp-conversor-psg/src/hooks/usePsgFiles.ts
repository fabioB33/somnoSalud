import { useCallback, useState } from 'react';

import {
  computeHypoxicScore,
  detectFormat,
  parseByFormat,
  UnknownFormatError,
  type FormatInfo,
  type HypoxicScore,
  type PSGRecord,
} from '@somnosalud/psg-parser';

import { extractText } from '@/lib/pdf';

export type FileStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ProcessedFile {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
  format?: FormatInfo;
  record?: PSGRecord;
  missing?: string[];
  hypoxic?: HypoxicScore;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Hook orquestador: state list de archivos + acciones (add / process / clear).
 *
 * Para cada archivo: extractText (pdf.js) → detectFormat → parseByFormat →
 * computeHypoxicScore. Si hay error en cualquier paso, marca status='error'.
 */
export function usePsgFiles() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const accepted = list.filter(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name),
    );
    setFiles((prev) => [
      ...prev,
      ...accepted.map<ProcessedFile>((file) => ({
        id: makeId(),
        file,
        status: 'pending',
      })),
    ]);
    return { accepted: accepted.length, rejected: list.length - accepted.length };
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clear = useCallback(() => {
    setFiles([]);
  }, []);

  const processFile = useCallback(async (id: string, file: File) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'processing' } : f)),
    );

    try {
      const rawText = await extractText(file);
      const format = detectFormat(rawText);
      if (format.format === 'unknown') {
        throw new UnknownFormatError();
      }
      const { data, missing } = parseByFormat(rawText, format);
      const hypoxic = computeHypoxicScore(data);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'success',
                format,
                record: data,
                missing,
                hypoxic,
              }
            : f,
        ),
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'error', error: msg } : f,
        ),
      );
    }
  }, []);

  const processAll = useCallback(async () => {
    // Snapshot del state actual + secuencial para no saturar el worker pdf.js.
    const pending = files.filter((f) => f.status === 'pending');
    for (const f of pending) {
      await processFile(f.id, f.file);
    }
  }, [files, processFile]);

  return {
    files,
    addFiles,
    removeFile,
    clear,
    processAll,
  };
}
