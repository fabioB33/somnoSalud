/**
 * Auto-deteccion de formato del PDF polisomnografico.
 *
 * Migrado 1:1 desde legacy lineas 229-288. Examina el texto extraido del PDF
 * y determina el equipo/formato. Sprint 16: cobertura para 4 formatos
 * disponibles. Sprint 17 agregara ResMed Trat + BMC Trat + BMC Poli.
 */

import type { FormatInfo } from './types';
import { normalizeWhitespace } from './utils';

export function detectFormat(rawText: string): FormatInfo {
  const t = normalizeWhitespace(rawText);

  // Philips Sleepware G3 — PSG completa
  if (/Sleepware\s*G3\s*Philips\s*Respironics/i.test(t)) {
    return {
      format: 'philips_sleepware_g3',
      label: 'Philips Sleepware G3 (PSG)',
      type: 'diagnostico',
    };
  }

  // Philips Alice NightOne — Poligrafia
  if (/Alice\s*NightOne/i.test(t) && /Informe\s*de\s*prueba\s*del\s*su/i.test(t)) {
    return {
      format: 'philips_nightone',
      label: 'Philips Alice NightOne (Poligrafia)',
      type: 'diagnostico',
    };
  }

  // ResMed AirView — Diagnostico (poligrafia)
  if (/ResMed\s*AirView/i.test(t) && /Informe\s*de\s*diagn[oó]stico/i.test(t)) {
    return {
      format: 'resmed_diagnostico',
      label: 'ResMed AirView (Diagnostico)',
      type: 'diagnostico',
    };
  }

  // ResMed AirView — Tratamiento (Sprint 17 agrega el parser)
  if (
    /ResMed\s*AirView/i.test(t) &&
    (/Informe\s*de\s*cumplimiento/i.test(t) ||
      /Informe\s*de\s*tratamiento/i.test(t) ||
      /Informe\s*detallado/i.test(t))
  ) {
    return {
      format: 'resmed_tratamiento',
      label: 'ResMed AirView (Tratamiento/CPAP)',
      type: 'tratamiento',
    };
  }

  // ResMed generico
  if (/ResMed\s*AirView/i.test(t)) {
    return {
      format: 'resmed_tratamiento',
      label: 'ResMed AirView',
      type: 'tratamiento',
    };
  }

  // BMC Tratamiento (Sprint 17)
  if (/BMC\s*Medical\s*Co/i.test(t) && /INFORME\s*DE\s*TRATAMIENTO/i.test(t)) {
    return {
      format: 'bmc_tratamiento',
      label: 'BMC (Tratamiento/CPAP)',
      type: 'tratamiento',
    };
  }

  // BMC Poligrafia (Sprint 17)
  if (
    /BMC/i.test(t) &&
    (/Arquitectura\s*del\s*Sue[ñn]o/i.test(t) ||
      /Evento\s*Respiratorio/i.test(t) ||
      /SWStaging/i.test(t))
  ) {
    return {
      format: 'bmc_poligrafo',
      label: 'BMC (Poligrafia diagnostica)',
      type: 'diagnostico',
    };
  }

  // BrainWave (formato similar a Sleepware G3 sin el tag)
  const tCollapsed = t.replace(/(?<=[A-ZÁÉÍÓÚÑ]) (?=[A-ZÁÉÍÓÚÑ] |[A-ZÁÉÍÓÚÑ]$)/g, '');
  if (
    /INFORME\s*POLISOMNOG/i.test(tCollapsed) &&
    /AC\s+AO\s+AM\s+Apnea/i.test(t) &&
    !/Sleepware\s*G3/i.test(t)
  ) {
    return {
      format: 'brainwave_psg',
      label: 'BrainWave (PSG)',
      type: 'diagnostico',
    };
  }

  // Fallback: estructura tipica PSG con tablas respiratorias
  if (/Nombre del paciente/i.test(t) && /AC\s+AO\s+AM/i.test(t)) {
    if (
      /estadificaci[oó]n neum/i.test(tCollapsed) ||
      /\d{2}-\d{2}-\d{4}/.test(t)
    ) {
      return {
        format: 'brainwave_psg',
        label: 'BrainWave (PSG)',
        type: 'diagnostico',
      };
    }
    if (/Tiempo de sueño total/i.test(t)) {
      return {
        format: 'sleepware_like',
        label: 'PSG generico (formato Sleepware-like)',
        type: 'diagnostico',
      };
    }
  }

  return { format: 'unknown', label: 'Formato no reconocido', type: 'unknown' };
}
