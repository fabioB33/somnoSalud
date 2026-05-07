/**
 * PHQ-9 — Patient Health Questionnaire-9
 * ==========================================
 * Cuestionario de 9 ítems para screening y severidad de depresión.
 *
 * REFERENCIA:
 * Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief
 * depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
 * DOI: 10.1046/j.1525-1497.2001.016009606.x | PMID: 11556941
 *
 * PUNTOS DE CORTE (Kroenke et al.):
 * - 0-4:   Depresión mínima
 * - 5-9:   Depresión leve
 * - 10-14: Depresión moderada
 * - 15-19: Depresión moderadamente severa
 * - 20-27: Depresión severa
 *
 * Sensibilidad: 88%, Especificidad: 88% para depresión mayor (punto de corte ≥10)
 *
 * @version 1.0.0
 */

import type { PHQ9Responses, PHQ9Result, PHQ9Severity } from '../types';

const MIN_ITEM = 0;
const MAX_ITEM = 3;
const NUM_ITEMS = 9;

const CUTOFFS: Array<{ max: number; severity: PHQ9Severity; label: string }> = [
  { max: 4,  severity: 'minimal',           label: 'Depresión mínima' },
  { max: 9,  severity: 'mild',              label: 'Depresión leve' },
  { max: 14, severity: 'moderate',           label: 'Depresión moderada' },
  { max: 19, severity: 'moderately_severe',  label: 'Depresión moderadamente severa' },
  { max: 27, severity: 'severe',             label: 'Depresión severa' },
];

export function scorePHQ9(responses: PHQ9Responses): PHQ9Result {
  if (responses.length !== NUM_ITEMS) {
    throw new Error(`PHQ-9 requiere exactamente ${NUM_ITEMS} respuestas, recibidas: ${responses.length}`);
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    const val = responses[i];
    if (!Number.isInteger(val) || val < MIN_ITEM || val > MAX_ITEM) {
      throw new Error(`PHQ-9 ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM}-${MAX_ITEM}]`);
    }
  }

  const totalScore = responses.reduce((sum, val) => sum + val, 0);
  const classification = CUTOFFS.find(c => totalScore <= c.max)!;

  return {
    totalScore,
    severity: classification.severity,
    severityLabel: classification.label,
    itemScores: [...responses],
    reference: 'Kroenke K et al. J Gen Intern Med. 2001;16(9):606-613.',
  };
}

export const PHQ9_ITEMS = [
  { number: 1, text: 'Poco interés o placer en hacer las cosas' },
  { number: 2, text: 'Sentirte decaído/a, deprimido/a o sin esperanza' },
  { number: 3, text: 'Dificultad para dormirte, quedarte dormido/a o dormir demasiado' },
  { number: 4, text: 'Sentirte cansado/a o con poca energía' },
  { number: 5, text: 'Poco apetito o comer demasiado' },
  { number: 6, text: 'Sentirte mal contigo mismo/a, o sentir que sos un fracaso o que te fallaste a vos mismo/a o a tu familia' },
  { number: 7, text: 'Dificultad para concentrarte en cosas como leer el diario o ver televisión' },
  { number: 8, text: 'Moverte o hablar tan lento que otros lo notaron, o lo opuesto — estar tan inquieto/a que te movés mucho más de lo habitual' },
  { number: 9, text: 'Pensamientos de que estarías mejor muerto/a o de hacerte daño de alguna forma' },
];

export const PHQ9_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

export const PHQ9_STEM = 'En las últimas 2 semanas, ¿con qué frecuencia te han molestado los siguientes problemas?';
