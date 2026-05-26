import { useCallback, useRef, useState } from 'react';

interface DropzoneProps {
  onFiles: (files: FileList | File[]) => void;
}

export function Dropzone({ onFiles }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onFiles(e.dataTransfer.files);
    },
    [onFiles],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) onFiles(e.target.files);
      // Reset para permitir cargar el mismo archivo de nuevo despues de eliminarlo.
      e.target.value = '';
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={`dropzone${isDragging ? ' drag' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Arrastrá PDFs aquí o hacé click para seleccionar"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p>
        <strong>Arrastrá PDFs aquí</strong> o hacé click
      </p>
      <p className="hint">Sólo PDFs de equipos PSG soportados (Philips / BrainWave / ResMed / BMC)</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
