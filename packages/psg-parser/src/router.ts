/**
 * Router de parsers: dado un FormatInfo, invoca el parser correcto.
 *
 * Sprint 17: cobertura completa 7/7 parsers (Sleepware G3, BrainWave, NightOne,
 * ResMed Diag, ResMed Trat, BMC Trat, BMC Poligrafo). UnsupportedFormatError
 * solo aplica si se agregan nuevos formatos en el detector sin parser asociado.
 */

import { parseBMCPoligrafo } from './parsers/bmc-poligrafo';
import { parseBMCTratamiento } from './parsers/bmc-tratamiento';
import { parseBrainWavePSG } from './parsers/brainwave-psg';
import { parsePhilipsNightOne } from './parsers/philips-nightone';
import { parsePhilipsSleepwareG3 } from './parsers/philips-sleepware-g3';
import { parseResMedDiagnostico } from './parsers/resmed-diagnostico';
import { parseResMedTratamiento } from './parsers/resmed-tratamiento';
import type { FormatInfo, ParserResult, PSGRecord } from './types';

export class UnsupportedFormatError extends Error {
  constructor(public readonly format: string) {
    super(`Formato "${format}" no soportado todavia.`);
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
      return parseResMedTratamiento(rawText);
    case 'bmc_tratamiento':
      return parseBMCTratamiento(rawText);
    case 'bmc_poligrafo':
      return parseBMCPoligrafo(rawText);
    case 'unknown':
    default:
      throw new UnknownFormatError();
  }
}
