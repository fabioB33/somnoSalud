/**
 * Parser para PDFs BrainWave (PSG completa, formato diagnostico).
 *
 * Migrado 1:1 desde legacy lineas 645-895. Variantes vs Sleepware G3:
 * - Fecha: "23-03-2026" o "23/3/2026"
 * - Hora luces: "23/03/2026 10:08 PM" en vez de "22:14:43"
 * - SpO2 umbrales desde <88% en vez de <95%, agrega <92%
 * - Arousals: tabla simplificada con columnas REM NREM TST Indice
 * - Criterio hipopnea puede ser AASM.4.A y/o 4.B
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num } from '../utils';

/** Convierte hora 12h con AM/PM a string 24h "HH:MM:SS". */
function convertAmPmTo24h(hour: string, ampm: string | undefined): string {
  if (!ampm) {
    return hour.includes(':') && hour.split(':').length === 2 ? `${hour}:00` : hour;
  }
  const parts = hour.split(':');
  let hr = parseInt(parts[0], 10);
  const upper = ampm.toUpperCase();
  if (upper === 'PM' && hr !== 12) hr += 12;
  if (upper === 'AM' && hr === 12) hr = 0;
  return `${String(hr).padStart(2, '0')}:${parts[1]}${parts[2] ? ':' + parts[2] : ':00'}`;
}

