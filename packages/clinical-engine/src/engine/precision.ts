/**
 * Calculador de Confianza del Análisis — SomnoSalud
 * ====================================================
 * Evalúa la completitud y confiabilidad de los datos disponibles
 * para cada paciente, generando un índice de confianza (0-100%).
 *
 * DIMENSIONES EVALUADAS:
 * 1. Completitud de cuestionarios (0-40 pts)
 * 2. Datos de sueño (0-20 pts)
 * 3. Datos biométricos (0-15 pts)
 * 4. Laboratorios (0-15 pts)
 * 5. Genética (0-10 pts)
 *
 * NIVELES DE CONFIANZA:
 * - ≥80%: Alta confianza — análisis completo
 * - 60-79%: Confianza moderada — análisis útil con limitaciones
 * - 40-59%: Confianza baja — análisis preliminar
 * - <40%: Insuficiente — solicitar más datos
 *
 * @version 1.0.0
 */

export type ConfidenceLevel = 'high' | 'moderate' | 'low' | 'insufficient';

export interface DataCompleteness {
  dimension: string;
  maxPoints: number;
  earnedPoints: number;
  details: string;
}

export interface PrecisionResult {
  confidencePercent: number;
  confidenceLevel: ConfidenceLevel;
  confidenceLabel: string;
  dimensions: DataCompleteness[];
  missingData: string[];
  improvementSuggestions: string[];
}

export interface AvailableData {
  hasISI: boolean;
  hasESS: boolean;
  hasSTOPBANG: boolean;
  hasPHQ9: boolean;
  hasGAD7: boolean;
  hasDASS21: boolean;
  hasSleepDiary: boolean;
  hasSleepDiaryDays: number; // 0-14
  hasBMI: boolean;
  hasNeckCircumference: boolean;
  hasLabVitD: boolean;
  hasLabB12: boolean;
  hasLabIron: boolean;
  hasLabFerritin: boolean;
  hasLabMagnesium: boolean;
  hasLabTSH: boolean;
  hasLabGlucose: boolean;
  hasGenetics: boolean;
  geneticVariantsCount: number; // 0-5
}

