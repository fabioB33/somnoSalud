import { describe, expect, test } from 'vitest';
import { parseBrainWavePSG } from '../../src/parsers/brainwave-psg';
import {
  BRAINWAVE_COMPLETO,
  BRAINWAVE_CON_COMA,
  BRAINWAVE_MINIMO,
} from '../fixtures/brainwave-psg';

describe('parseBrainWavePSG — caso completo', () => {
  const { data } = parseBrainWavePSG(BRAINWAVE_COMPLETO);

  test('paciente sin coma se tokeniza (ultimo token = apellido)', () => {
    expect(data.paciente_apellido).toBe('GONZALEZ');
    expect(data.paciente_nombre).toBe('LAURA GABRIELA');
  });

  test('sexo Femenino full word -> F', () => {
    expect(data.paciente_sexo).toBe('F');
  });

  test('fecha DD-MM-YYYY se convierte a ISO 8601', () => {
    expect(data.estudio_fecha).toBe('2026-03-23');
  });

  test('hora con AM/PM se convierte a 24h', () => {
    // 10:30 PM -> 22:30:00
    expect(data.hora_apagado_luces).toBe('22:30:00');
    // 06:45 AM -> 06:45:00
    expect(data.hora_encendido_luces).toBe('06:45:00');
  });

  test('arquitectura sueno (TST + eficiencia + latencias)', () => {
    expect(data.tiempo_sueno_total_min).toBe(380);
    expect(data.eficiencia_sueno_porc).toBe(76.7);
    expect(data.latencia_sueno_min).toBe(15);
  });

  test('estadificacion N1/N2/N3/REM', () => {
    expect(data.n1_duracion_min).toBe(30);
    expect(data.n2_duracion_min).toBe(200);
    expect(data.n3_duracion_min).toBe(70);
    expect(data.rem_duracion_min).toBe(80);
  });

  test('posicion No-Supino (BW variante de ARRIBA)', () => {
    expect(data.pos_supino_duracion_min).toBe(280);
    expect(data.pos_supino_iah).toBe(5.5);
    expect(data.pos_no_supino_duracion_min).toBe(100);
    expect(data.pos_no_supino_iah_por_hora).toBe(16.8);
  });

  test('SpO2 umbrales BW: <88% y <92% adicionales vs Sleepware', () => {
    expect(data.spo2_minima_porc).toBe(87);
    expect(data.spo2_menor_88_tc_min).toBe(5.8);
    expect(data.spo2_menor_92_tc_min).toBe(24);
    expect(data.spo2_menor_90_tc_min).toBe(4);
    expect(data.t90_tiempo_spo2_menor_90_min).toBe(4);
  });

  test('software es BrainWave (no Sleepware)', () => {
    expect(data.estudio_software).toBe('BrainWave');
    expect(data.estudio_tipo).toBe('Polisomnografia nocturna');
  });
});

describe('parseBrainWavePSG — paciente con coma', () => {
  const { data } = parseBrainWavePSG(BRAINWAVE_CON_COMA);

  test('paciente "APELLIDO, NOMBRE" se splittea correctamente', () => {
    expect(data.paciente_apellido).toBe('MARTINEZ');
    expect(data.paciente_nombre).toBe('ROBERTO');
  });

  test('fecha DD/MM/YYYY (variante con slash) tambien funciona', () => {
    expect(data.estudio_fecha).toBe('2026-04-05');
  });
});

describe('parseBrainWavePSG — minimo (sin tablas)', () => {
  const { data } = parseBrainWavePSG(BRAINWAVE_MINIMO);

  test('paciente "NOMBRE APELLIDO" sin coma — ultimo token = apellido', () => {
    expect(data.paciente_apellido).toBe('JUAN');
    expect(data.paciente_nombre).toBe('PEREZ');
  });

  test('sexo "Masculino" full word -> M', () => {
    expect(data.paciente_sexo).toBe('M');
  });

  test('no crashea sin tablas respiratorias / spo2', () => {
    expect(data.estudio_software).toBe('BrainWave');
    // Sin tablas, los campos quedan undefined o 0 (no crash)
    expect(data.iah_global_por_hora).toBeUndefined();
  });
});
