import { describe, expect, test } from 'vitest';
import { parseResMedDiagnostico } from '../../src/parsers/resmed-diagnostico';
import {
  RESMED_DIAGNOSTICO_COMPLETO,
  RESMED_DIAGNOSTICO_MINIMO,
} from '../fixtures/resmed-diagnostico';

describe('parseResMedDiagnostico — caso completo', () => {
  const { data } = parseResMedDiagnostico(RESMED_DIAGNOSTICO_COMPLETO);

  test('paciente con coma + edad', () => {
    expect(data.paciente_apellido).toBe('FERNANDEZ');
    expect(data.paciente_nombre).toBe('MIGUEL');
    expect(data.paciente_fecha_nacimiento).toBe('1968-09-22');
    expect(data.paciente_edad_anios).toBe(57);
  });

  test('dispositivo detectado + tipo II/III', () => {
    expect(data.estudio_software).toBe('ResMed ApneaLink Air (Tipo III)');
    expect(data.estudio_tipo).toBe('Poligrafia respiratoria');
    expect(data.estudio_fecha).toBe('2026-04-10');
  });

  test('duracion h:mm convertida a minutos totales', () => {
    // 8:30 = 510 min
    expect(data.tiempo_sueno_total_min).toBe(510);
  });

  test('indices respiratorios IAH/IA/IH desglosados', () => {
    expect(data.iah_global_por_hora).toBe(22.5);
    expect(data.apneas_total_indice_por_hora).toBe(8);
    expect(data.hipopneas_indice_por_hora).toBe(14.5);
    expect(data.rdi_indice_trastornos_respiratorios).toBe(22.5);
  });

  test('eventos totales (apneas + hipopneas = iah_eventos_numero)', () => {
    expect(data.apneas_total_numero).toBe(64);
    expect(data.hipopneas_numero).toBe(116);
    expect(data.iah_eventos_numero).toBe(180);
  });

  test('AI por tipo (obstructiva + central + mixta)', () => {
    expect(data.apneas_obstructivas_indice_por_hora).toBe(6.5);
    expect(data.apneas_centrales_indice_por_hora).toBe(1);
    expect(data.apneas_mixtas_indice_por_hora).toBe(0.5);
  });

  test('Cheyne-Stokes porcentaje', () => {
    expect(data.cheyne_stokes_porc).toBe(3);
  });

  test('SpO2 basal/promedio/minimo + IDO', () => {
    expect(data.spo2_media_despertar_porc).toBe(96);
    expect(data.spo2_media_total_porc).toBe(93);
    expect(data.spo2_minima_porc).toBe(78);
    expect(data.odi_indice_desaturacion_calculado_por_hora).toBe(18.5);
    // 0:45 = 45 min
    expect(data.t90_tiempo_spo2_menor_90_min).toBe(45);
  });

  test('posicion supino con duracion h:mm', () => {
    // 5:15 = 315 min
    expect(data.pos_supino_duracion_min).toBe(315);
    expect(data.pos_supino_iah).toBe(28.5);
    expect(data.pos_no_supino_iah_por_hora).toBe(12);
  });

  test('pulso min/promedio/max', () => {
    expect(data.fc_minima_lpm).toBe(52);
    expect(data.fc_media_sueno_lpm).toBe(68);
    expect(data.fc_maxima_lpm).toBe(95);
  });

  test('criterio AASM + ronquidos', () => {
    expect(data.estudio_criterio_hipopnea).toContain('AASM');
    expect(data.ronquidos_episodios_numero).toBe(145);
  });
});

describe('parseResMedDiagnostico — minimo', () => {
  const { data } = parseResMedDiagnostico(RESMED_DIAGNOSTICO_MINIMO);

  test('extrae paciente + dispositivo basico', () => {
    expect(data.paciente_apellido).toBe('LOPEZ');
    expect(data.paciente_nombre).toBe('CARLOS');
    expect(data.estudio_software).toBe('ResMed ApneaLink (Tipo II)');
  });

  test('no crashea sin tablas de indices', () => {
    expect(data.iah_global_por_hora).toBeUndefined();
    expect(data.spo2_minima_porc).toBeUndefined();
  });
});
