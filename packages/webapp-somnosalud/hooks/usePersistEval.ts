'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from '@/lib/persist';

/**
 * usePersistEval — hook para leer/escribir la evaluacion parcial en sessionStorage.
 *
 * Patron: useState local + sync a sessionStorage en cada cambio. Carga inicial
 * desde sessionStorage en useEffect (SSR-safe).
 *
 * Hasta Sprint 11 (Supabase persistence), este es el unico storage. Despues
 * migra a tabla `evaluations` con RLS multi-tenant + el hook se reemplaza
 * por queries Supabase.
 *
 * @see docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md §1 (RSC vs client)
 */

/** Datos de la evaluacion que persisten entre pantallas. Crece cada sprint. */
export interface EvalState {
  /** Datos del paciente (Sprint 6) */
  profile?: {
    dateOfBirth: string; // ISO 8601 YYYY-MM-DD
    biologicalSex: 'male' | 'female' | 'prefer_not_to_say';
    weightKg: number;
    heightCm: number;
  };
  /** Safety screening (Sprint 7.A) — match con clinical-engine SafetyScreening. */
  safety?: {
    pregnancyStatus: 'yes' | 'no' | 'not_applicable';
    isPregnant: boolean;
    pregnancyWeeks?: number;
    currentMedications: string[];
    anticoagulantFlag: boolean;
    medicalConditions: string[];
    allergies: string[];
    shiftWork: boolean;
    shiftType?: 'night_fixed' | 'rotating' | 'on_call';
    /** Si paciente acepto warning de severity 'restrict' para continuar. */
    acknowledgedRestrict?: boolean;
  };
  /** ISI 7 items, cada uno 0-4 (Sprint 7.A) */
  isi?: number[];
  /** ESS 8 items, cada uno 0-3 (Sprint 7.A) */
  ess?: number[];
  /** STOP-BANG 5 manual respuestas boolean (Sprint 7.A) */
  stopBang?: {
    snoring: boolean;
    tired: boolean;
    observed: boolean;
    pressure: boolean;
    neckOver40cm: boolean;
  };
  /** PHQ-9 9 items, cada uno 0-3 (Sprint 7.B) */
  phq9?: number[];
  /** GAD-7 7 items, cada uno 0-3 (Sprint 7.B) */
  gad7?: number[];
  /** DASS-21 21 items, cada uno 0-3 (Sprint 7.B) */
  dass21?: number[];
  /** Sleep diary (Sprint 7.B) — campos heterogeneos del paciente. */
  sleep?: {
    sleepLatencyMin: number;        // tiempo en min para dormirse
    totalHoursAsleep: number;       // horas dormidas tipicas
    timeInBedHours: number;         // horas en cama tipicas
    awakeningsPerNight: number;     // numero de despertares
    qualitySubjective: number;      // 1-10 (10 = mejor)
    bedtimeTypical: string;         // HH:MM 24h
    wakeTimeTypical: string;        // HH:MM 24h
  };
  /** Lab opcional (Sprint 7.B) — keys son codes del clinical-engine. Skip = lab no presente. */
  lab?: Record<string, number>;
  /** Genetics opcional (Sprint 7.B) — keys son gene names, value es genotype string. Skip = genetics no presente. */
  genetics?: Record<string, string>;
}

export function usePersistEval() {
  const [state, setState] = useState<EvalState>({});
  const [hydrated, setHydrated] = useState(false);

  // Carga inicial post-mount (SSR-safe).
  useEffect(() => {
    const loaded = loadFromStorage<EvalState>(STORAGE_KEYS.evaluation);
    if (loaded) setState(loaded);
    setHydrated(true);
  }, []);

  /** Update parcial: merge de fields nuevos sobre el state existente. */
  const update = useCallback((partial: Partial<EvalState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveToStorage(STORAGE_KEYS.evaluation, next);
      return next;
    });
  }, []);

  /** Limpia toda la evaluacion (uso: "Empezar de nuevo" o post-submit final). */
  const clear = useCallback(() => {
    setState({});
    removeFromStorage(STORAGE_KEYS.evaluation);
  }, []);

  return {
    state,
    /** True una vez que el hook leyo sessionStorage (post-mount). */
    hydrated,
    update,
    clear,
  };
}
