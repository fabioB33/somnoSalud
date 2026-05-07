/**
 * BMI — Índice de Masa Corporal (Body Mass Index)
 * ==================================================
 * Clasificación según OMS (WHO).
 *
 * REFERENCIA:
 * WHO Expert Consultation. Appropriate body-mass index for Asian
 * populations and its implications for policy and intervention strategies.
 * Lancet. 2004;363(9403):157-163. DOI: 10.1016/S0140-6736(03)15268-3
 *
 * Clasificación estándar OMS:
 * - <18.5:      Bajo peso
 * - 18.5-24.9:  Peso normal
 * - 25.0-29.9:  Sobrepeso
 * - 30.0-34.9:  Obesidad grado I
 * - 35.0-39.9:  Obesidad grado II
 * - ≥40.0:      Obesidad grado III (mórbida)
 *
 * RELEVANCIA PARA SUEÑO:
 * - IMC ≥30 → factor de riesgo para AOS (apnea obstructiva del sueño)
 * - IMC >35 → criterio positivo en STOP-BANG (ítem B)
 *
 * @version 1.0.0
 */

export type BMICategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese_I'
  | 'obese_II'
  | 'obese_III';

export interface BMIResult {
  bmi: number;
  category: BMICategory;
  categoryLabel: string;
  isApneaRiskFactor: boolean;   // IMC ≥30
  isSTOPBANGPositive: boolean;  // IMC >35
  reference: string;
}

const CUTOFFS: Array<{ max: number; category: BMICategory; label: string }> = [
  { max: 18.49, category: 'underweight', label: 'Bajo peso' },
  { max: 24.99, category: 'normal',      label: 'Peso normal' },
  { max: 29.99, category: 'overweight',  label: 'Sobrepeso' },
  { max: 34.99, category: 'obese_I',     label: 'Obesidad grado I' },
  { max: 39.99, category: 'obese_II',    label: 'Obesidad grado II' },
  { max: 999,   category: 'obese_III',   label: 'Obesidad grado III (mórbida)' },
];

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || weightKg > 500) {
    throw new Error(`Peso inválido: ${weightKg} kg (esperado: 1-500)`);
  }
  if (heightCm <= 0 || heightCm > 300) {
    throw new Error(`Altura inválida: ${heightCm} cm (esperado: 1-300)`);
  }

  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 100) / 100;

  const classification = CUTOFFS.find(c => bmi <= c.max)!;

  return {
    bmi,
    category: classification.category,
    categoryLabel: classification.label,
    isApneaRiskFactor: bmi >= 30,
    isSTOPBANGPositive: bmi > 35,
    reference: 'WHO Expert Consultation. Lancet. 2004;363(9403):157-163.',
  };
}
