/**
 * ZIP multi-archivo con JSZip.
 *
 * Migrado desde legacy-v0/index.html lineas 1631-1643. Toma N archivos
 * procesados con success + genera ZIP con cada CSV usando su filename
 * canonico (Apellido_Nombre_YYYYMMDD_HHMM.csv). Incluye BOM
 * para que Excel detecte UTF-8 correctamente.
 */

import JSZip from 'jszip';
import type { PSGRecord } from '@somnosalud/psg-parser';

import { buildCSV } from './csv';
import { buildFilename } from './filename';

export interface ZipFile {
  record: PSGRecord;
}

/**
 * Genera blob ZIP con N archivos CSV. Retorna el filename sugerido
 * para download (`CSV_PSG_<timestamp>.zip`).
 */
export async function buildZip(
  files: ReadonlyArray<ZipFile>,
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();
  for (const f of files) {
    const csv = buildCSV(f.record);
    const fn = buildFilename(f.record);
    zip.file(fn, '﻿' + csv);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return { blob, filename: `CSV_PSG_${ts}.zip` };
}

/**
 * Trigger download del ZIP creando un <a> temporal con object URL.
 * Cleanup automatico despues de 1s para liberar el URL.
 */
export function downloadZip(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
