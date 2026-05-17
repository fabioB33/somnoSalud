/**
 * Tipos compartidos del psg-parser.
 *
 * PSGRecord: shape ancho con todos los campos posibles que cualquiera de los
 * 7 parsers puede producir. Diferentes equipos llenan diferentes subsets,
 * todos los campos son opcionales para que cada parser pueda producir un
 * record parcial valido.
 */

/** Formato/equipo del cual viene el PDF. */
export type EquipmentFormat =
  | 'philips_sleepware_g3'
  | 'philips_nightone'
  | 'brainwave_psg'
  | 'resmed_diagnostico'
  | 'resmed_tratamiento'
  | 'bmc_tratamiento'
  | 'bmc_poligrafo'
  | 'sleepware_like'
  | 'unknown';

/** Tipo de estudio segun el equipo. */
export type StudyType = 'diagnostico' | 'tratamiento' | 'unknown';

/** Info de auto-deteccion del formato. */
export interface FormatInfo {
  format: EquipmentFormat;
  label: string;
  type: StudyType;
}

/** Resultado de un parser: datos extraidos + lista de campos faltantes. */
export interface ParserResult<T = PSGRecord> {
  data: T;
  missing: string[];
}

/**
 * Record polisomnografico ancho. Todos los campos opcionales porque
 * diferentes equipos llenan diferentes subsets. Naming consistente con
 * el legacy `legacy-v0/index.html` (Sprint 15 mantiene shape 1:1 para
 * facilitar verificacion empirica vs PDFs reales).
 */
export interface PSGRecord {
  // --- PACIENTE ---
  paciente_apellido?: string;
  paciente_nombre?: string;
  paciente_sexo?: string;
  paciente_fecha_nacimiento?: string;
  paciente_edad_anios?: number;

  // --- ESTUDIO ---
  estudio_fecha?: string;
  estudio_tipo?: string;
  estudio_software?: string;
  estudio_epoca_segundos?: number;
  estudio_criterio_hipopnea?: string;

  // --- ARQUITECTURA DEL SUENO ---
  hora_apagado_luces?: string;
  hora_encendido_luces?: string;
  tiempo_grabacion_total_min?: number;
  tiempo_en_cama_min?: number;
  tiempo_periodo_sueno_min?: number;
  tiempo_sueno_total_min?: number;
  eficiencia_sueno_porc?: number;
  latencia_sueno_min?: number;
  wake_after_sleep_onset_waso_min?: number;
  latencia_rem_desde_inicio_sueno_min?: number;
  latencia_rem_desde_apagado_luces_min?: number;

  // --- ESTADIFICACION ---
  n1_duracion_min?: number;
  n1_porc_tst?: number;
  n1_latencia_min?: number;
  n2_duracion_min?: number;
  n2_porc_tst?: number;
  n2_latencia_min?: number;
  n3_duracion_min?: number;
  n3_porc_tst?: number;
  n3_latencia_min?: number;
  rem_duracion_min?: number;
  rem_porc_tst?: number;
  rem_latencia_min?: number;

  // --- HIPNOGRAMA (pie chart porcentajes) ---
  hipnograma_wake_porc?: number;
  hipnograma_rem_porc?: number;
  hipnograma_n1_porc?: number;
  hipnograma_n2_porc?: number;
  hipnograma_n3_porc?: number;

  // --- DATOS RESPIRATORIOS (8 columnas x 10 filas) ---
  // Se genera dinamicamente con keys tipo "apneas_centrales_numero",
  // "hipopneas_duracion_media_seg", etc. Para mantener flexibilidad
  // sin enumerar 80 campos aqui, usamos index signature.

  // --- POSICION CORPORAL ---
  pos_supino_duracion_min?: number;
  pos_supino_iah?: number;
  pos_no_supino_duracion_min?: number;
  pos_no_supino_porc_sueno?: number;
  pos_no_supino_porc_rem?: number;
  pos_no_supino_porc_nrem?: number;
  pos_no_supino_apneas_centrales_numero?: number;
  pos_no_supino_apneas_obstructivas_numero?: number;
  pos_no_supino_apneas_mixtas_numero?: number;
  pos_no_supino_hipopneas_numero?: number;
  pos_no_supino_iah_por_hora?: number;
  pos_no_supino_rera_numero?: number;
  pos_no_supino_itr_por_hora?: number;
  pos_no_supino_desaturaciones_numero?: number;

  // --- DESPERTARES (arousal) ---
  indice_despertares_ligeros_rem?: number;
  indice_despertares_ligeros_nrem?: number;
  indice_despertares_ligeros_global?: number;
  indice_despertares_completos?: number;

