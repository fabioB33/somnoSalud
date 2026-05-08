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
  /** Safety screening (Sprint 7) */
  safety?: unknown; // Tipado completo se agrega Sprint 7.
  /** Cuestionarios (Sprint 7) */
  isi?: number[];
  ess?: number[];
  stopBang?: unknown;
  phq9?: number[];
  gad7?: number[];
  dass21?: number[];
  /** Sleep diary (Sprint 7) */
  sleep?: unknown;
  /** Lab opcional (Sprint 7) */
  lab?: unknown;
  /** Genetics opcional (Sprint 7) */
  genetics?: unknown;
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
