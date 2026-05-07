/**
 * STOP-BANG — Screening de Apnea Obstructiva del Sueño
 * =======================================================
 * Cuestionario de 8 ítems (4 preguntas + 4 datos calculados/medidos).
 *
 * REFERENCIA:
 * Chung F, Yegneswaran B, Liao P, et al. STOP Questionnaire: a tool
 * to screen patients for obstructive sleep apnea.
 * Anesthesiology. 2008;108(5):812-821.
 * DOI: 10.1097/ALN.0b013e31816d83e4 | PMID: 18431116
 *
 * ÍTEMS:
 * S — Snoring:  ¿Roncás fuerte? (pregunta)
 * T — Tired:    ¿Cansancio diurno? (pregunta)
 * O — Observed: ¿Observado dejar de respirar? (pregunta)
 * P — Pressure: ¿Presión arterial alta? (pregunta)
 * B — BMI:      IMC > 35 (calculado automáticamente)
 * A — Age:      Edad > 50 (calculado automáticamente)
 * N — Neck:     Circunferencia cuello > 40 cm (pregunta/medido)
 * G — Gender:   Sexo masculino (dato del perfil)
 *
 * PUNTOS DE CORTE (Chung et al.):
 * - 0-2: Riesgo bajo de AOS
 * - 3-4: Riesgo intermedio
 * - ≥5:  Riesgo alto (derivar a polisomnografía)
 *
 * SENSIBILIDAD: >90% para AOS moderada-severa con score ≥3
 *
 * @version 1.0.0
 */

import type {
  STOPBANGManualResponses, STOPBANGResult, ApneaRisk, PatientProfile
} from '../types';

const CUTOFFS: Array<{ max: number; risk: ApneaRisk; label: string }> = [
  { max: 2, risk: 'low',          label: 'Riesgo bajo de apnea obstructiva del sueño' },
  { max: 4, risk: 'intermediate', label: 'Riesgo intermedio de apnea obstructiva del sueño' },
  { max: 8, risk: 'high',         label: 'Riesgo alto de apnea obstructiva del sueño — derivar a polisomnografía' },
];

/**
 * Calcular edad a partir de fecha de nacimiento.
 */
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calcular IMC.
 */
function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * Calcular score STOP-BANG completo.
 *
 * @param manual - Respuestas manuales del paciente (S, T, O, P, N)
 * @param patient - Perfil del paciente (para calcular B, A, G automáticamente)
 * @returns STOPBANGResult con score, riesgo e interpretación
 */
export function scoreSTOPBANG(
  manual: STOPBANGManualResponses,
  patient: PatientProfile
): STOPBANGResult {
  const bmi = calculateBMI(patient.weightKg, patient.heightCm);
  const age = calculateAge(patient.dateOfBirth);

  // Ítems automáticos según criterios publicados
  const bmiOver35 = bmi > 35;
  const ageOver50 = age > 50;
  const isMale = patient.biologicalSex === 'male';

  // Cada ítem positivo = 1 punto
  const items: Record<string, boolean> = {
    S_snoring:   manual.snoring,
    T_tired:     manual.tired,
    O_observed:  manual.observed,
    P_pressure:  manual.pressure,
    B_bmi:       bmiOver35,
    A_age:       ageOver50,
    N_neck:      manual.neckOver40cm,
    G_gender:    isMale,
  };

  const totalScore = Object.values(items).filter(Boolean).length;
  const classification = CUTOFFS.find(c => totalScore <= c.max)!;

  return {
    totalScore,
    risk: classification.risk,
    riskLabel: classification.label,
    itemDetails: items,
    autoCalculated: { bmiOver35, ageOver50, isMale },
    reference: 'Chung F et al. Anesthesiology. 2008;108(5):812-821.',
  };
}

export const STOPBANG_MANUAL_ITEMS = [
  {
    code: 'S',
    text: '¿Roncás fuerte? (lo suficiente para escucharse a través de una puerta cerrada)',
    field: 'snoring',
  },
  {
    code: 'T',
    text: '¿Te sentís cansado/a, fatigado/a o somnoliento/a durante el día?',
    field: 'tired',
  },
  {
    code: 'O',
    text: '¿Alguien observó que dejás de respirar o te ahogás/sofocás mientras dormís?',
    field: 'observed',
  },
  {
    code: 'P',
    text: '¿Tenés o te trataron por presión arterial alta?',
    field: 'pressure',
  },
  {
    code: 'N',
    text: '¿Tu circunferencia de cuello es mayor a 40 cm?',
    field: 'neckOver40cm',
  },
];

export const STOPBANG_AUTO_ITEMS = [
  { code: 'B', text: 'IMC > 35', field: 'bmiOver35' },
  { code: 'A', text: 'Edad > 50 años', field: 'ageOver50' },
  { code: 'G', text: 'Sexo masculino', field: 'isMale' },
];
