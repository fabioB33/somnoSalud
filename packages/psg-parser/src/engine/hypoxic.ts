/**
 * Engine de Carga Hipoxica para PSG (Sprint 18).
 *
 * Migrado 1:1 desde packages/webapp-conversor-psg/legacy-v0/index.html
 * lineas 1648-1737. Regex cutoffs identicos al legacy para preservar
 * resultados clinicos sobre PDFs reales de IFN.
 *
 * Fundamento cientifico: Azarbarzin A et al. "The hypoxic burden of
 * sleep apnoea predicts cardiovascular disease-related mortality."
 * Eur Heart J. 2019;40(14):1149-1157. DOI: 10.1093/eurheartj/ehy624.
 * PMID: 30376054. Ver `clinical-engine/src/references.ts` ->
 * REF_HYPOXIC_AZARBARZIN_2019 para detalle completo.
 *
 * IMPORTANTE: el engine consume `PSGRecord` (metricas agregadas del PDF),
 * NO senal cruda de SpO2. Limitaciones inherentes:
 * - HB (area-under-curve real): NO computable. `hb_score=0`, `hb_available=false`.
 * - Clustering temporal: NO disponible. `mod_temporal` solo usa IAH REM/NREM.
 * - pct_nadir<80: NO disponible. `bonus_nadir=0`.
 * - Mod clinico (edad/comorbilidades): NO implementado, requiere input adicional.
 *
 * Max teorico = 100. Max real sin HB+clustering+nadir<80% = 76.
 */

import type { PSGRecord } from '../types';
import type { HypoxicComponentBreakdown, HypoxicScore } from './types';

