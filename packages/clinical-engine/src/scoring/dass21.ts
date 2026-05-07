/**
 * DASS-21 — Depression Anxiety Stress Scales (21 ítems)
 * ========================================================
 * Escala de 21 ítems dividida en 3 subescalas de 7 ítems cada una.
 *
 * REFERENCIA:
 * Lovibond SH, Lovibond PF. Manual for the Depression Anxiety Stress
 * Scales. 2nd ed. Sydney: Psychology Foundation of Australia; 1995.
 *
 * Validación en español:
 * Daza P, Novy DM, Stanley MA, Averill P. The Depression Anxiety Stress
 * Scale-21: Spanish translation and validation with a Hispanic sample.
 * J Psychopathol Behav Assess. 2002;24(3):195-205.
 *
 * IMPORTANTE: Los scores de cada subescala se MULTIPLICAN POR 2
 * para equiparar con la escala completa DASS-42.
 *
 * ASIGNACIÓN DE ÍTEMS A SUBESCALAS (Lovibond & Lovibond, 1995):
 * - Depresión: ítems 3, 5, 10, 13, 16, 17, 21 (índices 2, 4, 9, 12, 15, 16, 20)
 * - Ansiedad:  ítems 2, 4, 7, 9, 15, 19, 20  (índices 1, 3, 6, 8, 14, 18, 19)
 * - Estrés:    ítems 1, 6, 8, 11, 12, 14, 18  (índices 0, 5, 7, 10, 11, 13, 17)
 *
 * PUNTOS DE CORTE (scores ×2):
 * Depresión: 0-9 normal, 10-13 leve, 14-20 moderada, 21-27 severa, ≥28 extremadamente severa
 * Ansiedad:  0-7 normal, 8-9 leve, 10-14 moderada, 15-19 severa, ≥20 extremadamente severa
 * Estrés:    0-14 normal, 15-18 leve, 19-25 moderado, 26-33 severo, ≥34 extremadamente severo
 *
 * @version 1.0.0
 */

import type { DASS21Responses, DASS21Result, DASS21Severity } from '../types';

const NUM_ITEMS = 21;
const MIN_ITEM = 0;
const MAX_ITEM = 3;

// Índices (0-based) de cada subescala según manual original
const DEPRESSION_INDICES = [2, 4, 9, 12, 15, 16, 20];
const ANXIETY_INDICES    = [1, 3, 6, 8, 14, 18, 19];
const STRESS_INDICES     = [0, 5, 7, 10, 11, 13, 17];

type CutoffDef = Array<{ max: number; severity: DASS21Severity; label: string }>;

const DEPRESSION_CUTOFFS: CutoffDef = [
  { max: 9,  severity: 'normal',           label: 'Normal' },
  { max: 13, severity: 'mild',             label: 'Leve' },
  { max: 20, severity: 'moderate',         label: 'Moderada' },
  { max: 27, severity: 'severe',           label: 'Severa' },
  { max: 42, severity: 'extremely_severe', label: 'Extremadamente severa' },
];

const ANXIETY_CUTOFFS: CutoffDef = [
  { max: 7,  severity: 'normal',           label: 'Normal' },
  { max: 9,  severity: 'mild',             label: 'Leve' },
  { max: 14, severity: 'moderate',         label: 'Moderada' },
  { max: 19, severity: 'severe',           label: 'Severa' },
  { max: 42, severity: 'extremely_severe', label: 'Extremadamente severa' },
];

const STRESS_CUTOFFS: CutoffDef = [
  { max: 14, severity: 'normal',           label: 'Normal' },
  { max: 18, severity: 'mild',             label: 'Leve' },
  { max: 25, severity: 'moderate',         label: 'Moderado' },
  { max: 33, severity: 'severe',           label: 'Severo' },
  { max: 42, severity: 'extremely_severe', label: 'Extremadamente severo' },
];

function classify(score: number, cutoffs: CutoffDef): { severity: DASS21Severity; label: string } {
  return cutoffs.find(c => score <= c.max)!;
}

function sumIndices(responses: DASS21Responses, indices: number[]): number {
  return indices.reduce((sum, idx) => sum + responses[idx], 0);
}

