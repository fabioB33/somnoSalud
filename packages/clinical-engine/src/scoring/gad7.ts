/**
 * GAD-7 — Generalized Anxiety Disorder-7
 * ==========================================
 * Cuestionario de 7 ítems para screening y severidad de ansiedad generalizada.
 *
 * REFERENCIA:
 * Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for
 * assessing generalized anxiety disorder: the GAD-7.
 * Arch Intern Med. 2006;166(10):1092-1097.
 * DOI: 10.1001/archinte.166.10.1092 | PMID: 16717171
 *
 * PUNTOS DE CORTE (Spitzer et al.):
 * - 0-4:   Ansiedad mínima
 * - 5-9:   Ansiedad leve
 * - 10-14: Ansiedad moderada
 * - 15-21: Ansiedad severa
 *
 * Sensibilidad: 89%, Especificidad: 82% para TAG (punto de corte ≥10)
 *
 * @version 1.0.0
 */

import type { GAD7Responses, GAD7Result, GAD7Severity } from '../types';

const MIN_ITEM = 0;
const MAX_ITEM = 3;
const NUM_ITEMS = 7;

const CUTOFFS: Array<{ max: number; severity: GAD7Severity; label: string }> = [
  { max: 4,  severity: 'minimal',  label: 'Ansiedad mínima' },
  { max: 9,  severity: 'mild',     label: 'Ansiedad leve' },
  { max: 14, severity: 'moderate', label: 'Ansiedad moderada' },
  { max: 21, severity: 'severe',   label: 'Ansiedad severa' },
];

export function scoreGAD7(responses: GAD7Responses): GAD7Result {
  if (responses.length !== NUM_ITEMS) {
    throw new Error(`GAD-7 requiere exactamente ${NUM_ITEMS} respuestas, recibidas: ${responses.length}`);
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    const val = responses[i];
    if (!Number.isInteger(val) || val < MIN_ITEM || val > MAX_ITEM) {
      throw new Error(`GAD-7 ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM}-${MAX_ITEM}]`);
    }
  }

  const totalScore = responses.reduce((sum, val) => sum + val, 0);
  const classification = CUTOFFS.find(c => totalScore <= c.max)!;

  return {
    totalScore,
    severity: classification.severity,
    severityLabel: classification.label,
    itemScores: [...responses],
    reference: 'Spitzer RL et al. Arch Intern Med. 2006;166(10):1092-1097.',
  };
}

export const GAD7_ITEMS = [
  { number: 1, text: 'Sentirme nervioso/a, ansioso/a o con los nervios de punta' },
  { number: 2, text: 'No poder dejar de preocuparme o no poder controlar la preocupación' },
  { number: 3, text: 'Preocuparme demasiado por diferentes cosas' },
  { number: 4, text: 'Dificultad para relajarme' },
  { number: 5, text: 'Estar tan inquieto/a que es difícil quedarme quieto/a' },
  { number: 6, text: 'Molestarme o irritarme fácilmente' },
  { number: 7, text: 'Sentir miedo como si algo terrible pudiera pasar' },
];

export const GAD7_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
];

export const GAD7_STEM = 'En las últimas 2 semanas, ¿con qué frecuencia te han molestado los siguientes problemas?';
