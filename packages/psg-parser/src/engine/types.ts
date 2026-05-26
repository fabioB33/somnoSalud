/**
 * Tipos del Engine Hipoxico (Sprint 18).
 *
 * Score 0-100 con 6 componentes basado en Azarbarzin 2019
 * (REF_HYPOXIC_AZARBARZIN_2019 en clinical-engine/references.ts).
 *
 * Sin senal cruda SpO2, max real ~76. HB / clustering / nadir<80 % marcados
 * como NA en `hb_available=false`.
 */

export type HypoxicCategoryClass = 'leve' | 'moderada' | 'alta' | 'critica';

export interface HypoxicFlag {
  /** 'crit' = critico, 'warn' = atencion. */
  t: 'crit' | 'warn';
  /** Mensaje en espanol para mostrar al clinico. */
  m: string;
}

export interface HypoxicComponentBreakdown {
  /** Etiqueta para UI. */
  label: string;
  /** Valor obtenido (0..max). */
  value: number;
  /** Maximo teorico del componente. */
  max: number;
  /** Color de barra para UI. */
  color: string;
  /** Nota opcional (ej. "Sin HB max 24"). */
  note?: string;
}

export interface HypoxicScore {
  // --- TOTALS ---
  /** Score total 0-100 (real ~76 sin HB+clustering+nadir<80%). */
  total: number;
  /** Categoria en espanol ("Carga hipoxica leve/moderada/alta/critica"). */
  categoria: string;
  /** Clase CSS para UI ("leve"|"moderada"|"alta"|"critica"). */
  catClass: HypoxicCategoryClass;
  /** Descripcion clinica corta ("Dano esperable minimo", etc). */
  catDesc: string;

  // --- 6 COMPONENTES ---
  carga: number;
  ciclicidad: number;
  profundidad: number;
  mod_basal: number;
  mod_temporal: number;
  mod_clinico: number;

  // --- SUB-SCORES DEBUG ---
  hb_score: number;
  t90_score: number;
  bonus_t85: number;
  bonus_t80: number;
  prof_base: number;
  bonus_nadir: number;

  // --- PERFIL Y FLAGS ---
  /** Perfil A/B/C o '—' cuando no clasificable sin HB. */
  perfil: string;
  /** HTML descriptivo (legacy preserva markup en strong). */
  perfilDesc: string;
  flags: HypoxicFlag[];

  // --- METADATA ---
  /** False cuando no hay senal cruda — limita max a ~76. */
  hb_available: boolean;
  /** Max teorico real considerando lo no-implementado. */
  maxPossible: number;

  // --- RAW INPUTS ECHO (UI debug) ---
  odi: number;
  nadir: number;
  spo2_basal: number;
  t90_pct: number;
  t85_pct: number;
  t80_pct: number;
  iah: number;
  iah_rem: number;
  iah_nrem: number;
  spo2_media: number;

  /** Breakdown para componentes en UI (barras). */
  components: HypoxicComponentBreakdown[];
}
