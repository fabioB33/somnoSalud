/**
 * ISI — Insomnia Severity Index
 * ================================
 * Cuestionario de 7 ítems para evaluar severidad del insomnio.
 *
 * REFERENCIA:
 * Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity
 * Index as an outcome measure for insomnia research.
 * Sleep Med. 2001;2(4):297-307. DOI: 10.1016/S1389-9457(00)00065-4
 *
 * PUNTOS DE CORTE (publicados en el artículo original):
 * - 0-7:   Sin insomnio clínicamente significativo
 * - 8-14:  Insomnio subclínico (leve)
 * - 15-21: Insomnio clínico moderado
 * - 22-28: Insomnio clínico severo
 *
 * ÍTEMS:
 * 1. Dificultad para quedarse dormido/a (0-4)
 * 2. Dificultad para mantenerse dormido/a (0-4)
 * 3. Problema de despertar muy temprano (0-4)
 * 4. Satisfacción con patrón de sueño actual (0-4)
 * 5. Interferencia con funcionamiento diario (0-4)
 * 6. Qué tan notorio es el problema para otros (0-4)
 * 7. Preocupación por el problema de sueño (0-4)
 *
 * @version 1.0.0
 */

import type { ISIResponses, ISIResult, ISISeverity } from '../types';

/** Rango válido por ítem: 0-4 */
const MIN_ITEM = 0;
const MAX_ITEM = 4;
const NUM_ITEMS = 7;
const MAX_TOTAL = NUM_ITEMS * MAX_ITEM; // 28

/**
 * Puntos de corte publicados por Bastien et al. (2001).
 * Cada threshold es el límite SUPERIOR inclusive de esa categoría.
 */
const CUTOFFS: Array<{ max: number; severity: ISISeverity; label: string }> = [
  { max: 7,  severity: 'no_insomnia',  label: 'Sin insomnio clínicamente significativo' },
  { max: 14, severity: 'subthreshold', label: 'Insomnio subclínico (leve)' },
  { max: 21, severity: 'moderate',     label: 'Insomnio clínico moderado' },
  { max: 28, severity: 'severe',       label: 'Insomnio clínico severo' },
];

/**
 * Calcular score del ISI.
 *
 * @param responses - Array de 7 respuestas, cada una 0-4
 * @returns ISIResult con score total, severidad e interpretación
 * @throws Error si las respuestas son inválidas
 */
export function scoreISI(responses: ISIResponses): ISIResult {
  // Validación
  if (responses.length !== NUM_ITEMS) {
    throw new Error(`ISI requiere exactamente ${NUM_ITEMS} respuestas, recibidas: ${responses.length}`);
  }

  for (let i = 0; i < NUM_ITEMS; i++) {
    const val = responses[i];
    if (!Number.isInteger(val) || val < MIN_ITEM || val > MAX_ITEM) {
      throw new Error(`ISI ítem ${i + 1}: valor ${val} fuera de rango [${MIN_ITEM}-${MAX_ITEM}]`);
    }
  }

  // Cálculo: suma simple de los 7 ítems
  const totalScore = responses.reduce((sum, val) => sum + val, 0);

  // Clasificación según puntos de corte
  const classification = CUTOFFS.find(c => totalScore <= c.max)!;

  return {
    totalScore,
    severity: classification.severity,
    severityLabel: classification.label,
    itemScores: [...responses],
    reference: 'Bastien CH et al. Sleep Med. 2001;2(4):297-307.',
  };
}

/**
 * Obtener las preguntas del ISI en español (versión validada).
 */
export const ISI_ITEMS = [
  {
    number: 1,
    text: 'Dificultad para quedarse dormido/a',
    options: ['Ninguna', 'Leve', 'Moderada', 'Severa', 'Muy severa'],
  },
  {
    number: 2,
    text: 'Dificultad para mantenerse dormido/a',
    options: ['Ninguna', 'Leve', 'Moderada', 'Severa', 'Muy severa'],
  },
  {
    number: 3,
    text: 'Problema de despertar muy temprano',
    options: ['Ninguno', 'Leve', 'Moderado', 'Severo', 'Muy severo'],
  },
  {
    number: 4,
    text: '¿Qué tan satisfecho/a está con su patrón de sueño actual?',
    options: ['Muy satisfecho', 'Satisfecho', 'Neutral', 'Insatisfecho', 'Muy insatisfecho'],
  },
  {
    number: 5,
    text: '¿En qué medida su problema de sueño INTERFIERE con su funcionamiento diario?',
    options: ['Nada', 'Un poco', 'Algo', 'Mucho', 'Muchísimo'],
  },
  {
    number: 6,
    text: '¿Qué tan NOTORIO cree que es su problema de sueño para los demás?',
    options: ['Nada notorio', 'Apenas', 'Algo', 'Mucho', 'Muy notorio'],
  },
  {
    number: 7,
    text: '¿Qué tan PREOCUPADO/A está por su problema de sueño actual?',
    options: ['Nada', 'Un poco', 'Algo', 'Mucho', 'Muchísimo'],
  },
];
