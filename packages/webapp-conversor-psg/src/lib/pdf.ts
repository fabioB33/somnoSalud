/**
 * Wrapper async sobre pdf.js para extraer texto plano de PDFs PSG.
 *
 * Migrado desde legacy-v0/index.html lineas 203-214. Cambios respecto al
 * legacy:
 * - pdf.js cargado via npm en lugar de CDN.
 * - Worker configurado con `?url` import de Vite (bundled).
 */

import * as pdfjs from 'pdfjs-dist';
// Vite resuelve el worker file y nos da una URL.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Extrae el texto completo de un PDF (todas las paginas concatenadas con \n).
 *
 * pdf.js extrae text items con whitespace que el caller (parsers) normaliza
 * con `normalizeWhitespace` de psg-parser.
 */
export async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  let full = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const pageText = tc.items
      .map((it) => ('str' in it ? it.str : ''))
      .join(' ');
    full += pageText + '\n';
  }
  return full;
}
