/**
 * Parser para PDFs ResMed AirView Diagnostico (poligrafia).
 *
 * Migrado 1:1 desde legacy lineas 1001-1106. Caracteristicas:
 * - Indices respiratorios desglosados: IAH/IA/IH + AI por tipo (obstr/centr/mixta)
 * - Cheyne-Stokes especifico (porcentaje del tiempo)
 * - Pulso min/promedio/max (frecuencia cardiaca)
 * - Duracion expresada como "h:mm" -> convertir a minutos
 * - Posicion "Supino" + "No supino" con IAH propio
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num, parseSpanishDate } from '../utils';

export function parseResMedDiagnostico(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  // --- PACIENTE ---
  const name = t.match(
    /^\d{1,2}\/\d{1,2}\/\d{4}\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+,\s*[A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+)/,
  );
  if (name) {
    const parts = name[1].split(',');
    d.paciente_apellido = parts[0].trim();
    d.paciente_nombre = (parts[1] || '').trim();
  } else {
    const name2 = t.match(
      /([A-ZÁÉÍÓÚÑa-záéíóúñ]+),\s*([A-ZÁÉÍÓÚÑa-záéíóúñ ]+?)(?:INSTITUTO|Identificación|Fecha)/,
    );
    if (name2) {
      d.paciente_apellido = name2[1].trim();
      d.paciente_nombre = name2[2].trim();
    }
  }
  const fdn = t.match(/Fecha de nacimiento:\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (fdn) {
    const p = parseSpanishDate(fdn[1]);
    if (p) d.paciente_fecha_nacimiento = p.iso;
  }
  const edad = t.match(/Edad:\s*(\d+)/);
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);

  // --- ESTUDIO ---
  const fecha = t.match(/Datos de la grabaci[oó]n\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (fecha) {
    const p = parseSpanishDate(fecha[1]);
    if (p) d.estudio_fecha = p.iso;
  }
  d.estudio_tipo = 'Poligrafia respiratoria';

  // Dispositivo
  const disp = t.match(/Dispositivo\s+([\w\s]+?)\s+Tipo:\s*(II+)/i);
  if (disp) d.estudio_software = `ResMed ${disp[1].trim()} (Tipo ${disp[2]})`;
  else d.estudio_software = 'ResMed AirView';

  // Duracion "h:mm" -> minutos
  const durEval = t.match(/Evaluación del flujo.*?Duración\s*[–-]\s*h:\s*(\d+):(\d+)/);
  if (durEval) {
    d.tiempo_sueno_total_min = parseInt(durEval[1], 10) * 60 + parseInt(durEval[2], 10);
  }

  // --- INDICES RESPIRATORIOS ---
  const iah = t.match(
    /[ÍI]ndice de eventos\s*IAH:\s*([\d.]+)\s*IA:\s*([\d.]+)\s*IH:\s*([\d.]+)/,
  );
  if (iah) {
    d.iah_global_por_hora = num(iah[1]) as number;
    d.apneas_total_indice_por_hora = num(iah[2]) as number;
    d.hipopneas_indice_por_hora = num(iah[3]) as number;
  }
  const evTot = t.match(
    /Eventos totales\s*Apneas:\s*(\d+)\s*Hipo(?:a)?pneas:\s*(\d+)/i,
  );
  if (evTot) {
    const apneas = num(evTot[1]);
    const hipo = num(evTot[2]);
    d.apneas_total_numero = apneas;
    d.hipopneas_numero = hipo;
    if (typeof apneas === 'number' && typeof hipo === 'number') {
      d.iah_eventos_numero = apneas + hipo;
      d.eventos_respiratorios_total_numero = apneas + hipo;
    }
  }
  const aiTypes = t.match(
    /AI\s*Obstructiva:\s*([\d.]+)\s*Central:\s*([\d.]+)\s*Mixta:\s*([\d.]+)/,
  );
  if (aiTypes) {
    d.apneas_obstructivas_indice_por_hora = num(aiTypes[1]) as number;
    d.apneas_centrales_indice_por_hora = num(aiTypes[2]) as number;
    d.apneas_mixtas_indice_por_hora = num(aiTypes[3]) as number;
  }
  // Cheyne-Stokes
  const cs = t.match(
    /Cheyne-Stokes\s*Tiempo\s*[–-]\s*h:\s*(\d+):(\d+)\s*Porcentaje:\s*(\d+)/,
  );
  if (cs) d.cheyne_stokes_porc = num(cs[3]) as number;

  // --- SpO2 ---
  const ido = t.match(/Desaturaci[oó]n de ox[ií]geno\s*IDO:\s*([\d.]+)/);
  if (ido) d.odi_indice_desaturacion_calculado_por_hora = num(ido[1]) as number;
  const spo2 = t.match(
    /%\s*de saturaci[oó]n de ox[ií]geno\s*L[ií]nea\s*basal:\s*(\d+)\s*Promedio:\s*(\d+)\s*M[ií]nimo:\s*(\d+)/i,
  );
  if (spo2) {
    d.spo2_media_despertar_porc = num(spo2[1]) as number;
    d.spo2_media_total_porc = num(spo2[2]) as number;
    d.spo2_minima_porc = num(spo2[3]) as number;
  }
  // Tiempo bajo umbrales (proxy: <=88% como aproximacion de T90)
  const sat88 = t.match(/<=88%\s*(?:sat:)?\s*(?:tiempo-h:)?\s*(\d+):?(\d+)?/i);
  if (sat88) {
    const mins =
      parseInt(sat88[1], 10) * 60 + (sat88[2] ? parseInt(sat88[2], 10) : 0);
    d.t90_tiempo_spo2_menor_90_min = mins;
  }

  // --- POSICION ---
  const posSupino = t.match(/Supino\s*Tiempo\s*[–-]\s*h\s*([\d:]+)\s*([\d.]+)/);
  if (posSupino) {
    const parts = posSupino[1].split(':');
    d.pos_supino_duracion_min =
      parseInt(parts[0], 10) * 60 + (parts[1] ? parseInt(parts[1], 10) : 0);
  }
  const iahSup = t.match(/Supino.*?IAH:\s*([\d.]+)/);
  if (iahSup) d.pos_supino_iah = num(iahSup[1]) as number;
  const iahNoSup = t.match(/No supino.*?IAH:\s*([\d.]+)/);
  if (iahNoSup) d.pos_no_supino_iah_por_hora = num(iahNoSup[1]) as number;

  // --- PULSO ---
  const pulso = t.match(
    /Pulso\s*[–-]\s*rpm\s*M[ií]n\.?:\s*(\d+)\s*Promedio:\s*(\d+)\s*M[áa]x\.?:\s*(\d+)/,
  );
  if (pulso) {
    d.fc_minima_lpm = num(pulso[1]) as number;
    d.fc_media_sueno_lpm = num(pulso[2]) as number;
    d.fc_maxima_lpm = num(pulso[3]) as number;
  }

  // --- RONQUIDOS ---
  const ronq = t.match(/Ronquidos:\s*(\d+)/);
  if (ronq) d.ronquidos_episodios_numero = num(ronq[1]) as number;

  // RDI = IAH global
  const iahGlobal = d.iah_global_por_hora;
  if (typeof iahGlobal === 'number') d.rdi_indice_trastornos_respiratorios = iahGlobal;

  // Criterio
  const critRM = t.match(/Criterios análisis:\s*(AASM[^;]+)/i);
  if (critRM) d.estudio_criterio_hipopnea = critRM[1].trim();

  return { data: d, missing: miss };
}