  // --- MOVIMIENTOS PIERNAS ---
  movimientos_piernas_total_recuento?: number;
  movimientos_piernas_total_indice_por_hora?: number;
  mpe_movimientos_periodicos_recuento?: number;
  mpe_movimientos_periodicos_indice_por_hora?: number;
  mpe_con_arousal_recuento?: number;
  mpe_con_arousal_indice_por_hora?: number;

  // --- RONQUIDOS ---
  ronquidos_episodios_numero?: number;
  ronquidos_tiempo_total_min?: number;

  // --- SATURACION OXIGENO ---
  desaturaciones_relevantes_despertar_numero?: number;
  desaturaciones_relevantes_nrem_numero?: number;
  desaturaciones_relevantes_rem_numero?: number;
  desaturaciones_relevantes_total_numero?: number;
  spo2_media_despertar_porc?: number;
  spo2_media_nrem_porc?: number;
  spo2_media_rem_porc?: number;
  spo2_media_total_porc?: number;
  spo2_minima_porc?: number;
  odi_indice_desaturacion_calculado_por_hora?: number;

  // --- NIVELES SpO2 (TC: tiempo en cama por umbral) ---
  spo2_menor_95_despertar_min?: number;
  spo2_menor_95_despertar_porc?: number;
  spo2_menor_95_nrem_min?: number;
  spo2_menor_95_nrem_porc?: number;
  spo2_menor_95_rem_min?: number;
  spo2_menor_95_rem_porc?: number;
  spo2_menor_95_tc_min?: number;
  spo2_menor_95_tc_porc?: number;
  spo2_menor_90_despertar_min?: number;
  spo2_menor_90_despertar_porc?: number;
  spo2_menor_90_nrem_min?: number;
  spo2_menor_90_nrem_porc?: number;
  spo2_menor_90_rem_min?: number;
  spo2_menor_90_rem_porc?: number;
  spo2_menor_90_tc_min?: number;
  spo2_menor_90_tc_porc?: number;
  spo2_menor_85_tc_min?: number;
  spo2_menor_85_tc_porc?: number;
  spo2_menor_80_tc_min?: number;
  spo2_menor_80_tc_porc?: number;
  spo2_menor_75_tc_min?: number;
  spo2_menor_75_tc_porc?: number;
  spo2_menor_70_tc_min?: number;
  spo2_menor_70_tc_porc?: number;
  spo2_menor_60_tc_min?: number;
  spo2_menor_60_tc_porc?: number;
  spo2_menor_50_tc_min?: number;
  spo2_menor_50_tc_porc?: number;
  t90_tiempo_spo2_menor_90_min?: number;

  // --- ARTEFACTOS SpO2 ---
  spo2_artefacto_despertar_min?: number;
  spo2_artefacto_nrem_min?: number;
  spo2_artefacto_rem_min?: number;
  spo2_artefacto_tc_min?: number;

  // --- ARRITMIAS / INDICES GLOBALES ---
  rdi_indice_trastornos_respiratorios?: number;

  // --- INDICES RESPIRATORIOS POR TIPO (Sprint 16 — ResMed Diag) ---
  apneas_total_indice_por_hora?: number;
  apneas_centrales_indice_por_hora?: number;
  apneas_obstructivas_indice_por_hora?: number;
  apneas_mixtas_indice_por_hora?: number;
  hipopneas_indice_por_hora?: number;
  cheyne_stokes_porc?: number;

  // --- FRECUENCIA CARDIACA (Sprint 16 — Philips NightOne + ResMed Diag) ---
  fc_media_sueno_lpm?: number;
  fc_minima_lpm?: number;
  fc_maxima_lpm?: number;

  // --- SpO2 umbrales adicionales (Sprint 16 — BrainWave usa <88% y <92%) ---
  spo2_menor_88_despertar_min?: number;
  spo2_menor_88_despertar_porc?: number;
  spo2_menor_88_nrem_min?: number;
  spo2_menor_88_nrem_porc?: number;
  spo2_menor_88_rem_min?: number;
  spo2_menor_88_rem_porc?: number;
  spo2_menor_88_tc_min?: number;
  spo2_menor_88_tc_porc?: number;
  spo2_menor_92_despertar_min?: number;
  spo2_menor_92_despertar_porc?: number;
  spo2_menor_92_nrem_min?: number;
  spo2_menor_92_nrem_porc?: number;
  spo2_menor_92_rem_min?: number;
  spo2_menor_92_rem_porc?: number;
  spo2_menor_92_tc_min?: number;
  spo2_menor_92_tc_porc?: number;

  /**
   * Campos dinamicos que los parsers generan con naming derivado
   * (ej. apneas_centrales_numero, hipopneas_indice_por_hora, etc).
   * Index signature acepta number | string | undefined porque algunos
   * parsers producen strings (ej. estudio_software).
   */
  [key: string]: number | string | undefined;
}
