import { describe, expect, test } from 'vitest';
import JSZip from 'jszip';
import type { PSGRecord } from '@somnosalud/psg-parser';

import { buildZip } from '../src/lib/zip';

const sampleRecord = (overrides: Partial<PSGRecord> = {}): PSGRecord => ({
  paciente_apellido: 'GARCIA',
  paciente_nombre: 'Juan',
  estudio_fecha: '2026-05-26',
  hora_apagado_luces: '22:30:00',
  iah_global_por_hora: 12.5,
  ...overrides,
});

describe('buildZip', () => {
  test('genera ZIP con N archivos CSV usando filename canonico', async () => {
    const files = [
      { record: sampleRecord({ paciente_apellido: 'GARCIA' }) },
      { record: sampleRecord({ paciente_apellido: 'LOPEZ' }) },
    ];
    const { blob, filename } = await buildZip(files);

    expect(blob.size).toBeGreaterThan(0);
    expect(filename).toMatch(/^CSV_PSG_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.zip$/);

    const ab = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(ab);
    const names = Object.keys(zip.files);
    expect(names.length).toBe(2);
    expect(names.some((n) => n.startsWith('Garcia_Juan_'))).toBe(true);
    expect(names.some((n) => n.startsWith('Lopez_Juan_'))).toBe(true);
  });

  test('cada CSV adentro del ZIP arranca con BOM (UTF-8 para Excel)', async () => {
    const { blob } = await buildZip([{ record: sampleRecord() }]);
    const ab = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(ab);
    const firstName = Object.keys(zip.files)[0];
    const content = await zip.files[firstName].async('string');
    // BOM =
    expect(content.charCodeAt(0)).toBe(0xfeff);
    // CSV header inmediatamente después del BOM
    expect(content.slice(1).startsWith('parametro,valor,campo_informe_personalizado')).toBe(true);
  });

  test('ZIP vacío con 0 archivos sigue siendo valido', async () => {
    const { blob } = await buildZip([]);
    expect(blob.size).toBeGreaterThan(0); // ZIP empty header
    const ab = await blob.arrayBuffer();
    const zip = await JSZip.loadAsync(ab);
    expect(Object.keys(zip.files).length).toBe(0);
  });
});
