import { describe, expect, test } from 'vitest';
import { parsePhilipsNightOne } from '../../src/parsers/philips-nightone';
import { NIGHTONE_COMPLETO, NIGHTONE_MINIMO } from '../fixtures/philips-nightone';

describe('parsePhilipsNightOne — caso completo', () => {
  const { data } = parsePhilipsNightOne(NIGHTONE_COMPLETO);

  test('extrae paciente con FDN ISO', () => {
    expect(data.paciente_apellido).toBe('RODRIGUEZ');
    expect(data.paciente_nombre).toBe('ELENA');
    expect(data.paciente_sexo).toBe('F');
    expect(data.paciente_edad_anios).toBe(48);
    expect(data.paciente_fecha_nacimiento).toBe('1977-08-12');
  });

  test('estudio: software = Philips Alice NightOne (poligrafia)', () => {
    expect(data.estudio_software).toBe('Philips Alice NightOne');
    expect(data.estudio_tipo).toBe('Poligrafia respiratoria');
    expect(data.estudio_fecha).toBe('2026-04-15');
  });

  test('TM se mapea a tiempo_sueno_total_min (aproximacion sin EEG)', () => {
    expect(data.tiempo_grabacion_total_min).toBe(480);
    expect(data.tiempo_en_cama_min).toBe(460);
    expect(data.tiempo_sueno_total_min).toBe(420);
  });

  test('eventos respiratorios: IAH global + RDI + tipos', () => {
    expect(data.iah_global_por_hora).toBe(15.3);
    expect(data.iah_eventos_numero).toBe(108);
    expect(data.rdi_indice_trastornos_respiratorios).toBe(16.8);
    expect(data.apneas_obstructivas_indice_por_hora).toBe(6.2);
    expect(data.hipopneas_indice_por_hora).toBe(8.5);
    expect(data.rera_numero).toBe(10);
  });

  test('SpO2 + ODI + T90', () => {
    expect(data.spo2_minima_porc).toBe(82);
    expect(data.spo2_media_total_porc).toBe(94);
    expect(data.desaturaciones_relevantes_total_numero).toBe(95);
    expect(data.odi_indice_desaturacion_calculado_por_hora).toBe(13.5);
    expect(data.t90_tiempo_spo2_menor_90_min).toBe(35.2);
  });

  test('frecuencia cardiaca + ronquidos', () => {
    expect(data.fc_media_sueno_lpm).toBe(68);
    expect(data.ronquidos_episodios_numero).toBe(250);
  });

  test('posicion supino', () => {
    expect(data.pos_supino_duracion_min).toBe(280);
    expect(data.pos_supino_iah).toBe(18.5);
  });
});

describe('parsePhilipsNightOne — minimo', () => {
  const { data } = parsePhilipsNightOne(NIGHTONE_MINIMO);

  test('extrae solo paciente + estudio basicos', () => {
    expect(data.paciente_apellido).toBe('SILVA');
    expect(data.paciente_nombre).toBe('ANA');
    expect(data.estudio_software).toBe('Philips Alice NightOne');
  });

  test('no crashea sin tablas respiratorias', () => {
    expect(data.iah_global_por_hora).toBeUndefined();
    expect(data.spo2_minima_porc).toBeUndefined();
  });
});
