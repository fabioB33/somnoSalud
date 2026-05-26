/**
 * @somnosalud/psg-parser — barrel exports.
 *
 * Sprint 15: Philips Sleepware G3.
 * Sprint 16: + BrainWave PSG, Philips Alice NightOne, ResMed AirView Diag,
 *            + detectFormat / parseByFormat router.
 * Sprint 17: + ResMed Trat + BMC Trat + BMC Poligrafo. **7/7 parsers completos.**
 * Sprint 18: + Engine Hipoxico (Azarbarzin 2019).
 * Sprint 19: frontend Vite+React reemplaza legacy.
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

export { parseBMCPoligrafo } from './parsers/bmc-poligrafo';
export { parseBMCTratamiento } from './parsers/bmc-tratamiento';
export { parseBrainWavePSG } from './parsers/brainwave-psg';
export { parsePhilipsNightOne } from './parsers/philips-nightone';
export { parsePhilipsSleepwareG3 } from './parsers/philips-sleepware-g3';
export { parseResMedDiagnostico } from './parsers/resmed-diagnostico';
export { parseResMedTratamiento } from './parsers/resmed-tratamiento';

export { detectFormat } from './detect';
export { parseByFormat, UnknownFormatError, UnsupportedFormatError } from './router';

export { computeHypoxicScore } from './engine/hypoxic';
export type {
  HypoxicCategoryClass,
  HypoxicComponentBreakdown,
  HypoxicFlag,
  HypoxicScore,
} from './engine/types';
