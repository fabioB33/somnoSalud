/**
 * Router de parsers: dado un FormatInfo, invoca el parser correcto.
 *
 * Sprint 16: cobertura para 4 parsers disponibles (Philips Sleepware G3,
 * BrainWave PSG, Philips NightOne, ResMed Diagnostico). Sprint 17 agrega
 * ResMed Trat + BMC Trat + BMC Poli.
 */

import { parseBrainWavePSG } from './parsers/brainwave-psg';
import { parsePhilipsNightOne } from './parsers/philips-nightone';
import { parsePhilipsSleepwareG3 } from './parsers/philips-sleepware-g3';
import { parseResMedDiagnostico } from './parsers/resmed-diagnostico';
import type { FormatInfo, ParserResult, PSGRecord } from './types';

export class UnsupportedFormatError extends Error {
  constructor(public readonly format: string) {
    super(`Formato "${format}" no soportado todavia (pendiente Sprint 17+).`);
    this.name = 'UnsupportedFormatError';
  }
}

export class UnknownFormatError extends Error {
  constructor() {
    super('Formato no reconocido. No se puede parsear este PDF automaticamente.');
    this.name = 'UnknownFormatError';
  }
}

export function parseByFormat(
  rawText: string,
  formatInfo: FormatInfo,
): ParserResult<PSGRecord> {
  switch (formatInfo.format) {
    case 'philips_sleepware_g3':
    case 'sleepware_like':
      return parsePhilipsSleepwareG3(rawText);
    case 'brainwave_psg':
      return parseBrainWavePSG(rawText);
    case 'philips_nightone':
      return parsePhilipsNightOne(rawText);
    case 'resmed_diagnostico':
      return parseResMedDiagnostico(rawText);
    case 'resmed_tratamiento':
    case 'bmc_tratamiento':
    case 'bmc_poligrafo':
      throw new UnsupportedFormatError(formatInfo.format);
    case 'unknown':
    default:
      throw new UnknownFormatError();
  }
}
