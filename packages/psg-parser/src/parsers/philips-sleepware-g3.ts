/**
 * Parser para PDFs Philips Sleepware G3 (PSG completa, formato diagnostico).
 *
 * Migrado 1:1 desde packages/webapp-conversor-psg/legacy-v0/index.html
 * lineas 316-636 (Sprint 15, 2026-05-14). Regex y shape de output
 * identicos al legacy para facilitar verificacion empirica con PDFs
 * reales de IFN.
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num, parseSpanishDate } from '../utils';

export function parsePhilipsSleepwareG3(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  const get = (re: RegExp, name: string): RegExpMatchArray | null => {
    const m = t.match(re);
    if (!m) {
      miss.push(name);
      return null;
    }
    return m;
  };

  // --- PACIENTE ---
  const name = get(
    /Nombre del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+),\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+?)\s+(?:Sexo|Sleepware|INFORME|FDN)/,
    'paciente',
  );
  if (name) {
    d.paciente_apellido = name[1].trim();
    d.paciente_nombre = name[2].trim();
  }
  const sexo = get(/Sexo:\s*([MFmfXx])\b/, 'sexo');
  if (sexo) d.paciente_sexo = sexo[1].toUpperCase();

  const fdn = get(/FDN[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/, 'fdn');
  if (fdn) {
    const p = parseSpanishDate(fdn[1]);
    if (p) d.paciente_fecha_nacimiento = p.iso;
  }
  const edad = get(/Edad:\s*(\d+)\s*años/, 'edad');
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);

  // --- ESTUDIO ---
  const fecha = get(/Fecha del estudio:\s*(\d{1,2}\/\d{1,2}\/\d{4})/, 'fecha_estudio');
  if (fecha) {
    const p = parseSpanishDate(fecha[1]);
    if (p) d.estudio_fecha = p.iso;
  }
  d.estudio_tipo = 'Polisomnografia nocturna';
  if (/Sleepware G3 Philips Respironics/.test(t)) {
    d.estudio_software = 'Sleepware G3 Philips Respironics';
  }
  const epoca = get(/épocas de (\d+) segundos/, 'epoca');
  if (epoca) d.estudio_epoca_segundos = parseInt(epoca[1], 10);
  const crit = get(
    /AASM\.?\s*VIII\s*4\.B\s*\((\d+)%\s*desaturación\)/i,
    'criterio_hipopnea',
  );
  if (crit) d.estudio_criterio_hipopnea = `AASM VIII4.B (${crit[1]}% desaturacion)`;

  // --- ARQUITECTURA DEL SUENO ---
  const apagado = get(/Hora de apagado de luces:\s*(\d{1,2}:\d{2}:\d{2})/, 'apagado');
  if (apagado) d.hora_apagado_luces = apagado[1];
  const encendido = get(/Hora de encendido de luces:\s*(\d{1,2}:\d{2}:\d{2})/, 'encendido');
  if (encendido) d.hora_encendido_luces = encendido[1];

  const pairs: Array<[string, RegExp]> = [
    ['tiempo_grabacion_total_min', /Tiempo de grabación total \(TGT\):\s*([\d.]+)\s*minutos/],
    ['tiempo_en_cama_min', /Tiempo en cama \(TC\):\s*([\d.]+)\s*minutos/],
    ['tiempo_periodo_sueno_min', /Tiempo de período de sueño \(TPS\):\s*([\d.]+)\s*minutos/],
    ['tiempo_sueno_total_min', /Tiempo de sueño total \(TST\):\s*([\d.]+)\s*minutos/],
    ['eficiencia_sueno_porc', /Eficiencia del sueño:\s*([\d.]+)\s*%/],
    ['latencia_sueno_min', /Comienzo del sueño:\s*([\d.]+)\s*minutos/],
    ['wake_after_sleep_onset_waso_min', /DTIS:\s*([\d.]+)\s*minutos/],
    [
      'latencia_rem_desde_inicio_sueno_min',
      /Latencia REM \(desde comienzo del sueño\):\s*([\d.]+)\s*minutos/,
    ],
    [
      'latencia_rem_desde_apagado_luces_min',
      /Latencia REM \(desde apagado de luces\):\s*([\d.]+)\s*minutos/,
    ],
  ];
  for (const [k, re] of pairs) {
    const m = get(re, k);
    if (m) d[k] = num(m[1]);
  }

  // --- ESTADIFICACION ---
  const stage = (
    etiqueta: string,
    keyDur: string,
    keyPct: string,
    keyLat: string,
  ): void => {
    const re = new RegExp(`${etiqueta}:?\\s*([\\d.]+)\\s*minutos\\s*([\\d.]+)\\s*%`);
    const m = t.match(re);
    if (m) {
      d[keyDur] = num(m[1]);
      d[keyPct] = num(m[2]);
    } else {
      miss.push(keyDur);
    }
    const reLat = new RegExp(
      `${etiqueta}:?\\s*[\\d.]+\\s*minutos\\s*[\\d.]+\\s*%.*?${etiqueta}:?\\s*(?:minutos\\s*)?([\\d.]+)(?:\\s*minutos)?`,
    );
    const m2 = t.match(reLat);
    if (m2) d[keyLat] = num(m2[1]);
    else miss.push(keyLat);
  };
  stage('N 1', 'n1_duracion_min', 'n1_porc_tst', 'n1_latencia_min');
  stage('N 2', 'n2_duracion_min', 'n2_porc_tst', 'n2_latencia_min');
  stage('N 3', 'n3_duracion_min', 'n3_porc_tst', 'n3_latencia_min');
  stage('R', 'rem_duracion_min', 'rem_porc_tst', 'rem_latencia_min');

  // --- HIPNOGRAMA (pie chart) ---
  const hip: Record<string, RegExp> = {
    hipnograma_wake_porc: /WK\s*\(([\d.]+)\s*%\)/,
    hipnograma_rem_porc: /REM\s*\(([\d.]+)\s*%\)/,
    hipnograma_n1_porc: /N1\s*\(([\d.]+)\s*%\)/,
    hipnograma_n2_porc: /N2\s*\(([\d.]+)\s*%\)/,
    hipnograma_n3_porc: /N3\s*\(([\d.]+)\s*%\)/,
  };
  for (const [k, re] of Object.entries(hip)) {
    const m = t.match(re);
    if (m) d[k] = num(m[1]);
  }

  // --- DATOS RESPIRATORIOS (tabla 8 cols x 10 filas) ---
  const respCols = [
    'apneas_centrales',
    'apneas_obstructivas',
    'apneas_mixtas',
    'apneas_total',
    'hipopneas',
    'iah_eventos',
    'rera',
    'eventos_respiratorios_total',
  ];
  const respSuffix = [
    'numero',
    'duracion_media_seg',
    'duracion_maxima_seg',
    'duracion_total_min',
    'porc_tst',
    'indice_por_hora',
    'recuento_rem',
    'recuento_nrem',
    'indice_rem',
    'indice_nrem',
  ];
  const respRows: Array<[string, number]> = [
    ['Número', 0],
    ['Dur\\. media \\(s\\)', 1],
    ['Dur\\. máx\\. \\(s\\)', 2],
    ['Dur\\. total \\(min\\)', 3],
    ['% de TST', 4],
    ['Índice \\(n\\.º/h TST\\)', 5],
    ['Recuento de REM', 6],
    ['Recuento de NREM', 7],
    ['Índice de REM', 8],
    ['Índice de NREM', 9],
  ];
  for (const [label, rowIdx] of respRows) {
    const re = new RegExp(
      `${label}\\s*:?\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`,
    );
    const m = t.match(re);
    if (m) {
      for (let c = 0; c < 8; c++) {
        const key = `${respCols[c]}_${respSuffix[rowIdx]}`;
        d[key] = num(m[c + 1]);
      }
    } else {
      miss.push(`resp_row:${label}`);
    }
  }

  // Renames especificos del schema wide (mantenidos del legacy)
  const renames: Record<string, string | null> = {
    iah_eventos_numero: 'iah_eventos_numero',
    iah_eventos_duracion_media_seg: 'iah_eventos_duracion_media_seg',
    iah_eventos_duracion_maxima_seg: 'iah_eventos_duracion_maxima_seg',
    iah_eventos_duracion_total_min: 'iah_eventos_duracion_total_min',
    iah_eventos_porc_tst: 'iah_eventos_porc_tst',
    iah_eventos_indice_por_hora: 'iah_global_por_hora',
    iah_eventos_recuento_rem: 'iah_recuento_rem',
    iah_eventos_recuento_nrem: 'iah_recuento_nrem',
    iah_eventos_indice_rem: 'iah_indice_rem_por_hora',
    iah_eventos_indice_nrem: 'iah_indice_nrem_por_hora',
    rera_indice_por_hora: 'rera_indice_por_hora',
    eventos_respiratorios_total_indice_por_hora:
      'eventos_respiratorios_total_indice_por_hora',
    eventos_respiratorios_total_recuento_rem: null,
    eventos_respiratorios_total_recuento_nrem: null,
    eventos_respiratorios_total_indice_rem: null,
    eventos_respiratorios_total_indice_nrem: null,
    rera_recuento_rem: 'rera_recuento_rem',
    rera_recuento_nrem: 'rera_recuento_nrem',
    rera_indice_rem: null,
    rera_indice_nrem: null,
  };
  for (const [from, to] of Object.entries(renames)) {
    if (from in d) {
      if (to && to !== from) {
        d[to] = d[from];
        delete d[from];
      } else if (to === null) {
        delete d[from];
      }
    }
  }
  // RDI = indice total
  const rdiValue = d['eventos_respiratorios_total_indice_por_hora'];
  if (typeof rdiValue === 'number') {
    d.rdi_indice_trastornos_respiratorios = rdiValue;
  }

  // --- POSICION CORPORAL ---
  const supino = t.match(/Supino\s+(\d+)\s+([\d.]+)/);
  if (supino) {
    d.pos_supino_duracion_min = num(supino[1]) as number;
    d.pos_supino_iah = num(supino[2]) as number;
  } else {
    d.pos_supino_duracion_min = 0;
    d.pos_supino_iah = 0;
  }
  const arriba = t.match(
    /ARRIBA:?\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)\s+(\d+)/,
  );
  if (arriba) {
    d.pos_no_supino_duracion_min = num(arriba[1]) as number;
    d.pos_no_supino_porc_sueno = num(arriba[2]) as number;
    d.pos_no_supino_porc_rem = num(arriba[3]) as number;
    d.pos_no_supino_porc_nrem = num(arriba[4]) as number;
    d.pos_no_supino_apneas_centrales_numero = num(arriba[5]) as number;
    d.pos_no_supino_apneas_obstructivas_numero = num(arriba[6]) as number;
    d.pos_no_supino_apneas_mixtas_numero = num(arriba[7]) as number;
    d.pos_no_supino_hipopneas_numero = num(arriba[8]) as number;
    d.pos_no_supino_iah_por_hora = num(arriba[9]) as number;
    d.pos_no_supino_rera_numero = num(arriba[10]) as number;
    d.pos_no_supino_itr_por_hora = num(arriba[11]) as number;
    d.pos_no_supino_desaturaciones_numero = num(arriba[12]) as number;
  } else {
    miss.push('pos_no_supino');
  }

  // --- DESPERTARES LIGEROS ---
  const arousalRow = (label: string, prefix: string): void => {
    const re = new RegExp(
      `${label}:?\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+([\\d.]+)`,
    );
    const m = t.match(re);
    if (m) {
      d[`${prefix}_rem`] = num(m[1]);
      d[`${prefix}_nrem`] = num(m[2]);
      d[`${prefix}_desp_ligeros`] = num(m[3]);
      d[`${prefix}_despertares`] = num(m[4]);
      d[`${prefix}_dl_mas_d`] = num(m[5]);
      d[`${prefix}_indice_dl_mas_d`] = num(m[6]);
    } else {
      miss.push(`arousal:${label}`);
    }
  };
  arousalRow('Respiratorio', 'arousal_respiratorio');
  arousalRow('Movimiento de piernas', 'arousal_movimiento_piernas');
  arousalRow('Ronquidos', 'arousal_ronquidos');
  arousalRow('Espontáneo', 'arousal_espontaneo');
  arousalRow('Total', 'arousal_total');

  const idxAr = t.match(
    /Índice de despertares ligeros:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (idxAr) {
    d.indice_despertares_ligeros_rem = num(idxAr[1]) as number;
    d.indice_despertares_ligeros_nrem = num(idxAr[2]) as number;
    d.indice_despertares_ligeros_global = num(idxAr[3]) as number;
    d.indice_despertares_completos = num(idxAr[4]) as number;
  } else {
    miss.push('idx_despertares_ligeros');
  }

  // --- MOVIMIENTOS PIERNAS ---
  const mpTotal = t.match(/Movimiento de piernas total:?\s*(\d+)\s+([\d.]+)/);
  if (mpTotal) {
    d.movimientos_piernas_total_recuento = num(mpTotal[1]) as number;
    d.movimientos_piernas_total_indice_por_hora = num(mpTotal[2]) as number;
  }
  const mpe = t.match(/MPE:?\s*(\d+)\s+([\d.]+)/);
  if (mpe) {
    d.mpe_movimientos_periodicos_recuento = num(mpe[1]) as number;
    d.mpe_movimientos_periodicos_indice_por_hora = num(mpe[2]) as number;
  }
  const mpeAr = t.match(/Despertares ligeros por MPE:?\s*(\d+)\s+([\d.]+)/);
  if (mpeAr) {
    d.mpe_con_arousal_recuento = num(mpeAr[1]) as number;
    d.mpe_con_arousal_indice_por_hora = num(mpeAr[2]) as number;
  }

  // --- RONQUIDOS ---
  const ronq = t.match(/Episodios de ronquidos:?\s*(\d+)/);
  if (ronq) d.ronquidos_episodios_numero = num(ronq[1]) as number;
  const ronqT = t.match(/Tiempo con ronquidos total:?\s*(\d+)\s*min/);
  if (ronqT) d.ronquidos_tiempo_total_min = num(ronqT[1]) as number;

  // --- SATURACION OXIGENO ---
  const nDesat = t.match(/N\.º de desat\.?\s*rel\.?\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (nDesat) {
    d.desaturaciones_relevantes_despertar_numero = num(nDesat[1]) as number;
    d.desaturaciones_relevantes_nrem_numero = num(nDesat[2]) as number;
    d.desaturaciones_relevantes_rem_numero = num(nDesat[3]) as number;
    d.desaturaciones_relevantes_total_numero = num(nDesat[4]) as number;
  } else {
    miss.push('n_desat');
  }
  const spo2Media = t.match(/%\s*de SpO2 media:?\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (spo2Media) {
    d.spo2_media_despertar_porc = num(spo2Media[1]) as number;
    d.spo2_media_nrem_porc = num(spo2Media[2]) as number;
    d.spo2_media_rem_porc = num(spo2Media[3]) as number;
    d.spo2_media_total_porc = num(spo2Media[4]) as number;
  }
  const spo2Min = t.match(/%\s*de SpO2 mínima:?\s*(\d+)/);
  if (spo2Min) d.spo2_minima_porc = num(spo2Min[1]) as number;

  // ODI calculado (no reportado): desat totales / TST(h)
  if (
    typeof d.desaturaciones_relevantes_total_numero === 'number' &&
    typeof d.tiempo_sueno_total_min === 'number' &&
    d.tiempo_sueno_total_min > 0
  ) {
    d.odi_indice_desaturacion_calculado_por_hora =
      Math.round(
        (d.desaturaciones_relevantes_total_numero / (d.tiempo_sueno_total_min / 60)) * 10,
      ) / 10;
  }

  // Niveles SpO2: 8 columnas (Desp min%, NREM min%, REM min%, TC min%)
  const spo2Row = (label: string, prefix: string): void => {
    const re = new RegExp(
      `${label}\\s*[:;]?\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`,
    );
    const m = t.match(re);
    if (m) {
      d[`${prefix}_despertar_min`] = num(m[1]);
      d[`${prefix}_despertar_porc`] = num(m[2]);
      d[`${prefix}_nrem_min`] = num(m[3]);
      d[`${prefix}_nrem_porc`] = num(m[4]);
      d[`${prefix}_rem_min`] = num(m[5]);
      d[`${prefix}_rem_porc`] = num(m[6]);
      d[`${prefix}_tc_min`] = num(m[7]);
      d[`${prefix}_tc_porc`] = num(m[8]);
    } else {
      miss.push(`spo2:${label}`);
    }
  };
  spo2Row('<95%', 'spo2_menor_95');
  spo2Row('<90%', 'spo2_menor_90');
  spo2Row('<85%', 'spo2_menor_85_full');
  spo2Row('<80%', 'spo2_menor_80_full');
  spo2Row('<\\s*75%', 'spo2_menor_75_full');
  spo2Row('<70%', 'spo2_menor_70_full');
  spo2Row('<60%', 'spo2_menor_60_full');
  spo2Row('<\\s*50%', 'spo2_menor_50_full');

  // Reducir niveles profundos a campos por TC (schema wide consolidado)
  const reduce: Array<[string, string]> = [
    ['spo2_menor_85_full', 'spo2_menor_85'],
    ['spo2_menor_80_full', 'spo2_menor_80'],
    ['spo2_menor_75_full', 'spo2_menor_75'],
    ['spo2_menor_70_full', 'spo2_menor_70'],
    ['spo2_menor_60_full', 'spo2_menor_60'],
    ['spo2_menor_50_full', 'spo2_menor_50'],
  ];
  for (const [fp, tp] of reduce) {
    if (d[`${fp}_tc_min`] != null) {
      d[`${tp}_tc_min`] = d[`${fp}_tc_min`];
    }
    if (d[`${fp}_tc_porc`] != null) {
      d[`${tp}_tc_porc`] = d[`${fp}_tc_porc`];
    }
    for (const k of [
      'despertar_min',
      'despertar_porc',
      'nrem_min',
      'nrem_porc',
      'rem_min',
      'rem_porc',
      'tc_min',
      'tc_porc',
    ]) {
      delete d[`${fp}_${k}`];
    }
  }

  // T90 = tiempo total con SpO2 < 90% en TC
  if (d.spo2_menor_90_tc_min != null) {
    d.t90_tiempo_spo2_menor_90_min = d.spo2_menor_90_tc_min;
  }

  // Artefactos SpO2
  const artef = t.match(
    /Artefacto\/datos\s*err[óo]neos:?\s*([\d.]+)\s*[-–]?\s*([\d.]+)\s*[-–]?\s*([\d.]+)\s*[-–]?\s*([\d.]+)/,
  );
  if (artef) {
    d.spo2_artefacto_despertar_min = num(artef[1]) as number;
    d.spo2_artefacto_nrem_min = num(artef[2]) as number;
    d.spo2_artefacto_rem_min = num(artef[3]) as number;
    d.spo2_artefacto_tc_min = num(artef[4]) as number;
  } else {
    miss.push('artefacto');
  }

  return { data: d, missing: miss };
}
