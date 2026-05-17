/**
 * Parser para PDFs Philips Alice NightOne (poligrafia respiratoria sin EEG).
 *
 * Migrado 1:1 desde legacy lineas 898-998. Subset reducido del PSGRecord
 * porque la poligrafia no captura datos de EEG (no hay estadificacion,
 * arousal, ni latencia REM real). TM (Tiempo de Monitorizacion) se mapea
 * a tiempo_sueno_total_min como aproximacion (no es TST real sin EEG).
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num, parseSpanishDate } from '../utils';

export function parsePhilipsNightOne(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  // --- PACIENTE ---
  // Sprint 16 fix: legacy regex era greedy y agarraba "NOMBRE Sexo" hasta el
  // siguiente charclass-break. Agregamos lookahead a Sexo|Edad|FDN|Study|$
  // para cortar antes del proximo campo (preservando funcionalidad legacy
  // cuando el separador real era \n que normalizeWhitespace colapsa).
  const name = t.match(
    /Nombre\s*del\s*paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+,\s*[A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+?)(?=\s+(?:Sexo|Edad|FDN|Study)|$)/,
  );
  if (name) {
    const parts = name[1].split(',');
    d.paciente_apellido = parts[0].trim();
    d.paciente_nombre = (parts[1] || '').trim();
  }
  const sexo = t.match(/Sexo:\s*([MFmf])\b/);
  if (sexo) d.paciente_sexo = sexo[1].toUpperCase();
  const edad = t.match(/Edad:\s*(\d+)\s*(?:años|years)/);
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);
  const fdn = t.match(/FDN[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (fdn) {
    const p = parseSpanishDate(fdn[1]);
    if (p) d.paciente_fecha_nacimiento = p.iso;
  }

  // --- ESTUDIO ---
  const fecha = t.match(/Study Date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (fecha) {
    const p = parseSpanishDate(fecha[1]);
    if (p) d.estudio_fecha = p.iso;
  }
  d.estudio_tipo = 'Poligrafia respiratoria';
  d.estudio_software = 'Philips Alice NightOne';

  // Tiempos
  const tgt = t.match(/Tiempo de grabación total \(TGT\):\s*([\d.]+)\s*minutes?/);
  if (tgt) d.tiempo_grabacion_total_min = num(tgt[1]) as number;
  const tc = t.match(/Tiempo en cama \(TC\):\s*([\d.]+)\s*minutes?/);
  if (tc) d.tiempo_en_cama_min = num(tc[1]) as number;
  const tm = t.match(/Tiempo de monitorización \(TM\):\s*([\d.]+)\s*minutes?/);
  if (tm) d.tiempo_sueno_total_min = num(tm[1]) as number;

  // --- EVENTOS RESPIRATORIOS ---
  const evRows: Array<[RegExp, string]> = [
    [/Apneas centrales\s+([\d.]+)\s+(\d+)/, 'apneas_centrales'],
    [/Apneas obstructivas\s+([\d.]+)\s+(\d+)/, 'apneas_obstructivas'],
    [/Apneas mixtas\s+([\d.]+)\s+(\d+)/, 'apneas_mixtas'],
    [/Hipopneas\s+([\d.]+)\s+(\d+)/, 'hipopneas'],
    [/Apneas \+ hipopneas\s+([\d.]+)\s+(\d+)/, 'iah_eventos'],
    [/RERA\s+([\d.]+)\s+(\d+)/, 'rera'],
    [/Total\s+([\d.]+)\s+(\d+)/, 'eventos_respiratorios_total'],
  ];
  for (const [re, prefix] of evRows) {
    const m = t.match(re);
    if (m) {
      d[`${prefix}_indice_por_hora`] = num(m[1]);
      d[`${prefix}_numero`] = num(m[2]);
    }
  }
  const iahVal = d.iah_eventos_indice_por_hora;
  if (typeof iahVal === 'number') d.iah_global_por_hora = iahVal;
  const rdiVal = d.eventos_respiratorios_total_indice_por_hora;
  if (typeof rdiVal === 'number') d.rdi_indice_trastornos_respiratorios = rdiVal;

  // --- POSICION ---
  // Sprint 16 fix: legacy requeria \n|$ que desaparece tras normalizeWhitespace.
  // Aceptamos espacio simple como separador.
  const posData = t.match(/Supino\s+(\d+)\s+([\d.]+)\b/);
  if (posData) {
    d.pos_supino_duracion_min = num(posData[1]) as number;
    d.pos_supino_iah = num(posData[2]) as number;
  }

  // --- SpO2 ---
  const spo2Min =
    t.match(/%\s*de\s*SpO2\s*más\s*baja\s*durante\s*el\s*sueño.*?(\d+)/i) ||
    t.match(/Lowest\s*Desat\s*(\d+)/i);
  if (spo2Min) d.spo2_minima_porc = num(spo2Min[1]) as number;

  const spo2Media = t.match(/Media\s*\(%\)\s*(?:\n\s*)?(\d+)/);
  if (spo2Media) d.spo2_media_total_porc = num(spo2Media[1]) as number;

  const nDesat =
    t.match(/N\.º total de desat\.\s*(\d+)/i) ||
    t.match(/Total\s*de\s*desat[.\s]*(\d+)/i);
  if (nDesat) d.desaturaciones_relevantes_total_numero = num(nDesat[1]) as number;

  const odi = t.match(/[ÍI]ndice\s*desat\.\s*\(n\.?º?\/?hora\)\s*([\d.]+)/i);
  if (odi) d.odi_indice_desaturacion_calculado_por_hora = num(odi[1]) as number;

  // Tiempo bajo umbrales
  const t90 = t.match(/<90\s*%\s*([\d.]+)/);
  if (t90) d.t90_tiempo_spo2_menor_90_min = num(t90[1]) as number;
  const t85 = t.match(/<85\s*%\s*([\d.]+)/);
  if (t85) d.spo2_menor_85_tc_min = num(t85[1]) as number;

  // --- FRECUENCIA CARDIACA ---
  const fcMedia = t.match(/FC\s*media\s*durante\s*el\s*sueño\s*([\d.]+)/i);
  if (fcMedia) d.fc_media_sueno_lpm = num(fcMedia[1]) as number;

  // --- RONQUIDOS ---
  const ronq = t.match(/Episodios de ronquidos totales\s*(\d+)/i);
  if (ronq) d.ronquidos_episodios_numero = num(ronq[1]) as number;

  return { data: d, missing: miss };
}
