/**
 * Parser para PDFs BMC Medical CPAP (tratamiento/titulacion).
 *
 * Migrado 1:1 desde legacy lineas 1193-1257. Caracteristicas:
 * - "Nombre del paciente: APELLIDO, NOMBRE" con coma.
 * - Sexo "Genero: Masculino|Femenino|M|F".
 * - Fecha de nacimiento formato "YYYY/MM/DD" (NO el DD/MM/YYYY del resto).
 * - "Fecha de inicio YYYY-MM-DD" o "Informe generado en: YYYY/MM/DD".
 * - Indices respiratorios con notacion (AHI), (AI), (HI), (OAI), (CAI).
 * - Promedio tiempo de uso formato "HH:MM".
 */

import type { ParserResult, PSGRecord } from '../types';
import { normalizeWhitespace, num } from '../utils';

export function parseBMCTratamiento(rawText: string): ParserResult<PSGRecord> {
  const t = normalizeWhitespace(rawText);
  const d: PSGRecord = {};
  const miss: string[] = [];

  // --- PACIENTE ---
  // Sprint 17 fix: greedy capture incluia "Género|Edad|Fecha" tras
  // normalizeWhitespace. Lookahead a Género|Sexo|Edad|Fecha|Tipo|$ corta el match.
  const name = t.match(
    /Nombre del paciente:\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+,\s*[A-ZÁÉÍÓÚÑa-záéíóúñ' .-]+?)(?=\s+(?:Género|Genero|Sexo|Edad|Fecha|Tipo|FDN)|$)/,
  );
  if (name) {
    const parts = name[1].split(',');
    d.paciente_apellido = parts[0].trim();
    d.paciente_nombre = (parts[1] || '').trim();
  }
  const sexo = t.match(/Género:\s*(Masculino|Femenino|M|F)/i);
  if (sexo) d.paciente_sexo = sexo[1].charAt(0).toUpperCase();
  const edad = t.match(/Edad:\s*(\d+)/);
  if (edad) d.paciente_edad_anios = parseInt(edad[1], 10);
  const fdn = t.match(/Fecha de nacimiento:\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
  if (fdn) {
    const parts = fdn[1].split('/');
    d.paciente_fecha_nacimiento = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }

  // --- DISPOSITIVO ---
  const tipo = t.match(/Tipo de dispositivo:\s*([^\n]+?)(?:\s*Modelo|\s*SN)/i);
  if (tipo) d.estudio_software = `BMC ${tipo[1].trim()}`;
  else d.estudio_software = 'BMC CPAP';
  d.estudio_tipo = 'Titulacion CPAP';

  // --- FECHA ---
  const fecha = t.match(/Fecha de inicio\s*(\d{4}-\d{2}-\d{2})/);
  if (fecha) {
    d.estudio_fecha = fecha[1];
  } else {
    const fecha2 = t.match(/Informe generado en:\s*(\d{4}\/\d{1,2}\/\d{1,2})/);
    if (fecha2) {
      const parts = fecha2[1].split('/');
      d.estudio_fecha = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }

  // --- USO ---
  const usoPromedio = t.match(
    /Promedio tiempo de uso diario\(solo d[ií]as de uso\)\s*(\d+):(\d+)/,
  );
  if (usoPromedio) {
    d.cpap_uso_promedio_min =
      parseInt(usoPromedio[1], 10) * 60 + parseInt(usoPromedio[2], 10);
  }
  const usoPorcGe4 = t.match(/%\s*De d[ií]as usados >= 4\.0 horas\s*(\d+)%/);
  if (usoPorcGe4) d.cpap_dias_4h_porc = num(usoPorcGe4[1]) as number;

  // --- PRESION ---
  const presP95 = t.match(/Percentil 95:\s*([\d.]+)\s*cmH2O/);
  if (presP95) d.cpap_presion_p95_cmh2o = num(presP95[1]) as number;
  const presPromedio = t.match(/Promedio:\s*([\d.]+)\s*cmH2O/);
  if (presPromedio) d.cpap_presion_mediana_cmh2o = num(presPromedio[1]) as number;

  // --- INDICES RESPIRATORIOS ---
  const ahi = t.match(/[ÍI]ndice de apnea hipopnea \(AHI\):\s*([\d.]+)/);
  if (ahi) d.iah_global_por_hora = num(ahi[1]) as number;
  const ai = t.match(/[ÍI]ndice de apnea \(AI\):\s*([\d.]+)/);
  if (ai) d.apneas_total_indice_por_hora = num(ai[1]) as number;
  const hi = t.match(/[ÍI]ndice de hipopnea \(HI\):\s*([\d.]+)/);
  if (hi) d.hipopneas_indice_por_hora = num(hi[1]) as number;
  const oai = t.match(/[ÍI]ndice de apnea obstructiva \(OAI\):\s*([\d.]+)/);
  if (oai) d.apneas_obstructivas_indice_por_hora = num(oai[1]) as number;
  const cai = t.match(/[ÍI]ndice de apnea central \(CAI\):\s*([\d.]+)/);
  if (cai) d.apneas_centrales_indice_por_hora = num(cai[1]) as number;

  // --- FUGA ---
  const fugaP95 = t.match(/Fuga.*?Percentil 95:\s*([\d.]+)\s*LPM/i);
  if (fugaP95) d.cpap_fuga_p95_lpm = num(fugaP95[1]) as number;

  // RDI = IAH global
  const iahGlobal = d.iah_global_por_hora;
  if (typeof iahGlobal === 'number') {
    d.rdi_indice_trastornos_respiratorios = iahGlobal;
  }

  return { data: d, missing: miss };
}
