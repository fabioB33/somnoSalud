import { describe, expect, test } from 'vitest';
import { parseBMCTratamiento } from '../../src/parsers/bmc-tratamiento';
import {
  BMC_TRATAMIENTO_COMPLETO,
  BMC_TRATAMIENTO_MINIMO,
} from '../fixtures/bmc-tratamiento';

describe('parseBMCTratamiento — caso completo', () => {
  const { data } = parseBMCTratamiento(BMC_TRATAMIENTO_COMPLETO);

  test('paciente con coma + Genero Masculino', () => {
    expect(data.paciente_apellido).toBe('MORALES');
    expect(data.paciente_nombre).toBe('CARLOS ALBERTO');
    expect(data.paciente_sexo).toBe('M');
    expect(data.paciente_edad_anios).toBe(65);
  });

  test('Fecha de nacimiento YYYY/MM/DD (formato invertido BMC) -> ISO 8601', () => {
    expect(data.paciente_fecha_nacimiento).toBe('1960-08-15');
  });

  test('dispositivo BMC + tipo titulacion', () => {
    expect(data.estudio_software).toBe('BMC G2S 3DT');
    expect(data.estudio_tipo).toBe('Titulacion CPAP');
  });

  test('fecha inicio (YYYY-MM-DD directo)', () => {
    expect(data.estudio_fecha).toBe('2026-05-01');
  });

  test('uso CPAP: promedio HH:MM + % dias >=4h', () => {
    // 7h30min = 450min
    expect(data.cpap_uso_promedio_min).toBe(450);
    expect(data.cpap_dias_4h_porc).toBe(95);
  });

  test('presion p95 + promedio (cmH2O)', () => {
    expect(data.cpap_presion_p95_cmh2o).toBe(11.5);
    expect(data.cpap_presion_mediana_cmh2o).toBe(9.8);
  });

  test('indices respiratorios AHI/AI/HI/OAI/CAI', () => {
    expect(data.iah_global_por_hora).toBe(4.5);
    expect(data.apneas_total_indice_por_hora).toBe(2);
    expect(data.hipopneas_indice_por_hora).toBe(2.5);
    expect(data.apneas_obstructivas_indice_por_hora).toBe(1.8);
    expect(data.apneas_centrales_indice_por_hora).toBe(0.2);
    expect(data.rdi_indice_trastornos_respiratorios).toBe(4.5);
  });

  test('fuga p95 (LPM)', () => {
    expect(data.cpap_fuga_p95_lpm).toBe(22.3);
  });
});

describe('parseBMCTratamiento — minimo', () => {
  const { data } = parseBMCTratamiento(BMC_TRATAMIENTO_MINIMO);

  test('paciente + sexo F + edad', () => {
    expect(data.paciente_apellido).toBe('DIAZ');
    expect(data.paciente_nombre).toBe('ROSA');
    expect(data.paciente_sexo).toBe('F');
    expect(data.paciente_edad_anios).toBe(58);
  });

  test('no crashea sin tablas CPAP', () => {
    expect(data.iah_global_por_hora).toBeUndefined();
  });
});
