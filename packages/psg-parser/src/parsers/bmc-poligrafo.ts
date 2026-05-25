/**
 * Parser para PDFs BMC Poligrafia diagnostica.
 *
 * Migrado 1:1 desde legacy lineas 1260-1282. Caso especial: la mayoria de los
 * datos del reporte BMC poligrafia estan embebidos como imagenes (graficos),
 * no como texto. Solo podemos extraer datos minimos del texto disponible
 * (paciente) + agregamos un warning explicito en `missing[]` para que el
 * frontend (Sprint 19) muestre alerta al usuario.
 *
 * Mejora futura (Sprint 18+): cuando Pablo nos pase PDFs reales BMC, verificar
 * si OCR sobre las imagenes con tesseract.js permite extraer mas data. Por
 * ahora, solo texto.
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace } from '../utils';

const BMC_POLIGRAFO_WARNING =
  'ADVERTENCIA: El reporte BMC de poligrafia diagnostica tiene la mayor parte de los datos como imagenes. Solo se extraen datos minimos del texto disponible.';

export function parseBMCPoligrafo(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  d.estudio_tipo = 'Poligrafia respiratoria';
  d.estudio_software = 'BMC';

  // --- PACIENTE ---
  // Sprint 17 fix: greedy capture incluia palabras siguientes tras
  // normalizeWhitespace. Lookahead corta el match en el proximo campo.
  const name = t.match(
    /Nombre del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+,\s*[A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+?)(?=\s+(?:Género|Genero|Sexo|Edad|Fecha|Tipo|FDN|BMC|SW)|$)/,
  );
  if (name) {
    const parts = name[1].split(',');
    d.paciente_apellido = parts[0].trim();
    d.paciente_nombre = (parts[1] || '').trim();
  }

  // Warning explicito para que el frontend pueda alertar al usuario.
  miss.push(BMC_POLIGRAFO_WARNING);

  return { data: d, missing: miss };
}
