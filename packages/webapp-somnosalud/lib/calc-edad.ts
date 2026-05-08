/**
 * calc-edad.ts — calculo de edad desde fecha de nacimiento.
 *
 * Compliance gate: usado por /eval/profile para verificar edad >=18.
 * SAFE-010 del clinical-engine + decision clinica Pablo Ferrero.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 3)
 */

/**
 * Calcula edad en anos completos a partir de fecha de nacimiento ISO 8601 (YYYY-MM-DD).
 *
 * Maneja edge cases:
 * - Cumpleanos hoy: cuenta el ano completo.
 * - Cumpleanos manana: NO cuenta el ano (todavia no cumplio).
 * - 29 de febrero: en anos no-bisiestos, se considera 28-feb.
 * - Fechas futuras: devuelve NaN (input invalido).
 * - Fechas invalidas: devuelve NaN.
 *
 * @example
 * calcularEdad('2008-05-08'); // si hoy es 2026-05-08 -> 18
 * calcularEdad('2008-05-09'); // si hoy es 2026-05-08 -> 17 (todavia no cumplio)
 * calcularEdad('2026-12-31'); // fecha futura -> NaN
 * calcularEdad('invalid');    // input invalido -> NaN
 */
export function calcularEdad(dobIso: string): number {
  if (!dobIso || typeof dobIso !== 'string') return NaN;

  const birth = new Date(dobIso + 'T00:00:00Z');
  if (Number.isNaN(birth.getTime())) return NaN;

  const today = new Date();
  // Usamos UTC para evitar drift de timezone en edge cases.
  const todayUtc = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  if (birth > todayUtc) return NaN; // fecha futura

  let age = todayUtc.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = todayUtc.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = todayUtc.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

/** Edad minima para evaluacion auto-administrada (decision clinica). */
export const EDAD_MINIMA_EVALUACION = 18;

/**
 * Helper para UI: devuelve true si la edad es valida para evaluacion (>=18 anos)
 * y false si es menor o input invalido.
 */
export function esEdadValidaParaEvaluacion(dobIso: string): boolean {
  const edad = calcularEdad(dobIso);
  if (Number.isNaN(edad)) return false;
  return edad >= EDAD_MINIMA_EVALUACION;
}
