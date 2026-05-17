/**
 * @somnosalud/psg-parser — barrel exports.
 *
 * Sprint 15: solo Philips Sleepware G3 disponible. Sprints 16-19 agregan
 * los 6 parsers restantes + Engine Hipoxico.
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

export { parsePhilipsSleepwareG3 } from './parsers/philips-sleepware-g3';
