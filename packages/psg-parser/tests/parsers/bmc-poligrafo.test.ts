import { describe, expect, test } from 'vitest';
import { parseBMCPoligrafo } from '../../src/parsers/bmc-poligrafo';
import {
  BMC_POLIGRAFO_SIN_PACIENTE,
  BMC_POLIGRAFO_TIPICO,
} from '../fixtures/bmc-poligrafo';

describe('parseBMCPoligrafo — caso tipico', () => {
  const { data, missing } = parseBMCPoligrafo(BMC_POLIGRAFO_TIPICO);

  test('extrae paciente (lo unico disponible en texto)', () => {
    expect(data.paciente_apellido).toBe('LOPEZ');
    expect(data.paciente_nombre).toBe('EMILIA');
    expect(data.estudio_software).toBe('BMC');
    expect(data.estudio_tipo).toBe('Poligrafia respiratoria');
  });

  test('agrega warning explicito en missing[] (datos en imagenes)', () => {
    expect(missing).toHaveLength(1);
    expect(missing[0]).toContain('ADVERTENCIA');
    expect(missing[0]).toContain('imagenes');
  });
});

describe('parseBMCPoligrafo — sin paciente', () => {
  const { data, missing } = parseBMCPoligrafo(BMC_POLIGRAFO_SIN_PACIENTE);

  test('estudio fields se setean defaults aun sin paciente', () => {
    expect(data.estudio_software).toBe('BMC');
    expect(data.estudio_tipo).toBe('Poligrafia respiratoria');
    expect(data.paciente_apellido).toBeUndefined();
    expect(data.paciente_nombre).toBeUndefined();
  });

  test('warning sigue presente', () => {
    expect(missing[0]).toContain('ADVERTENCIA');
  });
});
