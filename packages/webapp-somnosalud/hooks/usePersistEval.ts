'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from '@/lib/persist';
import { createClient } from '@/lib/supabase/client';
import { upsertEvaluationFromState } from '@/app/eval/actions';

/**
 * usePersistEval — hook para leer/escribir la evaluacion parcial.
 *
 * Sprint 9.C: dual-mode. Si hay sesion Supabase activa, write-through a DB
 * con debounce 800ms. Si no hay sesion, comportamiento legacy (sessionStorage
 * only) — los usuarios anonimos siguen funcionando exactamente igual y los
 * 19 E2E Playwright no se rompen.
 *
 * SessionStorage sigue como cache local en ambos casos (incluso logueado)
 * para que el navigation entre pasos sea instantaneo sin esperar al server.
 *
 * @see docs/vault/sprints/sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL.md
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
  /** Sleep diary (Sprint 7.B base + Sprint 9 extension). */
  sleep?: {
    sleepLatencyMin: number;        // tiempo en min para dormirse
    totalHoursAsleep: number;       // horas dormidas tipicas
    timeInBedHours: number;         // horas en cama tipicas
    awakeningsPerNight: number;     // numero de despertares
    qualitySubjective: number;      // 1-10 (10 = mejor)
    bedtimeTypical: string;         // HH:MM 24h
    wakeTimeTypical: string;        // HH:MM 24h
    // Sprint 9 — campos "Mas detalles" opcionales para clinical-engine completo
    earlyAwakeningFreq?: 'never' | 'sometimes' | 'frequently' | 'always';
    earlyAwakeningMin?: number;
    caffeineCupsDay?: number;
    caffeineLastHour?: number;
    screenBeforeBed?: 'never' | 'sometimes' | 'frequently' | 'always';
    treatmentPreference?: 'natural_only' | 'open_to_supplements' | 'open_to_all';
  };
  /** Lab opcional (Sprint 7.B) — keys son codes del clinical-engine. Skip = lab no presente. */
  lab?: Record<string, number>;
  /** Genetics opcional (Sprint 7.B) — keys son gene names, value es genotype string. Skip = genetics no presente. */
  genetics?: Record<string, string>;
}

const DB_DEBOUNCE_MS = 800;

interface PersistResult {
  state: EvalState;
  /** True una vez que el hook leyo sessionStorage + chequeo sesion (post-mount). */
  hydrated: boolean;
  /** True si write-through DB esta activo (hay sesion). */
  persistedToDb: boolean;
  /** UUID de la evaluacion DB activa, si aplica. Null si anonimo. */
  evaluationId: string | null;
  update: (partial: Partial<EvalState>) => void;
  clear: () => void;
}

export function usePersistEval(): PersistResult {
  const [state, setState] = useState<EvalState>({});
  const [hydrated, setHydrated] = useState(false);
  const [persistedToDb, setPersistedToDb] = useState(false);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);

  // Refs para debounce y tracking del state mas reciente.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestStateRef = useRef<EvalState>({});

  // Carga inicial post-mount: sessionStorage + chequeo sesion Supabase.
  useEffect(() => {
    const init = async () => {
      const loaded = loadFromStorage<EvalState>(STORAGE_KEYS.evaluation);
      if (loaded) {
        setState(loaded);
        latestStateRef.current = loaded;
      }

      // Chequeo sesion: si esta logueado, activamos write-through.
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setPersistedToDb(true);
          // Primer sync: si tenia state local, lo upsertea. Sino, crea row vacia
          // cuando llegue el primer update.
          if (loaded && Object.keys(loaded).length > 0) {
            const result = await upsertEvaluationFromState(loaded);
            if (result.ok) {
              setEvaluationId(result.evaluationId);
            }
          }
        }
      } catch {
        // Si falla el chequeo de sesion, seguimos en modo anonimo (sessionStorage only).
        // No bloqueamos al usuario.
      }

      setHydrated(true);
    };
    void init();
  }, []);

  /** Update parcial: merge de fields nuevos sobre el state existente. */
  const update = useCallback(
    (partial: Partial<EvalState>) => {
      setState((prev) => {
        const next = { ...prev, ...partial };
        latestStateRef.current = next;
        saveToStorage(STORAGE_KEYS.evaluation, next);

        // Debounce write-through DB si hay sesion.
        if (persistedToDb) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          debounceTimerRef.current = setTimeout(() => {
            void (async () => {
              const result = await upsertEvaluationFromState(
                latestStateRef.current,
              );
              if (result.ok) {
                setEvaluationId(result.evaluationId);
              }
              // Si falla (db-error / no-session), no rompemos UX — el usuario sigue
              // viendo el state local. Sprint futuro: retry con toast Sonner.
            })();
          }, DB_DEBOUNCE_MS);
        }

        return next;
      });
    },
    [persistedToDb],
  );

  /** Limpia toda la evaluacion (uso: "Empezar de nuevo" o post-submit final). */
  const clear = useCallback(() => {
    setState({});
    latestStateRef.current = {};
    removeFromStorage(STORAGE_KEYS.evaluation);
    setEvaluationId(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    // Nota: NO borramos la row DB. Si el usuario logueado clickea "empezar de
    // nuevo", su evaluacion previa queda con status='in_progress' o 'completed'
    // en su historial. Sprint futuro: opcion "borrar permanentemente" con
    // service_role.
  }, []);

  return {
    state,
    hydrated,
    persistedToDb,
    evaluationId,
    update,
    clear,
  };
}
