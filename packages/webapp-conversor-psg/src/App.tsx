import { useCallback, useState } from 'react';

import { Dropzone } from './components/Dropzone';
import { EnginePanel } from './components/EnginePanel';
import { FileList } from './components/FileList';
import { usePsgFiles } from './hooks/usePsgFiles';
import { buildZip, downloadZip } from './lib/zip';

/**
 * App shell — Conversor PSG → CSV (Sprint 19 + 19.B).
 *
 * Flow:
 * 1. Dropzone acepta PDFs (drag&drop o click → file input).
 * 2. Botón "Procesar" extrae texto con pdf.js + detectFormat + parseByFormat
 *    + computeHypoxicScore via @somnosalud/psg-parser.
 * 3. Cada archivo OK habilita:
 *    - "Descargar CSV" individual.
 *    - "Score Hipóxico" → abre EnginePanel con score Azarbarzin 2019.
 * 4. Botón "Descargar todos (ZIP)" arma ZIP con BOM-prefixed CSVs.
 *
 * Sprint 19.C (2026-05-26): legacy v0 archivado en legacy-v0/_archived/.
 * Smoke real con PDFs IFN de Pablo queda como verificación post-cierre.
 */
export function App() {
  const { files, addFiles, removeFile, clear, processAll } = usePsgFiles();
  const [engineFileId, setEngineFileId] = useState<string | null>(null);
  const [zipBusy, setZipBusy] = useState(false);

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const hasFiles = files.length > 0;
  const engineFile = engineFileId
    ? files.find((f) => f.id === engineFileId)
    : null;

  const handleDownloadAll = useCallback(async () => {
    const successFiles = files.filter(
      (f) => f.status === 'success' && f.record,
    );
    if (successFiles.length === 0) return;
    setZipBusy(true);
    try {
      const { blob, filename } = await buildZip(
        successFiles.map((f) => ({ record: f.record! })),
      );
      downloadZip(blob, filename);
    } finally {
      setZipBusy(false);
    }
  }, [files]);

  return (
    <div className="container">
      <header className="app-header">
        <h1>Conversor PSG → CSV</h1>
        <p className="subtitle">
          Procesamiento <strong>100% local</strong> · Multi-equipo (Philips ·
          BrainWave · ResMed · BMC)
        </p>
      </header>

      <div className="card">
        <Dropzone onFiles={addFiles} />

        {hasFiles && (
          <>
            <div className="actions">
              <button
                className="btn"
                onClick={processAll}
                disabled={pendingCount === 0}
              >
                {pendingCount > 0
                  ? `Procesar ${pendingCount} archivo${pendingCount > 1 ? 's' : ''}`
                  : 'Sin archivos pendientes'}
              </button>
              <button
                className="btn ok"
                onClick={handleDownloadAll}
                disabled={successCount === 0 || zipBusy}
                title="Descargar todos los CSV procesados como un ZIP"
              >
                {zipBusy
                  ? 'Generando ZIP…'
                  : `Descargar todos (ZIP) ${successCount > 0 ? `· ${successCount}` : ''}`}
              </button>
              <button className="btn secondary" onClick={clear}>
                Limpiar lista
              </button>
              {successCount > 0 && (
                <span className="counter">
                  {successCount} de {files.length} procesados OK
                </span>
              )}
            </div>

            <FileList
              files={files}
              onRemove={removeFile}
              onShowEngine={setEngineFileId}
            />
          </>
        )}
      </div>

      {engineFile?.record && engineFile?.hypoxic && (
        <EnginePanel
          record={engineFile.record}
          hypoxic={engineFile.hypoxic}
          onClose={() => setEngineFileId(null)}
        />
      )}

      <div className="info-box">
        <strong>Formato del nombre de archivo:</strong>{' '}
        <code>Apellido_Nombre_YYYYMMDD_HHMM.csv</code>
        <br />
        Ej: <code>Osinaga_Matias_20260326_2155.csv</code> · La hora se toma del
        "apagado de luces".
      </div>

      <div className="warn-box">
        <strong>Verificá siempre un archivo manualmente.</strong> El sistema
        auto-detecta el equipo y aplica el parser correspondiente. Los campos
        disponibles varían según el equipo y tipo de estudio.
        <br />
        <br />
        <strong>Equipos soportados:</strong> Philips Sleepware G3 (PSG), Alice
        NightOne (Poligrafía), BrainWave (PSG), ResMed AirView (Diagnóstico y
        Tratamiento), BMC (Tratamiento + Poligrafía). El reporte BMC de
        poligrafía diagnóstica tiene datos limitados (mayormente imágenes).
      </div>

      <footer>
        Procesamiento 100% local · pdf.js + JSZip · SomnoSalud — Dr. Pablo
        Ferrero (M.N. 119.783) — IFN
      </footer>
    </div>
  );
}