export function parseBrainWavePSG(rawText: string): ParserResult<PSGRecord> {
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
  // Sprint 16 fix: el legacy BW (linea 652) tenia regex que no aceptaba coma
  // en el charclass — incoherente con el comentario que decia "BW puede traer
  // 'LAURA GABRIELA GONZALEZ' sin coma" (sugiriendo que tambien hay casos con
  // coma). Agregamos coma al charclass para cubrir ambos casos.
  const name = get(
    /Nombre del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ', .-]+?)(?:\s+Sexo|\s+I\s*N\s*F)/,
    'paciente',
  );
  if (name) {
    const parts = name[1].trim();
    const commaIdx = parts.indexOf(',');
    if (commaIdx > 0) {
      d.paciente_apellido = parts.substring(0, commaIdx).trim();
      d.paciente_nombre = parts.substring(commaIdx + 1).trim();
    } else {
      const tokens = parts.split(/\s+/);
      if (tokens.length >= 2) {
        d.paciente_apellido = tokens[tokens.length - 1];
        d.paciente_nombre = tokens.slice(0, -1).join(' ');
      } else {
        d.paciente_apellido = parts;
        d.paciente_nombre = '';
      }
    }
  }
  const sexo = get(/Sexo:\s*(Femenino|Masculino|F|M)\b/i, 'sexo');
  if (sexo) d.paciente_sexo = sexo[1].charAt(0).toUpperCase();
  const edad = get(/Edad:\s*(\d+)\s*años/, 'edad');
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);

  // --- ESTUDIO ---
  const fecha = get(
    /Fecha del estudio:\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/,
    'fecha_estudio',
  );
  if (fecha) {
    const raw = fecha[1].replace(/-/g, '/');
    const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      d.estudio_fecha = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
  }
  d.estudio_tipo = 'Polisomnografia nocturna';
  d.estudio_software = 'BrainWave';
  const epoca = get(/épocas de (\d+) segundos/, 'epoca');
  if (epoca) d.estudio_epoca_segundos = parseInt(epoca[1], 10);
  const crit = get(/AASM[.\s]*(\d+\.\w[^.]*?)(?:\.\s|\s)/i, 'criterio_hipopnea');
  if (crit) d.estudio_criterio_hipopnea = crit[1].trim();

  // --- ARQUITECTURA SUENO ---
  const apagado = t.match(
    /Hora de apagado de luces:\s*(?:\d{1,2}\/\d{1,2}\/\d{4}\s+)?(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM)?/i,
  );
  if (apagado) {
    d.hora_apagado_luces = convertAmPmTo24h(apagado[1], apagado[2]);
  } else {
    miss.push('apagado');
  }

  const encendido = t.match(
    /Hora de encendido de luces:\s*(?:\d{1,2}\/\d{1,2}\/\d{4}\s+)?(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM)?/i,
  );
  if (encendido) {
    d.hora_encendido_luces = convertAmPmTo24h(encendido[1], encendido[2]);
  } else {
    miss.push('encendido');
  }

  // Mismos campos que Sleepware G3
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
      /Latencia REM \(desde comienzo del sueño\):\s*([\d.]+)/,
    ],
    [
      'latencia_rem_desde_apagado_luces_min',
      /Latencia REM \(desde apagado de luces\):\s*([\d.]+)/,
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
      d[keyDur] = 0;
      d[keyPct] = 0;
    }
    const reLat = new RegExp(
      `${etiqueta}:?\\s*([\\d.]+(?:\\s*minutos)?\\s*[\\d.]+\\s*%).*?${etiqueta}:?\\s*(?:minutos\\s*)?([\\d.]+)`,
    );
    const m2 = t.match(reLat);
    if (m2) d[keyLat] = num(m2[2]);
    // Fallback BW: "N 1: --- " (sin latencia)
    if (d[keyLat] == null) {
      const reLat2 = new RegExp(`Latencia.*?${etiqueta}:?\\s*([\\d.]+|---)`);
      const m3 = t.match(reLat2);
      if (m3 && m3[1] !== '---') d[keyLat] = num(m3[1]);
    }
  };
  stage('N 1', 'n1_duracion_min', 'n1_porc_tst', 'n1_latencia_min');
  stage('N 2', 'n2_duracion_min', 'n2_porc_tst', 'n2_latencia_min');
  stage('N 3', 'n3_duracion_min', 'n3_porc_tst', 'n3_latencia_min');
  stage('R', 'rem_duracion_min', 'rem_porc_tst', 'rem_latencia_min');

  // --- DATOS RESPIRATORIOS (tabla 8 cols simplificada vs Sleepware) ---
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
    'indice_por_hora',
  ];
  const respRows: Array<[string, number]> = [
    ['Número', 0],
    ['Dur\\. media \\(s\\)', 1],
    ['Dur\\. máx\\. \\(s\\)', 2],
    ['Dur\\. total \\(min\\)', 3],
    ['Índice \\(n\\.?º?\\/h(?:\\s*TST)?\\)', 4],
  ];
  for (const [label, rowIdx] of respRows) {
    const re = new RegExp(
      `${label}\\s*:?\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`,
    );
    const m = t.match(re);
    if (m) {
      for (let c = 0; c < 8; c++) {
        d[`${respCols[c]}_${respSuffix[rowIdx]}`] = num(m[c + 1]);
      }
    } else {
      miss.push(`resp_row:${label}`);
    }
  }
  // Renombrar IAH + RDI
  if (d.iah_eventos_indice_por_hora != null) {
    const v = d.iah_eventos_indice_por_hora;
    if (typeof v === 'number') d.iah_global_por_hora = v;
    delete d.iah_eventos_indice_por_hora;
  }
  const rdiVal = d.eventos_respiratorios_total_indice_por_hora;
  if (typeof rdiVal === 'number') d.rdi_indice_trastornos_respiratorios = rdiVal;

  // Recuentos REM/NREM (columna 6 de la fila correspondiente)
  const remRow = t.match(
    /Recuento de REM:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (remRow) d.iah_recuento_rem = num(remRow[6]);
  const nremRow = t.match(
    /Recuento de NREM:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (nremRow) d.iah_recuento_nrem = num(nremRow[6]);
  const remIdx = t.match(
    /Índice de REM:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (remIdx) d.iah_indice_rem_por_hora = num(remIdx[6]);
  const nremIdx = t.match(
    /Índice de NREM:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (nremIdx) d.iah_indice_nrem_por_hora = num(nremIdx[6]);

  // --- POSICION CORPORAL (BW: "No-Supino" en vez de "ARRIBA") ---
  const supino = t.match(/Supino\s+([\d.]+)\s+([\d.]+)/);
  if (supino) {
    d.pos_supino_duracion_min = num(supino[1]) as number;
    d.pos_supino_iah = num(supino[2]) as number;
  }
  const noSup = t.match(
    /No-Supino\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)/,
  );
  if (noSup) {
    d.pos_no_supino_duracion_min = num(noSup[1]) as number;
    d.pos_no_supino_porc_sueno = num(noSup[2]) as number;
    d.pos_no_supino_porc_rem = num(noSup[3]) as number;
    d.pos_no_supino_porc_nrem = num(noSup[4]) as number;
    d.pos_no_supino_apneas_centrales_numero = num(noSup[5]) as number;
    d.pos_no_supino_apneas_obstructivas_numero = num(noSup[6]) as number;
    d.pos_no_supino_apneas_mixtas_numero = num(noSup[7]) as number;
    d.pos_no_supino_hipopneas_numero = num(noSup[8]) as number;
    d.pos_no_supino_iah_por_hora = num(noSup[9]) as number;
    d.pos_no_supino_rera_numero = num(noSup[10]) as number;
    d.pos_no_supino_itr_por_hora = num(noSup[11]) as number;
  }

  // --- AROUSALS BW (tabla simplificada: REM NREM TST Indice) ---
  const arousalBW = (label: string, prefix: string): void => {
    const re = new RegExp(`${label}:?\\s*(\\d+)\\s+(\\d+)\\s+(\\d+)\\s+([\\d.]+)`);
    const m = t.match(re);
    if (m) {
      d[`${prefix}_rem`] = num(m[1]);
      d[`${prefix}_nrem`] = num(m[2]);
      d[`${prefix}_dl_mas_d`] = num(m[3]);
      d[`${prefix}_indice_dl_mas_d`] = num(m[4]);
    }
  };
  arousalBW('Respiratorio', 'arousal_respiratorio');
  arousalBW('Movimiento de\\s*piernas', 'arousal_movimiento_piernas');
  arousalBW('Ronquidos', 'arousal_ronquidos');
  arousalBW('Espontáneo', 'arousal_espontaneo');
  arousalBW('Total', 'arousal_total');

  const idxAr = t.match(
    /Índice de despertares\s*ligeros:?\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/,
  );
  if (idxAr) {
    d.indice_despertares_ligeros_rem = num(idxAr[1]) as number;
    d.indice_despertares_ligeros_nrem = num(idxAr[2]) as number;
    d.indice_despertares_ligeros_global = num(idxAr[3]) as number;
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

  // --- SpO2 (BW umbrales <88, <92, <90, <85, <80, <70, <60, <50) ---
  const nDesat = t.match(/N\.º de desat\.?\s*rel\.?\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (nDesat) {
    d.desaturaciones_relevantes_despertar_numero = num(nDesat[1]) as number;
    d.desaturaciones_relevantes_nrem_numero = num(nDesat[2]) as number;
    d.desaturaciones_relevantes_rem_numero = num(nDesat[3]) as number;
    d.desaturaciones_relevantes_total_numero = num(nDesat[4]) as number;
  }
  const spo2Media = t.match(/%\s*de SpO2 media:?\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
  if (spo2Media) {
    d.spo2_media_despertar_porc = num(spo2Media[1]) as number;
    d.spo2_media_nrem_porc = num(spo2Media[2]) as number;
    d.spo2_media_rem_porc = num(spo2Media[3]) as number;
    d.spo2_media_total_porc = num(spo2Media[4]) as number;
  }
  const spo2Min = t.match(/%\s*de SpO2\s*m[ií]nima:?\s*(\d+)/);
  if (spo2Min) d.spo2_minima_porc = num(spo2Min[1]) as number;

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
    }
  };
  spo2Row('<88%', 'spo2_menor_88');
  spo2Row('<92%', 'spo2_menor_92');
  spo2Row('<90%', 'spo2_menor_90');
  spo2Row('<85%', 'spo2_menor_85');
  spo2Row('<80%', 'spo2_menor_80');
  spo2Row('<70%', 'spo2_menor_70');
  spo2Row('<60%', 'spo2_menor_60');
  spo2Row('<\\s*50%', 'spo2_menor_50');

  // T90 = tiempo total con SpO2 < 90% en TC
  if (d.spo2_menor_90_tc_min != null) {
    const v = d.spo2_menor_90_tc_min;
    if (typeof v === 'number') d.t90_tiempo_spo2_menor_90_min = v;
  }

  // ODI calculado
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

  return { data: d, missing: miss };
}
