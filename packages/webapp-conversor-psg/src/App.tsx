import { Dropzone } from './components/Dropzone';
import { FileList } from './components/FileList';
import { usePsgFiles } from './hooks/usePsgFiles';

/**
 * App shell — Conversor PSG → CSV (Sprint 19 MVP).
 *
 * Flow:
 * 1. Dropzone acepta PDFs (drag&drop o click → file input).
 * 2. Botón "Procesar" extrae texto con pdf.js + detectFormat + parseByFormat
 *    + computeHypoxicScore via @somnosalud/psg-parser.
 * 3. Cada archivo OK habilita botón "Descargar CSV" con formato:
 *    Apellido_Nombre_YYYYMMDD_HHMM.csv
 *
 * Sprint 19.B agregará: ZIP download + UI Engine Hipóxico + methodology tab.
 */
export function App() {
  const { files, addFiles, removeFile, clear, processAll } = usePsgFiles();

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const hasFiles = files.length > 0;

  return (
    <div className="container">
      <header className="app-header">
        <h1>Conversor PSG → CSV</h1>
        <p className="subtitle">
          Procesamiento <strong>100% local</strong> · Multi-equipo (Philips · BrainWave · ResMed · BMC)
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
              <button className="btn secondary" onClick={clear}>
                Limpiar lista
              </button>
              {successCount > 0 && (
                <span className="counter">
                  {successCount} de {files.length} procesados OK
                </span>
              )}
            </div>

            <FileList files={files} onRemove={removeFile} />
          </>
        )}
      </div>

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
