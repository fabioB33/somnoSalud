/**
 * Parser para PDFs ResMed AirView Tratamiento (CPAP titulacion + cumplimiento).
 *
 * Migrado 1:1 desde legacy lineas 1109-1190. Caracteristicas:
 * - Identificacion del paciente (no "Nombre del paciente") — split por whitespace.
 * - Dispositivo AirSense (AirSense 10/11 etc.).
 * - Rango de fechas "DD/MM/YYYY - DD/MM/YYYY" (start/end).
 * - Indices CPAP: uso promedio, % dias >=4h, presion mediana + p95, fuga p95.
 * - Indices respiratorios desglosados IAH/IA/IH + IAC + IAO + RERA.
 * - Cheyne-Stokes opcional (minutos + porcentaje o CSR%).
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num, parseSpanishDate } from '../utils';

export function parseResMedTratamiento(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  // --- PACIENTE ---
  // Sprint 17 fix: legacy regex greedy capturaba hasta "Edad" cuando
  // normalizeWhitespace colapsa el \n separador. Lookahead a Edad|Fecha|FDN|
  // dispositivos AirSense + final de string corta el match.
  const name = t.match(
    /Identificaci[oó]n del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]+?)(?=\s+(?:Edad|Fecha|FDN|AirSense|\d{1,2}\/)|$)/,
  );
  if (name) {
    const parts = name[1].trim().split(/\s+/);
    if (parts.length >= 2) {
      d.paciente_apellido = parts[0];
      d.paciente_nombre = parts.slice(1).join(' ');
    } else {
      d.paciente_apellido = parts[0];
    }
  }
  const fdn = t.match(/Fecha de nacimiento:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (fdn) {
    const p = parseSpanishDate(fdn[1]);
    if (p) d.paciente_fecha_nacimiento = p.iso;
  }
  const edad = t.match(/Edad:\s*(\d+)\s*años/);
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);

  // --- DISPOSITIVO ---
  // Sprint 17 fix: \w+ greedy capturaba dígitos sueltos posteriores
  // (ej "AirSense 11 1/5/2026" -> "AirSense 11 1"). Restringimos a tokens
  // alfabeticos opcionales (AutoSet, Elite, AutoSet For Her, etc.).
  const disp = t.match(/(AirSense\s*\d+(?:\s+[A-Za-z][A-Za-z\s]*?)?)\b/);
  if (disp) d.estudio_software = `ResMed ${disp[1].trim()}`;
  else d.estudio_software = 'ResMed AirView CPAP';
  d.estudio_tipo = 'Titulacion CPAP';

  // --- FECHA (rango "DD/MM/YYYY - DD/MM/YYYY") ---
  const fechaRange = t.match(
    /(\d{1,2}\/\d{1,2}\/\d{4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/,
  );
  if (fechaRange) {
    const pStart = parseSpanishDate(fechaRange[1]);
    if (pStart) d.estudio_fecha = pStart.iso;
    const pEnd = parseSpanishDate(fechaRange[2]);
    if (pEnd) d.estudio_fecha_fin = pEnd.iso;
  }

  // --- USO ---
  const uso =
    t.match(/Uso promedio.*?(\d+)\s*horas?\s*(\d+)\s*minutos?/i) ||
    t.match(/Uso\/d[ií]a.*?(\d+)\s*h(?:oras?)?\s*(\d+)/i);
  if (uso) {
    d.cpap_uso_promedio_min =
      parseInt(uso[1], 10) * 60 + parseInt(uso[2], 10);
  }
  const usoDias = t.match(/D[ií]as de uso\s*(\d+)\/(\d+)/);
  if (usoDias) {
    d.cpap_dias_uso = parseInt(usoDias[1], 10);
    d.cpap_dias_total = parseInt(usoDias[2], 10);
  }
  const uso4h = t.match(/>=\s*4\s*horas?\s*(\d+)\s*(?:d[ií]as?)?\s*\((\d+)%\)/);
  if (uso4h) d.cpap_dias_4h_porc = num(uso4h[2]) as number;

  // --- PRESION ---
  const presP95 =
    t.match(/Percentil\s*95[:\s]*([\d.]+)\s*cmH2O/i) ||
    t.match(/Percentil\s*95\s*\(promedio\)\s*([\d.]+)/i);
  if (presP95) d.cpap_presion_p95_cmh2o = num(presP95[1]) as number;
  const presMediana = t.match(/Presi[oó]n.*?Mediana[:\s]*([\d.]+)/i);
  if (presMediana) d.cpap_presion_mediana_cmh2o = num(presMediana[1]) as number;

  // --- INDICES RESPIRATORIOS ---
  const iah = t.match(/IAH[:\s]*([\d.]+)/);
  if (iah) d.iah_global_por_hora = num(iah[1]) as number;
  const ia = t.match(/\bIA[:\s]*([\d.]+)/);
  if (ia) d.apneas_total_indice_por_hora = num(ia[1]) as number;
  const ih = t.match(/\bIH[:\s]*([\d.]+)/);
  if (ih) d.hipopneas_indice_por_hora = num(ih[1]) as number;
  const iac = t.match(/IAC[:\s]*([\d,.]+)/);
  if (iac) d.apneas_centrales_indice_por_hora = num(iac[1]) as number;
  const iao = t.match(/IAO[:\s]*([\d,.]+)/);
  if (iao) d.apneas_obstructivas_indice_por_hora = num(iao[1]) as number;
  const rera = t.match(/RERA[:\s]*([\d,.]+)/);
  if (rera) d.rera_indice_por_hora = num(rera[1]);

  // Cheyne-Stokes (formato "N minutos (P%)" o "CSR% P")
  const cs =
    t.match(/Cheyne-Stokes.*?(\d+)\s*minutos?\s*\((\d+)%\)/i) ||
    t.match(/CSR%\s*([\d.]+)/);
  if (cs) {
    d.cheyne_stokes_porc = num(cs[2] ?? cs[1]) as number;
  }

  // --- SpO2 ---
  const spo2Med = t.match(/SpO2.*?Mediana[:\s]*(\d+)/i);
  if (spo2Med) d.spo2_media_total_porc = num(spo2Med[1]) as number;
  const t88 = t.match(/Tiempo\s*<\s*88%[:\s]*(\d+)\s*min/i);
  if (t88) d.t90_tiempo_spo2_menor_90_min = num(t88[1]) as number; // proxy

  // --- FUGA ---
  const fugaP95 = t.match(/Fuga.*?Percentil\s*95[:\s]*([\d.]+)/i);
  if (fugaP95) d.cpap_fuga_p95_lpm = num(fugaP95[1]) as number;

  // RDI = IAH global
  const iahGlobal = d.iah_global_por_hora;
  if (typeof iahGlobal === 'number') {
    d.rdi_indice_trastornos_respiratorios = iahGlobal;
  }

  return { data: d, missing: miss };
}