export function scoreDASS21(responses: DASS21Responses): DASS21Result {
  if (responses.length !== NUM_ITEMS) {
    throw new Error(`DASS-21 requiere exactamente ${NUM_ITEMS} respuestas, recibidas: ${responses.length}`);
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    const val = responses[i];
    if (!Number.isInteger(val) || val < MIN_ITEM || val > MAX_ITEM) {
      throw new Error(`DASS-21 ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM}-${MAX_ITEM}]`);
    }
  }

  // Sumar raw scores por subescala y multiplicar ×2 (según manual)
  const depressionRaw = sumIndices(responses, DEPRESSION_INDICES);
  const anxietyRaw    = sumIndices(responses, ANXIETY_INDICES);
  const stressRaw     = sumIndices(responses, STRESS_INDICES);

  const depressionScore = depressionRaw * 2;
  const anxietyScore    = anxietyRaw * 2;
  const stressScore     = stressRaw * 2;

  const depClass = classify(depressionScore, DEPRESSION_CUTOFFS);
  const anxClass = classify(anxietyScore, ANXIETY_CUTOFFS);
  const strClass = classify(stressScore, STRESS_CUTOFFS);

  return {
    depressionScore,
    anxietyScore,
    stressScore,
    depressionSeverity: depClass.severity,
    anxietySeverity: anxClass.severity,
    stressSeverity: strClass.severity,
    depressionLabel: `Depresión: ${depClass.label}`,
    anxietyLabel: `Ansiedad: ${anxClass.label}`,
    stressLabel: `Estrés: ${strClass.label}`,
    reference: 'Lovibond SH & Lovibond PF. Manual for the DASS. 2nd ed. 1995.',
  };
}

export const DASS21_ITEMS = [
  { number: 1,  subscale: 'stress',     text: 'Me costó mucho relajarme' },
  { number: 2,  subscale: 'anxiety',    text: 'Me di cuenta que tenía la boca seca' },
  { number: 3,  subscale: 'depression', text: 'No podía sentir ningún sentimiento positivo' },
  { number: 4,  subscale: 'anxiety',    text: 'Se me hizo difícil respirar (respiración agitada, falta de aire sin haber hecho esfuerzo físico)' },
  { number: 5,  subscale: 'depression', text: 'Se me hizo difícil tomar la iniciativa para hacer cosas' },
  { number: 6,  subscale: 'stress',     text: 'Reaccioné exageradamente en ciertas situaciones' },
  { number: 7,  subscale: 'anxiety',    text: 'Sentí que mis manos temblaban' },
  { number: 8,  subscale: 'stress',     text: 'Sentí que tenía muchos nervios' },
  { number: 9,  subscale: 'anxiety',    text: 'Estaba preocupado/a por situaciones en las cuales podía tener pánico o en las que podría hacer el ridículo' },
  { number: 10, subscale: 'depression', text: 'Sentí que no tenía nada por qué vivir' },
  { number: 11, subscale: 'stress',     text: 'Noté que me agitaba' },
  { number: 12, subscale: 'stress',     text: 'Se me hizo difícil relajarme' },
  { number: 13, subscale: 'depression', text: 'Me sentí triste y deprimido/a' },
  { number: 14, subscale: 'stress',     text: 'No toleré nada que no me permitiera continuar con lo que estaba haciendo' },
  { number: 15, subscale: 'anxiety',    text: 'Sentí que estaba al punto de pánico' },
  { number: 16, subscale: 'depression', text: 'No me pude entusiasmar por nada' },
  { number: 17, subscale: 'depression', text: 'Sentí que valía muy poco como persona' },
  { number: 18, subscale: 'stress',     text: 'Sentí que estaba muy irritable' },
  { number: 19, subscale: 'anxiety',    text: 'Sentí los latidos de mi corazón a pesar de no haber hecho ningún esfuerzo físico' },
  { number: 20, subscale: 'anxiety',    text: 'Tuve miedo sin razón' },
  { number: 21, subscale: 'depression', text: 'Sentí que la vida no tenía ningún sentido' },
];

export const DASS21_OPTIONS = [
  { value: 0, label: 'No me aplicó' },
  { value: 1, label: 'Me aplicó un poco, o durante parte del tiempo' },
  { value: 2, label: 'Me aplicó bastante, o durante una buena parte del tiempo' },
  { value: 3, label: 'Me aplicó mucho, o la mayor parte del tiempo' },
];

export const DASS21_STEM = 'Por favor lee cada afirmación e indicá cuánto te aplicó durante la ÚLTIMA SEMANA. No hay respuestas correctas ni incorrectas.';
