/**
 * CSV builder formato long: parametro,valor,campo_informe_personalizado
 *
 * Migrado 1:1 desde legacy-v0/index.html lineas 1422-1439.
 * Genera CSV en formato long con 212 columnas del SCHEMA + 25 filas
 * extras del EXTRA_INFORME (campos del formulario IFN que NO existen
 * en el PDF — se exportan vacios).
 */

import type { PSGRecord } from '@somnosalud/psg-parser';
import { EXTRA_INFORME, MAPPING_INFORME, SCHEMA } from './schema';

const HEADER = 'parametro,valor,campo_informe_personalizado';

function escapeCsv(value: number | string | undefined | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function buildCSV(record: PSGRecord): string {
  const lines: string[] = [HEADER];

  for (const key of SCHEMA) {
    const value = record[key];
    const campo = MAPPING_INFORME[key] ?? '';
    lines.push(`${escapeCsv(key)},${escapeCsv(value)},${escapeCsv(campo)}`);
  }

  for (const [key, campo] of EXTRA_INFORME) {
    lines.push(`${escapeCsv(key)},,${escapeCsv(campo)}`);
  }

  return lines.join('\n') + '\n';
}
