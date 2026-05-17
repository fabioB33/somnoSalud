/**
 * Helpers compartidos por los parsers.
 *
 * Migrados 1:1 desde packages/webapp-conversor-psg/legacy-v0/index.html
 * lineas 175-200. Naming y comportamiento identicos para facilitar
 * verificacion empirica vs PDFs reales (Sprint 15+).
 */

/** Resultado de parseSpanishDate: ISO 8601 + variante compacta. */
export interface ParsedSpanishDate {
  iso: string;
  compact: string;
}

/**
 * Parsea fecha en formato espanol "DD/MM/YYYY" o "DD/M/YYYY".
 * Retorna null si no matchea.
 *
 * Ejemplo: "26/3/2026" -> { iso: "2026-03-26", compact: "20260326" }
 */
export function parseSpanishDate(s: string): ParsedSpanishDate | null {
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const dd = m[1].padStart(2, '0');
  const mm = m[2].padStart(2, '0');
  const yyyy = m[3];
  return { iso: `${yyyy}-${mm}-${dd}`, compact: `${yyyy}${mm}${dd}` };
}

/** Resultado de parseHour: HHMM compacto. */
export interface ParsedHour {
  hhmm: string;
}

/**
 * Parsea hora "HH:MM:SS" o "HH:MM" -> { hhmm: "HHMM" }.
 * Retorna null si no matchea.
 */
export function parseHour(s: string): ParsedHour | null {
  const m = String(s).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return null;
  return { hhmm: m[1].padStart(2, '0') + m[2] };
}

/** Title-case: "JOHN DOE" -> "JohnDoe". Concatena sin espacios (replica del legacy). */
export function titleCase(s: string): string {
  return String(s)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
    .join('');
}

/**
 * Parsea un numero respetando formato espanol (coma decimal -> punto).
 * Retorna "" (string vacio) en vez de NaN para mantener compat con el
 * legacy que pone "" en CSVs. Casos especiales:
 *
 * - null / undefined / "" / "-" / "--" -> ""
 * - "12,5" -> 12.5
 * - "abc" -> ""
 *
 * Sprint 15 nota: el legacy retornaba `number | ""` con tipado dinamico.
 * Mantenemos ese contrato para no romper consumidores (CSV builder
 * espera "" para campos vacios).
 */
export function num(s: unknown): number | '' {
  if (s == null) return '';
  const v = String(s).trim().replace(',', '.');
  if (v === '' || v === '-' || v === '--') return '';
  const n = parseFloat(v);
  return isNaN(n) ? '' : n;
}

/** Normaliza whitespace: colapsa espacios/newlines/tabs a un solo espacio. */
export function normalizeWhitespace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}
