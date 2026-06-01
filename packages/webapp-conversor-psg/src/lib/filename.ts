/**
 * Builder del nombre de archivo CSV.
 *
 * Migrado 1:1 desde legacy-v0/_archived/index.html lineas 1441-1456. Formato:
 *   Apellido_Nombre_YYYYMMDD_HHMM.csv
 * Ej: Osinaga_Matias_20260326_2155.csv
 *
 * La hora se toma del "apagado de luces" (inicio del registro).
 */

import { parseHour, titleCase, type PSGRecord } from '@somnosalud/psg-parser';

function sanitize(s: string): string {
  return s.replace(/[^A-Za-z0-9_-]/g, '');
}

function asString(value: number | string | undefined): string {
  return typeof value === 'string' ? value : '';
}

export function buildFilename(record: PSGRecord): string {
  const apellido = record.paciente_apellido
    ? titleCase(asString(record.paciente_apellido))
    : 'Paciente';
  const nombre = record.paciente_nombre
    ? titleCase(asString(record.paciente_nombre))
    : 'SinNombre';

  let datePart = 'FechaDesconocida';
  if (record.estudio_fecha) {
    datePart = asString(record.estudio_fecha).replace(/-/g, '');
  }

  let hourPart = '0000';
  if (record.hora_apagado_luces) {
    const p = parseHour(asString(record.hora_apagado_luces));
    if (p) hourPart = p.hhmm;
  }

  return `${sanitize(apellido)}_${sanitize(nombre)}_${datePart}_${hourPart}.csv`;
}