export function calculatePrecision(data: AvailableData): PrecisionResult {
  const dimensions: DataCompleteness[] = [];
  const missing: string[] = [];
  const suggestions: string[] = [];

  // ─── 1. Cuestionarios (40 pts) ────────────────────────────────
  const questionnaires = [
    { has: data.hasISI, name: 'ISI', pts: 10 },
    { has: data.hasESS, name: 'ESS', pts: 6 },
    { has: data.hasSTOPBANG, name: 'STOP-BANG', pts: 6 },
    { has: data.hasPHQ9, name: 'PHQ-9', pts: 8 },
    { has: data.hasGAD7, name: 'GAD-7', pts: 5 },
    { has: data.hasDASS21, name: 'DASS-21', pts: 5 },
  ];
  const qEarned = questionnaires.filter(q => q.has).reduce((s, q) => s + q.pts, 0);
  const qMissing = questionnaires.filter(q => !q.has);

  dimensions.push({
    dimension: 'Cuestionarios clínicos',
    maxPoints: 40,
    earnedPoints: qEarned,
    details: `${questionnaires.filter(q => q.has).length}/6 completados`,
  });

  if (qMissing.length > 0) {
    qMissing.forEach(q => missing.push(`Cuestionario ${q.name} no completado`));
    if (!data.hasISI) suggestions.push('Completar el ISI es esencial para evaluar la severidad del insomnio');
    if (!data.hasPHQ9) suggestions.push('El PHQ-9 es necesario para evaluar depresión');
  }

  // ─── 2. Datos de sueño (20 pts) ──────────────────────────────
  let sleepPts = 0;
  if (data.hasSleepDiary) {
    sleepPts += 8;
    // Bonus por más días de diario (hasta 12 pts adicionales)
    sleepPts += Math.min(12, Math.round((data.hasSleepDiaryDays / 14) * 12));
  }

  dimensions.push({
    dimension: 'Datos de sueño',
    maxPoints: 20,
    earnedPoints: sleepPts,
    details: data.hasSleepDiary
      ? `Diario de sueño: ${data.hasSleepDiaryDays} días`
      : 'Sin datos de diario de sueño',
  });

  if (!data.hasSleepDiary) {
    missing.push('Diario de sueño no completado');
    suggestions.push('Un diario de sueño de al menos 7 días mejora significativamente la precisión del análisis');
  } else if (data.hasSleepDiaryDays < 7) {
    suggestions.push(`Diario de sueño con ${data.hasSleepDiaryDays} días — se recomiendan al menos 7 para mayor representatividad`);
  }

  // ─── 3. Datos biométricos (15 pts) ───────────────────────────
  let bioPts = 0;
  if (data.hasBMI) bioPts += 10;
  if (data.hasNeckCircumference) bioPts += 5;

  dimensions.push({
    dimension: 'Datos biométricos',
    maxPoints: 15,
    earnedPoints: bioPts,
    details: `IMC: ${data.hasBMI ? 'sí' : 'no'}, Cuello: ${data.hasNeckCircumference ? 'sí' : 'no'}`,
  });

  if (!data.hasBMI) {
    missing.push('IMC no calculado (faltan peso/talla)');
    suggestions.push('El IMC es necesario para el STOP-BANG y evaluación de riesgo de AOS');
  }

  // ─── 4. Laboratorios (15 pts) ────────────────────────────────
  const labs = [
    { has: data.hasLabVitD, name: 'Vitamina D', pts: 3 },
    { has: data.hasLabB12, name: 'Vitamina B12', pts: 2 },
    { has: data.hasLabIron, name: 'Hierro sérico', pts: 2 },
    { has: data.hasLabFerritin, name: 'Ferritina', pts: 2 },
    { has: data.hasLabMagnesium, name: 'Magnesio', pts: 2 },
    { has: data.hasLabTSH, name: 'TSH', pts: 2 },
    { has: data.hasLabGlucose, name: 'Glucemia', pts: 2 },
  ];
  const labPts = labs.filter(l => l.has).reduce((s, l) => s + l.pts, 0);

  dimensions.push({
    dimension: 'Laboratorios',
    maxPoints: 15,
    earnedPoints: labPts,
    details: `${labs.filter(l => l.has).length}/7 parámetros disponibles`,
  });

  if (labs.some(l => !l.has)) {
    labs.filter(l => !l.has).forEach(l => missing.push(`${l.name} no disponible`));
    if (!data.hasLabVitD) suggestions.push('La vitamina D baja está asociada a peor calidad de sueño');
  }

  // ─── 5. Genética (10 pts) ────────────────────────────────────
  let genPts = 0;
  if (data.hasGenetics) {
    genPts = Math.min(10, data.geneticVariantsCount * 2);
  }

  dimensions.push({
    dimension: 'Variantes genéticas',
    maxPoints: 10,
    earnedPoints: genPts,
    details: data.hasGenetics
      ? `${data.geneticVariantsCount}/5 variantes analizadas`
      : 'Sin datos genéticos',
  });

  if (!data.hasGenetics) {
    missing.push('Análisis genético no disponible');
    // No lo sugiere como mejora esencial porque es opcional
  }

  // ─── Cálculo total ───────────────────────────────────────────
  const totalEarned = dimensions.reduce((s, d) => s + d.earnedPoints, 0);
  const totalMax = dimensions.reduce((s, d) => s + d.maxPoints, 0);
  const percent = Math.round((totalEarned / totalMax) * 100);

  let level: ConfidenceLevel;
  let label: string;
  if (percent >= 80) { level = 'high'; label = 'Alta confianza — análisis completo'; }
  else if (percent >= 60) { level = 'moderate'; label = 'Confianza moderada — análisis útil con limitaciones'; }
  else if (percent >= 40) { level = 'low'; label = 'Confianza baja — análisis preliminar'; }
  else { level = 'insufficient'; label = 'Datos insuficientes — solicitar más información'; }

  return {
    confidencePercent: percent,
    confidenceLevel: level,
    confidenceLabel: label,
    dimensions,
    missingData: missing,
    improvementSuggestions: suggestions,
  };
}
