import { describe, expect, test } from 'vitest';
import type { PSGRecord } from '@somnosalud/psg-parser';

import { buildCSV } from '../src/lib/csv';
import { buildFilename } from '../src/lib/filename';
import { EXTRA_INFORME, MAPPING_INFORME, SCHEMA } from '../src/lib/schema';

describe('schema constants', () => {
  test('SCHEMA tiene 224 columnas (legacy ~212 + 8 CPAP + 4 fc/cs Sprints 16-17)', () => {
    expect(SCHEMA.length).toBe(224);
  });

  test('SCHEMA empieza con paciente_apellido y termina con estudio_fecha_fin', () => {
    expect(SCHEMA[0]).toBe('paciente_apellido');
    expect(SCHEMA[SCHEMA.length - 1]).toBe('estudio_fecha_fin');
  });

  test('EXTRA_INFORME tiene 25 entradas del formulario IFN sin PDF', () => {
    expect(EXTRA_INFORME.length).toBe(25);
  });

  test('MAPPING_INFORME mapea claves del SCHEMA a labels IFN', () => {
    expect(MAPPING_INFORME.eficiencia_sueno_porc).toBe('Eficiencia de Sueño');
    expect(MAPPING_INFORME.iah_eventos_numero).toBe('Totales en el Estudio');
  });
});

describe('buildCSV', () => {
  test('genera header + 224 schema + 25 extra = 250 lineas', () => {
    const csv = buildCSV({});
    const lines = csv.trim().split('\n');
    expect(lines.length).toBe(250);
    expect(lines[0]).toBe('parametro,valor,campo_informe_personalizado');
  });

  test('escape comas en valores (rodea con comillas)', () => {
    const record: PSGRecord = {
      paciente_apellido: 'Garcia, Lopez',
      paciente_nombre: 'Juan',
    };
    const csv = buildCSV(record);
    // El valor con coma debe ir entre comillas dobles
    expect(csv).toContain('paciente_apellido,"Garcia, Lopez"');
  });

  test('escape comillas en valores (las duplica)', () => {
    const record: PSGRecord = {
      paciente_apellido: 'Garcia "El Tigre"',
    };
    const csv = buildCSV(record);
    // " interior se duplica + se rodea con ""
    expect(csv).toContain('paciente_apellido,"Garcia ""El Tigre""",');
  });

  test('null/undefined values producen string vacio (3ra columna es campo IFN si existe)', () => {
    const csv = buildCSV({});
    const lines = csv.trim().split('\n');
    // Linea de eficiencia_sueno_porc: valor undefined → vacio, campo IFN → "Eficiencia de Sueño"
    const eficiencia = lines.find((l) => l.startsWith('eficiencia_sueno_porc,'));
    expect(eficiencia).toBe('eficiencia_sueno_porc,,Eficiencia de Sueño');
  });

  test('campo IFN aparece para columnas mapeadas', () => {
    const record: PSGRecord = {
      iah_eventos_numero: 42,
    };
    const csv = buildCSV(record);
    expect(csv).toContain('iah_eventos_numero,42,Totales en el Estudio');
  });

  test('EXTRA_INFORME se exporta con valor vacio', () => {
    const csv = buildCSV({});
    expect(csv).toContain('conclusion_general,,Conclusión General');
  });

  test('CSV termina con newline', () => {
    const csv = buildCSV({});
    expect(csv.endsWith('\n')).toBe(true);
  });

  test('numeros se serializan sin comillas', () => {
    const record: PSGRecord = {
      paciente_edad_anios: 45,
      iah_global_por_hora: 12.5,
    };
    const csv = buildCSV(record);
    expect(csv).toContain('paciente_edad_anios,45,');
    expect(csv).toContain('iah_global_por_hora,12.5,');
  });
});

describe('buildFilename', () => {
  test('formato Apellido_Nombre_YYYYMMDD_HHMM.csv', () => {
    const record: PSGRecord = {
      paciente_apellido: 'OSINAGA',
      paciente_nombre: 'MATIAS',
      estudio_fecha: '2026-03-26',
      hora_apagado_luces: '21:55:07',
    };
    expect(buildFilename(record)).toBe('Osinaga_Matias_20260326_2155.csv');
  });

  test('titleCase aplica a apellido y nombre', () => {
    const record: PSGRecord = {
      paciente_apellido: 'GARCIA LOPEZ',
      paciente_nombre: 'juan carlos',
      estudio_fecha: '2026-01-15',
      hora_apagado_luces: '23:30:00',
    };
    // titleCase concatena sin espacios (preserva pattern legacy)
    expect(buildFilename(record)).toBe('GarciaLopez_JuanCarlos_20260115_2330.csv');
  });

  test('defaults cuando faltan campos', () => {
    expect(buildFilename({})).toBe('Paciente_SinNombre_FechaDesconocida_0000.csv');
  });

  test('sanitize quita caracteres especiales del filename', () => {
    const record: PSGRecord = {
      paciente_apellido: 'Pérez/D\'Alessandro',
      paciente_nombre: 'José',
      estudio_fecha: '2026-04-01',
    };
    const fn = buildFilename(record);
    expect(fn).not.toContain('/');
    expect(fn).not.toContain("'");
    expect(fn).not.toContain('é'); // sanitize quita acentos via regex ^A-Za-z0-9_-
  });
});
