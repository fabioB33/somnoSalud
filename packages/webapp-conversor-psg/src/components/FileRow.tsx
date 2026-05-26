import { useCallback } from 'react';

import { buildCSV } from '@/lib/csv';
import { buildFilename } from '@/lib/filename';
import type { ProcessedFile } from '@/hooks/usePsgFiles';

interface FileRowProps {
  file: ProcessedFile;
  onRemove: (id: string) => void;
  onShowEngine: (id: string) => void;
}

const STATUS_LABEL: Record<ProcessedFile['status'], string> = {
  pending: 'En cola',
  processing: 'Procesando…',
  success: 'OK',
  error: 'Error',
};

export function FileRow({ file, onRemove, onShowEngine }: FileRowProps) {
  const handleDownload = useCallback(() => {
    if (!file.record) return;
    const csv = buildCSV(file.record);
    const filename = buildFilename(file.record);
    // BOM para que Excel detecte UTF-8 correctamente.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [file.record]);

  return (
    <div className="file-row">
      <span className="name">{file.file.name}</span>
      <span className={`status ${file.status}`}>{STATUS_LABEL[file.status]}</span>
      {file.format && (
        <span className="format-label" title={file.format.label}>
          {file.format.format}
        </span>
      )}
      {file.status === 'success' && (
        <>
          <button className="btn small ok" onClick={handleDownload}>
            Descargar CSV
          </button>
          {file.hypoxic && (
            <button
              className="btn small"
              onClick={() => onShowEngine(file.id)}
              title="Ver Score Hipóxico Azarbarzin 2019"
            >
              Score Hipóxico
            </button>
          )}
        </>
      )}
      {file.status === 'error' && (
        <span className="error-msg" role="alert">
          {file.error ?? 'Error desconocido'}
        </span>
      )}
      <button
        className="btn small secondary"
        onClick={() => onRemove(file.id)}
        aria-label={`Quitar ${file.file.name}`}
      >
        ✕
      </button>
    </div>
  );
}
