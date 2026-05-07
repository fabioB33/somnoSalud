/**
 * Clasificador de Fenotipo de Insomnio — SomnoSalud
 * ====================================================
 * Clasifica el tipo de insomnio del paciente basado en sus
 * respuestas sobre patrones de sueño.
 *
 * FENOTIPOS (basado en ICSD-3 e ISI):
 * - Insomnio de inicio (onset): dificultad para conciliar el sueño
 * - Insomnio de mantenimiento (maintenance): despertares nocturnos
 * - Insomnio mixto (mixed): ambos patrones
 * - Sin insomnio clínico (none): ISI <8
 *
 * REFERENCIA:
 * American Academy of Sleep Medicine. International Classification
 * of Sleep Disorders. 3rd ed (ICSD-3). Darien, IL: AASM; 2014.
 *
 * Criterios operativos SomnoSalud:
 * - Latencia de inicio ≥30 min → componente de onset
 * - Despertares nocturnos ≥2 con dificultad para volver a dormir → maintenance
 * - Despertar precoz ≥30 min antes de lo deseado ≥3 noches/semana → maintenance
 * - Ambos presentes → mixed
 *
 * @version 1.0.0
 */

import type { SleepData } from '../types';

export type InsomniaPhenotype = 'onset' | 'maintenance' | 'mixed' | 'none';

export interface PhenotypeResult {
  phenotype: InsomniaPhenotype;
  phenotypeLabel: string;
  hasOnsetComponent: boolean;
  hasMaintenanceComponent: boolean;
  details: {
    sleepLatencyMinutes: number;
    nightAwakenings: number;
    earlyMorningAwakeningMinutes: number;
    totalSleepHours: number;
    sleepEfficiencyPercent: number;
  };
  clinicalNote: string;
  reference: string;
}

// Umbrales clínicos según ICSD-3
const ONSET_LATENCY_THRESHOLD = 30;        // minutos
const MAINTENANCE_AWAKENINGS_THRESHOLD = 2; // despertares
const EARLY_AWAKENING_THRESHOLD = 30;       // minutos antes de lo deseado
const NORMAL_SLEEP_EFFICIENCY = 85;         // porcentaje

/**
 * Calcular eficiencia del sueño.
 * SE = (tiempo dormido / tiempo en cama) × 100
 */
function sleepEfficiency(totalSleepHours: number, timeInBedHours: number): number {
  if (timeInBedHours <= 0) return 0;
  return Math.round((totalSleepHours / timeInBedHours) * 100 * 10) / 10;
}

export function classifyInsomniaPhenotype(
  sleepData: SleepData,
  isiTotalScore: number
): PhenotypeResult {
  // Si ISI <8, no hay insomnio clínico
  if (isiTotalScore < 8) {
    const se = sleepEfficiency(sleepData.totalSleepHours, sleepData.timeInBedHours);
    return {
      phenotype: 'none',
      phenotypeLabel: 'Sin insomnio clínico',
      hasOnsetComponent: false,
      hasMaintenanceComponent: false,
      details: {
        sleepLatencyMinutes: sleepData.sleepLatencyMinutes,
        nightAwakenings: sleepData.nightAwakenings,
        earlyMorningAwakeningMinutes: sleepData.earlyMorningAwakeningMinutes,
        totalSleepHours: sleepData.totalSleepHours,
        sleepEfficiencyPercent: se,
      },
      clinicalNote: `ISI = ${isiTotalScore} (<8). No se alcanza umbral clínico de insomnio. Eficiencia del sueño: ${se}%.`,
      reference: 'AASM. ICSD-3. 2014.',
    };
  }

  const hasOnset = sleepData.sleepLatencyMinutes >= ONSET_LATENCY_THRESHOLD;
  const hasMaintenance =
    sleepData.nightAwakenings >= MAINTENANCE_AWAKENINGS_THRESHOLD ||
    sleepData.earlyMorningAwakeningMinutes >= EARLY_AWAKENING_THRESHOLD;

  let phenotype: InsomniaPhenotype;
  let phenotypeLabel: string;

  if (hasOnset && hasMaintenance) {
    phenotype = 'mixed';
    phenotypeLabel = 'Insomnio mixto (inicio + mantenimiento)';
  } else if (hasOnset) {
    phenotype = 'onset';
    phenotypeLabel = 'Insomnio de inicio (dificultad para conciliar)';
  } else if (hasMaintenance) {
    phenotype = 'maintenance';
    phenotypeLabel = 'Insomnio de mantenimiento (despertares / despertar precoz)';
  } else {
    // ISI ≥8 pero sin patrón claro → clasificar como mixto leve
    phenotype = 'mixed';
    phenotypeLabel = 'Insomnio inespecífico (ISI elevado sin patrón dominante)';
  }

  const se = sleepEfficiency(sleepData.totalSleepHours, sleepData.timeInBedHours);

  const notes: string[] = [];
  if (hasOnset) notes.push(`Latencia de sueño ${sleepData.sleepLatencyMinutes} min (≥${ONSET_LATENCY_THRESHOLD})`);
  if (sleepData.nightAwakenings >= MAINTENANCE_AWAKENINGS_THRESHOLD) {
    notes.push(`${sleepData.nightAwakenings} despertares nocturnos (≥${MAINTENANCE_AWAKENINGS_THRESHOLD})`);
  }
  if (sleepData.earlyMorningAwakeningMinutes >= EARLY_AWAKENING_THRESHOLD) {
    notes.push(`Despertar precoz ${sleepData.earlyMorningAwakeningMinutes} min antes (≥${EARLY_AWAKENING_THRESHOLD})`);
  }
  if (se < NORMAL_SLEEP_EFFICIENCY) {
    notes.push(`Eficiencia del sueño baja: ${se}% (<${NORMAL_SLEEP_EFFICIENCY}%)`);
  }

  return {
    phenotype,
    phenotypeLabel,
    hasOnsetComponent: hasOnset,
    hasMaintenanceComponent: hasMaintenance,
    details: {
      sleepLatencyMinutes: sleepData.sleepLatencyMinutes,
      nightAwakenings: sleepData.nightAwakenings,
      earlyMorningAwakeningMinutes: sleepData.earlyMorningAwakeningMinutes,
      totalSleepHours: sleepData.totalSleepHours,
      sleepEfficiencyPercent: se,
    },
    clinicalNote: `ISI = ${isiTotalScore}. Fenotipo: ${phenotypeLabel}. ${notes.join('. ')}.`,
    reference: 'AASM. ICSD-3. 2014.',
  };
}
