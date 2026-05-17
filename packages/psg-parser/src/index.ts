/**
 * @somnosalud/psg-parser — barrel exports.
 *
 * Sprint 15: Philips Sleepware G3.
 * Sprint 16: + BrainWave PSG, Philips Alice NightOne, ResMed AirView Diag,
 *            + detectFormat / parseByFormat router.
 * Sprints 17-19: ResMed Trat + BMC Trat + BMC Poli + Engine Hipoxico + frontend.
 */

export type {
  EquipmentFormat,
  FormatInfo,
  ParserResult,
  PSGRecord,
  StudyType,
} from './types';

export {
  normalizeWhitespace,
  num,
  parseHour,
  parseSpanishDate,
  titleCase,
  type ParsedHour,
  type ParsedSpanishDate,
} from './utils';

export { parseBrainWavePSG } from './parsers/brainwave-psg';
export { parsePhilipsNightOne } from './parsers/philips-nightone';
export { parsePhilipsSleepwareG3 } from './parsers/philips-sleepware-g3';
export { parseResMedDiagnostico } from './parsers/resmed-diagnostico';

export { detectFormat } from './detect';
export { parseByFormat, UnknownFormatError, UnsupportedFormatError } from './router';