/** Convierte field PSGRecord (number | string | undefined) a number, con fallback. */
function asNum(value: number | string | undefined, fallback = 0): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function computeHypoxicScore(record: PSGRecord): HypoxicScore {
  // --- INPUTS desde PSGRecord ---
  const tst_min = asNum(record.tiempo_sueno_total_min, 420);
  const tst_h = tst_min / 60;
  const odi = asNum(record.odi_indice_desaturacion_calculado_por_hora);
  const nadir = asNum(record.spo2_minima_porc, 100);
  const spo2_basal = asNum(
    record.spo2_media_despertar_porc ?? record.spo2_media_total_porc,
    95,
  );
  const t90_min = asNum(
    record.t90_tiempo_spo2_menor_90_min ?? record.spo2_menor_90_tc_min,
  );
  const t90_pct = tst_h > 0 ? ((t90_min / 60) / tst_h) * 100 : 0;
  const t85_min = asNum(record.spo2_menor_85_tc_min);
  const t85_pct = tst_h > 0 ? ((t85_min / 60) / tst_h) * 100 : 0;
  const t80_min = asNum(record.spo2_menor_80_tc_min);
  const t80_pct = tst_h > 0 ? ((t80_min / 60) / tst_h) * 100 : 0;
  const iah = asNum(record.iah_global_por_hora);
  const iah_rem = asNum(record.iah_indice_rem_por_hora);
  const iah_nrem = asNum(record.iah_indice_nrem_por_hora);

  // HB no disponible sin senal cruda — siempre 0 + flag.
  const hb_score = 0;
  const hb_available = false;

  // --- PASO 1: CARGA (0-24 sin HB) ---
  let t90_score: number;
  if (t90_pct < 1) t90_score = 0;
  else if (t90_pct < 3) t90_score = 2;
  else if (t90_pct < 5) t90_score = 4;
  else if (t90_pct < 10) t90_score = 7;
  else if (t90_pct < 15) t90_score = 10;
  else if (t90_pct < 30) t90_score = 13;
  else t90_score = 16;

  let bonus_t85 = 0;
  if (t85_pct > 0 && t90_pct > 0) {
    const r = t85_pct / t90_pct;
    if (r > 0.7) bonus_t85 = 4;
    else if (r > 0.5) bonus_t85 = 2;
  }

  let bonus_t80 = 0;
  if (t80_pct > 5) bonus_t80 = 4;
  else if (t80_pct > 1) bonus_t80 = 2;

  const carga = Math.min(24, t90_score + bonus_t85 + bonus_t80);

  // --- PASO 2: CICLICIDAD (0-16) por ODI ---
  let ciclicidad: number;
  if (odi < 5) ciclicidad = 0;
  else if (odi < 10) ciclicidad = 3;
  else if (odi < 15) ciclicidad = 5;
  else if (odi < 25) ciclicidad = 8;
  else if (odi < 35) ciclicidad = 11;
  else if (odi < 50) ciclicidad = 14;
  else ciclicidad = 16;

  // --- PASO 3: PROFUNDIDAD (0-20) por nadir SpO2 ---
  let prof_base: number;
  if (nadir >= 88) prof_base = 0;
  else if (nadir >= 85) prof_base = 3;
  else if (nadir >= 80) prof_base = 6;
  else if (nadir >= 75) prof_base = 10;
  else if (nadir >= 70) prof_base = 14;
  else prof_base = 16;
  const bonus_nadir = 0; // pct_nadir<80 no disponible sin histograma
  const profundidad = Math.min(20, prof_base);

  // --- PASO 4: MOD BASAL (0-8) por SpO2 vigilia ---
  let mod_basal = 0;
  if (spo2_basal < 88) mod_basal = 8;
  else if (spo2_basal < 90) mod_basal = 6;
  else if (spo2_basal < 92) mod_basal = 4;
  else if (spo2_basal < 95) mod_basal = 2;

  // --- PASO 5: MOD TEMPORAL (0-8) — solo REM/NREM ratio ---
  let mod_temporal = 0;
  if (iah_rem > 0 && iah_nrem > 0 && iah > 5) {
    const ratio = iah_rem / iah_nrem;
    if (ratio >= 2) mod_temporal += 4;
    else if (ratio >= 1.5) mod_temporal += 2;
  }
  mod_temporal = Math.min(8, mod_temporal);

  // --- PASO 6: MOD CLINICO (0-8) — no implementado ---
  const mod_clinico = 0;

  // --- TOTAL ---
  const rawTotal =
    carga + ciclicidad + profundidad + mod_basal + mod_temporal + mod_clinico;
  const maxPossible = 24 + 16 + 20 + 8 + 8 + 0; // 76 sin HB/clustering/nadir<80%/clinico
  const total = Math.max(1, Math.min(100, rawTotal));

  // --- CATEGORIZACION ---
  let categoria: string;
  let catClass: HypoxicScore['catClass'];
  let catDesc: string;
  if (total <= 15) {
    categoria = 'Carga hipóxica leve';
    catClass = 'leve';
    catDesc = 'Daño esperable mínimo.';
  } else if (total <= 39) {
    categoria = 'Carga hipóxica moderada';
    catClass = 'moderada';
    catDesc = 'Daño relevante. Iniciar PAP.';
  } else if (total <= 69) {
    categoria = 'Carga hipóxica alta';
    catClass = 'alta';
    catDesc = 'Daño significativo. Prioridad terapéutica.';
  } else {
    categoria = 'Carga hipóxica crítica';
    catClass = 'critica';
    catDesc = 'Daño severo activo.';
  }

  // --- PERFIL A/B/C ---
  let perfil = '—';
  let perfilDesc =
    '<strong>Perfil no clasificable.</strong> Sin señal cruda de SpO₂, no se puede computar HB para clasificar perfiles A/B/C.';
  if (odi >= 15 && nadir >= 85) {
    perfil = 'C (probable)';
    perfilDesc =
      '<strong>Oscilador rápido superficial (probable).</strong> ODI alto sin profundidad. Requiere HB para confirmar.';
  }

  // --- FLAGS clinicos ---
  const flags: HypoxicScore['flags'] = [];
  if (spo2_basal < 92) {
    flags.push({
      t: 'crit',
      m: `SpO₂ basal (vigilia) ${spo2_basal}% — hipoxemia diurna.`,
    });
  }
  if (nadir < 70) {
    flags.push({ t: 'crit', m: `Nadir ${nadir}% — desaturación extrema.` });
  } else if (nadir < 80) {
    flags.push({
      t: 'warn',
      m: `Nadir ${nadir}% — zona de pendiente empinada curva Hb.`,
    });
  }
  if (odi >= 30) {
    flags.push({ t: 'warn', m: `ODI ${odi} ev/h — ciclicidad muy elevada.` });
  }
  if (iah_rem > 0 && iah_nrem > 0 && iah_rem / iah_nrem >= 2) {
    flags.push({
      t: 'warn',
      m: `IAH REM/NREM = ${(iah_rem / iah_nrem).toFixed(1)} — SAHOS REM-predominante.`,
    });
  }

  // --- BREAKDOWN para UI ---
  const components: HypoxicComponentBreakdown[] = [
    {
      label: 'Carga acumulativa',
      value: carga,
      max: 40,
      color: '#2563eb',
      note: 'Sin HB (máx 24)',
    },
    { label: 'Ciclicidad', value: ciclicidad, max: 16, color: '#7c3aed' },
    {
      label: 'Profundidad',
      value: profundidad,
      max: 20,
      color: '#dc2626',
      note: 'Sin % nadir<80',
    },
    { label: 'Mod. línea basal', value: mod_basal, max: 8, color: '#0891b2' },
    {
      label: 'Mod. temporal',
      value: mod_temporal,
      max: 8,
      color: '#ca8a04',
      note: 'REM/NREM (sin clustering)',
    },
    {
      label: 'Mod. clínico',
      value: mod_clinico,
      max: 8,
      color: '#059669',
      note: 'No implementado',
    },
  ];

  return {
    total,
    categoria,
    catClass,
    catDesc,
    carga,
    ciclicidad,
    profundidad,
    mod_basal,
    mod_temporal,
    mod_clinico,
    hb_score,
    t90_score,
    bonus_t85,
    bonus_t80,
    prof_base,
    bonus_nadir,
    perfil,
    perfilDesc,
    flags,
    hb_available,
    maxPossible,
    odi,
    nadir,
    spo2_basal,
    t90_pct,
    t85_pct,
    t80_pct,
    iah,
    iah_rem,
    iah_nrem,
    spo2_media: asNum(record.spo2_media_total_porc),
    components,
  };
}
