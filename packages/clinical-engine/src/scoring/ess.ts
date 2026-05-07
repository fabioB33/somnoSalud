/**
 * ESS — Epworth Sleepiness Scale
 * ==================================
 * Escala de 8 ítems para medir somnolencia diurna excesiva.
 *
 * REFERENCIA:
 * Johns MW. A new method for measuring daytime sleepiness: the Epworth
 * sleepiness scale. Sleep. 1991;14(6):540-545.
 * DOI: 10.1093/sleep/14.6.540 | PMID: 1798888
 *
 * PUNTOS DE CORTE:
 * - 0-10:  Somnolencia diurna normal
 * - 11-14: Somnolencia diurna leve
 * - 15-17: Somnolencia diurna moderada
 * - ≥18:   Somnolencia diurna severa
 *
 * NOTA CLÍNICA: ESS ≥11 sugiere somnolencia excesiva que puede indicar
 * trastorno del sueño subyacente (apnea, narcolepsia, etc.).
 *
 * @version 1.0.0
 */

import type { ESSResponses, ESSResult, ESSSeverity } from '../types';

const MIN_ITEM = 0;
const MAX_ITEM = 3;
const NUM_ITEMS = 8;

const CUTOFFS: Array<{ max: number; severity: ESSSeverity; label: string }> = [
  { max: 10, severity: 'normal',   label: 'Somnolencia diurna normal' },
  { max: 14, severity: 'mild',     label: 'Somnolencia diurna leve' },
  { max: 17, severity: 'moderate', label: 'Somnolencia diurna moderada' },
  { max: 24, severity: 'severe',   label: 'Somnolencia diurna severa' },
];

export function scoreESS(responses: ESSResponses): ESSResult {
  if (responses.length !== NUM_ITEMS) {
    throw new Error(`ESS requiere exactamente ${NUM_ITEMS} respuestas, recibidas: ${responses.length}`);
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    const val = responses[i];
    if (!Number.isInteger(val) || val < MIN_ITEM || val > MAX_ITEM) {
      throw new Error(`ESS ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM}-${MAX_ITEM}]`);
    }
  }

  const totalScore = responses.reduce((sum, val) => sum + val, 0);
  const classification = CUTOFFS.find(c => totalScore <= c.max)!;

  return {
    totalScore,
    severity: classification.severity,
    severityLabel: classification.label,
    itemScores: [...responses],
    reference: 'Johns MW. Sleep. 1991;14(6):540-545.',
  };
}

export const ESS_ITEMS = [
  { number: 1, text: 'Sentado/a leyendo' },
  { number: 2, text: 'Viendo televisión' },
  { number: 3, text: 'Sentado/a, inactivo/a, en un lugar público (ej: teatro, reunión)' },
  { number: 4, text: 'Como pasajero/a en un auto durante 1 hora sin parar' },
  { number: 5, text: 'Descansando acostado/a por la tarde cuando las circunstancias lo permiten' },
  { number: 6, text: 'Sentado/a hablando con alguien' },
  { number: 7, text: 'Sentado/a tranquilo/a después del almuerzo (sin haber tomado alcohol)' },
  { number: 8, text: 'En un auto, mientras está detenido unos minutos en el tráfico' },
];

export const ESS_OPTIONS = [
  { value: 0, label: 'Nunca me dormiría' },
  { value: 1, label: 'Escasa probabilidad de dormirme' },
  { value: 2, label: 'Moderada probabilidad de dormirme' },
  { value: 3, label: 'Alta probabilidad de dormirme' },
];
