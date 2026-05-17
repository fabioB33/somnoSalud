/**
 * Tests integracion detectFormat + parseByFormat router.
 *
 * Sprint 16: cubre los 4 formatos disponibles + error paths para los 3
 * formatos pendientes (ResMed Trat, BMC Trat, BMC Poli) + unknown.
 */

import { describe, expect, test } from 'vitest';
import { detectFormat } from '../src/detect';
import {
  parseByFormat,
  UnknownFormatError,
  UnsupportedFormatError,
} from '../src/router';
import { BRAINWAVE_COMPLETO } from './fixtures/brainwave-psg';
import { NIGHTONE_COMPLETO } from './fixtures/philips-nightone';
import { PHILIPS_SLEEPWARE_G3_COMPLETO } from './fixtures/philips-sleepware-g3';
import { RESMED_DIAGNOSTICO_COMPLETO } from './fixtures/resmed-diagnostico';

describe('detectFormat — los 4 formatos disponibles', () => {
  test('Philips Sleepware G3 detectado por tag explicito', () => {
    const info = detectFormat(PHILIPS_SLEEPWARE_G3_COMPLETO);
    expect(info.format).toBe('philips_sleepware_g3');
    expect(info.type).toBe('diagnostico');
  });

  test('Philips Alice NightOne detectado por tag + Informe de prueba del sueño', () => {
    const info = detectFormat(NIGHTONE_COMPLETO);
    expect(info.format).toBe('philips_nightone');
    expect(info.type).toBe('diagnostico');
  });

  test('ResMed AirView Diagnostico detectado', () => {
    const info = detectFormat(RESMED_DIAGNOSTICO_COMPLETO);
    expect(info.format).toBe('resmed_diagnostico');
    expect(info.type).toBe('diagnostico');
  });

  test('BrainWave PSG detectado por estructura (sin tag explicito Sleepware)', () => {
    const info = detectFormat(BRAINWAVE_COMPLETO);
    expect(info.format).toBe('brainwave_psg');
    expect(info.type).toBe('diagnostico');
  });

  test('texto vacio retorna unknown', () => {
    const info = detectFormat('');
    expect(info.format).toBe('unknown');
    expect(info.type).toBe('unknown');
  });

  test('PDF no clinico retorna unknown', () => {
    const info = detectFormat('Hola mundo, esto no es un PSG.');
    expect(info.format).toBe('unknown');
  });
});

describe('parseByFormat — router invoca el parser correcto', () => {
  test('ruta a Philips Sleepware G3 y extrae paciente', () => {
    const info = detectFormat(PHILIPS_SLEEPWARE_G3_COMPLETO);
    const { data } = parseByFormat(PHILIPS_SLEEPWARE_G3_COMPLETO, info);
    expect(data.paciente_apellido).toBe('PEREZ');
    expect(data.estudio_software).toBe('Sleepware G3 Philips Respironics');
  });

  test('ruta a BrainWave y extrae datos especificos', () => {
    const info = detectFormat(BRAINWAVE_COMPLETO);
    const { data } = parseByFormat(BRAINWAVE_COMPLETO, info);
    expect(data.estudio_software).toBe('BrainWave');
    expect(data.spo2_menor_88_tc_min).toBe(5.8); // umbral BW-only
  });

  test('ruta a Philips NightOne (poligrafia, subset reducido)', () => {
    const info = detectFormat(NIGHTONE_COMPLETO);
    const { data } = parseByFormat(NIGHTONE_COMPLETO, info);
    expect(data.estudio_software).toBe('Philips Alice NightOne');
    expect(data.fc_media_sueno_lpm).toBe(68);
  });

  test('ruta a ResMed Diagnostico con Cheyne-Stokes', () => {
    const info = detectFormat(RESMED_DIAGNOSTICO_COMPLETO);
    const { data } = parseByFormat(RESMED_DIAGNOSTICO_COMPLETO, info);
    expect(data.cheyne_stokes_porc).toBe(3);
  });
});

describe('parseByFormat — errores', () => {
  test('formato unknown tira UnknownFormatError', () => {
    expect(() =>
      parseByFormat('texto random', {
        format: 'unknown',
        label: 'Formato no reconocido',
        type: 'unknown',
      }),
    ).toThrow(UnknownFormatError);
  });

  test('formato pendiente Sprint 17 tira UnsupportedFormatError con nombre', () => {
    try {
      parseByFormat('', {
        format: 'resmed_tratamiento',
        label: 'ResMed AirView (Tratamiento)',
        type: 'tratamiento',
      });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(UnsupportedFormatError);
      expect((err as UnsupportedFormatError).format).toBe('resmed_tratamiento');
    }
  });

  test('bmc_tratamiento y bmc_poligrafo tambien tiran UnsupportedFormatError', () => {
    expect(() =>
      parseByFormat('', {
        format: 'bmc_tratamiento',
        label: 'BMC',
        type: 'tratamiento',
      }),
    ).toThrow(UnsupportedFormatError);
    expect(() =>
      parseByFormat('', {
        format: 'bmc_poligrafo',
        label: 'BMC',
        type: 'diagnostico',
      }),
    ).toThrow(UnsupportedFormatError);
  });

  test('sleepware_like se rutea al parser de Sleepware G3 (fallback)', () => {
    const info = {
      format: 'sleepware_like' as const,
      label: 'PSG generico',
      type: 'diagnostico' as const,
    };
    // Usamos el fixture de G3 que comparte estructura
    const { data } = parseByFormat(PHILIPS_SLEEPWARE_G3_COMPLETO, info);
    expect(data.paciente_apellido).toBe('PEREZ');
  });
});
