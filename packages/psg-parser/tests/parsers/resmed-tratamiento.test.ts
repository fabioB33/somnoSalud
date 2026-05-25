import { describe, expect, test } from 'vitest';
import { parseResMedTratamiento } from '../../src/parsers/resmed-tratamiento';
import {
  RESMED_TRATAMIENTO_COMPLETO,
  RESMED_TRATAMIENTO_MINIMO,
} from '../fixtures/resmed-tratamiento';

describe('parseResMedTratamiento — caso completo', () => {
  const { data } = parseResMedTratamiento(RESMED_TRATAMIENTO_COMPLETO);

  test('paciente sin coma (Identificación del paciente:)', () => {
    expect(data.paciente_apellido).toBe('GARCIA');
    expect(data.paciente_nombre).toBe('Lucia Maria');
    expect(data.paciente_fecha_nacimiento).toBe('1972-03-05');
    expect(data.paciente_edad_anios).toBe(53);
  });

  test('dispositivo AirSense + tipo titulacion', () => {
    expect(data.estudio_software).toBe('ResMed AirSense 10 AutoSet');
    expect(data.estudio_tipo).toBe('Titulacion CPAP');
  });

  test('rango de fechas DD/MM/YYYY - DD/MM/YYYY se splittea en inicio + fin', () => {
    expect(data.estudio_fecha).toBe('2026-04-20');
    expect(data.estudio_fecha_fin).toBe('2026-04-21');
  });

  test('uso CPAP: promedio + dias usados + % >=4h', () => {
    // 6h45min = 405min
    expect(data.cpap_uso_promedio_min).toBe(405);
    expect(data.cpap_dias_uso).toBe(28);
    expect(data.cpap_dias_total).toBe(30);
    expect(data.cpap_dias_4h_porc).toBe(80);
  });

  test('presion mediana + p95 (cmH2O)', () => {
    expect(data.cpap_presion_mediana_cmh2o).toBe(9.5);
    expect(data.cpap_presion_p95_cmh2o).toBe(12.3);
  });

  test('indices respiratorios IAH/IA/IH + IAC/IAO/RERA con coma decimal', () => {
    expect(data.iah_global_por_hora).toBe(3.2);
    expect(data.apneas_total_indice_por_hora).toBe(1.5);
    expect(data.hipopneas_indice_por_hora).toBe(1.7);
    expect(data.apneas_centrales_indice_por_hora).toBe(0.3);
    expect(data.apneas_obstructivas_indice_por_hora).toBe(1.2);
    expect(data.rera_indice_por_hora).toBe(0.8);
    expect(data.rdi_indice_trastornos_respiratorios).toBe(3.2);
  });

  test('Cheyne-Stokes + SpO2 + T88 + fuga p95', () => {
    expect(data.cheyne_stokes_porc).toBe(3);
    expect(data.spo2_media_total_porc).toBe(94);
    expect(data.t90_tiempo_spo2_menor_90_min).toBe(5);
    expect(data.cpap_fuga_p95_lpm).toBe(18.5);
  });
});

describe('parseResMedTratamiento — minimo', () => {
  const { data } = parseResMedTratamiento(RESMED_TRATAMIENTO_MINIMO);

  test('paciente sin coma + tipo titulacion', () => {
    expect(data.paciente_apellido).toBe('PEREZ');
    expect(data.paciente_nombre).toBe('Juan');
    expect(data.estudio_software).toBe('ResMed AirSense 11');
    expect(data.estudio_tipo).toBe('Titulacion CPAP');
  });

  test('no crashea sin tablas CPAP', () => {
    expect(data.iah_global_por_hora).toBeUndefined();
    expect(data.cpap_uso_promedio_min).toBeUndefined();
  });
});
