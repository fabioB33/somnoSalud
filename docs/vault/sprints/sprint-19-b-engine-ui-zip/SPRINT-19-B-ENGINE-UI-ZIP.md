---
title: "Sprint 19.B — Engine Hipóxico UI + ZIP multi-archivo + Methodology tab"
date: 2026-05-26
closed_at: 2026-05-26
sprint_number: 19.B
status: closed-verified
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../sprint-18-engine-hipoxico/SPRINT-18-ENGINE-HIPOXICO]]"
  - "[[../sprint-19-frontend-vite-conversor-psg/SPRINT-19-FRONTEND-VITE-CONVERSOR-PSG]]"
tags: [sprint, conversor-psg, vite, engine-hipoxico, jszip, fase-2, ui]
---

# Sprint 19.B — Engine Hipóxico UI + ZIP + Methodology

> [!info] Objetivo
> Completar la migración del Conversor PSG con las features iterativas pendientes post Sprint 19 MVP: (1) Download ZIP multi-archivo con JSZip, (2) `EnginePanel` React con tabs Resultados + Methodology que renderiza el score Hipóxico Azarbarzin 2019 (Sprint 18), (3) integración en `App.tsx` + `FileRow` botones. Falta solo Sprint 19.C (archivar legacy) para cierre formal de DEBT-conversor-psg-migration-roadmap.

## Hipótesis

- **H1** — `buildZip(files)` genera Blob ZIP con N CSVs usando `buildFilename` canonico + BOM UTF-8 prefix. `downloadZip` triggerea descarga + cleanup URL.
- **H2** — `<EnginePanel>` modal con 2 tabs: Resultados (score grande coloreado + 12 métricas + 6 barras breakdown + perfil A/B/C + flags clínicos + tabla detalle) y Methodology (explicación + 6 secciones del scoring + DOI Azarbarzin 2019).
- **H3** — `<FileRow>` agrega botón "Score Hipóxico" cuando `file.hypoxic` existe. `App.tsx` maneja `engineFileId` state + renderiza panel condicional.
- **H4** — Botón "Descargar todos (ZIP)" deshabilitado si `successCount === 0`. Genera con timestamp formato `CSV_PSG_YYYY-MM-DDTHH-MM-SS.zip`.
- **H5** — Tests vitest del ZIP builder passing (ZIP válido + BOM en cada CSV + ZIP vacío sigue válido).
- **H6** — typecheck cross-package + Vite build verde + cero regresión Sprint 19 (CSV builder sigue 16/16).

## FASE 1 — Implementación

### Bloque A — ZIP builder (`src/lib/zip.ts`)
- `buildZip(files: ZipFile[])` → `{ blob, filename }`. Usa JSZip `generateAsync({type:'blob'})`. BOM UTF-8 `'﻿'` prepended a cada CSV para Excel.
- `downloadZip(blob, filename)` con `<a>` temporal + revokeObjectURL después de 1s.

### Bloque B — EnginePanel (`src/components/EnginePanel.tsx`, ~280 LOC)
- Server-side state `tab` con `useState<'results' | 'methodology'>`.
- `ResultsTab`: 6 cards (Patient info + NA warning + Score display + Metrics grid 12 cards + Breakdown 6 bars + Profile badge + Flags list + Detail table 11 filas).
- `MethodologyTab`: 7 secciones explicando cada paso del scoring + cita Azarbarzin 2019 con link DOI.
- Colors map: score por catClass (leve verde / moderada amarilla / alta naranja / crítica roja). Perfil A/B/C también.

### Bloque C — Integration App + FileRow + FileList
- `FileRow`: botón "Score Hipóxico" cuando `file.hypoxic`. Recibe `onShowEngine(id)` callback.
- `FileList`: passthrough de `onShowEngine` a cada `FileRow`.
- `App`: state `engineFileId` + `zipBusy` + `handleDownloadAll` + render condicional `<EnginePanel>` cuando hay file seleccionado.

### Bloque D — Tests + CSS
- `tests/zip.test.ts`: 3 tests (ZIP con N archivos + BOM verify + ZIP vacío).
- `styles.css`: +~280 LOC con engine-panel, engine-tabs-bar, score-display, metrics-grid, breakdown-item/bar/fill/value, profile-badge, flag-list, detail-table, method-section.

## FASE 2 — Verificación empírica

- **E1 — typecheck:** ✅ verde (psg-parser dist/ presente, TS estricto sin errores).
- **E2 — vitest:** ✅ **19/19 tests passing** en 770 ms (16 CSV + 3 ZIP nuevos). Cero regresión Sprint 19.
- **E3 — Vite build:** ✅ en 4.11s. Bundle:
  - `dist/index.html` 0.69 kB
  - `dist/assets/index-*.css` 6.58 kB (gzip 1.94 kB)
  - `dist/assets/index-*.js` 668 kB (gzip 200 kB) — incluye React + JSZip + EnginePanel.
  - `dist/assets/pdf.worker.min-*.mjs` 1.4 MB (inherente pdf.js, code-splitted automático).

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Resumen |
|---|---|---|
| `src/lib/zip.ts` | NEW | `buildZip()` con BOM UTF-8 + `downloadZip()` con cleanup URL. |
| `src/components/EnginePanel.tsx` | NEW (~280 LOC) | Tabs Resultados + Methodology. Score grande coloreado por catClass + 12 metric cards + 6 breakdown bars + perfil A/B/C badge + flag-list crit/warn + tabla detalle 11 filas. |
| `src/components/FileRow.tsx` | EDIT | Botón "Score Hipóxico" condicional + BOM en CSV individual (consistencia con ZIP). |
| `src/components/FileList.tsx` | EDIT | Pasa `onShowEngine` a cada `FileRow`. |
| `src/App.tsx` | EDIT | State `engineFileId` + `zipBusy` + `handleDownloadAll` + render condicional EnginePanel. |
| `src/styles.css` | EDIT (+280 LOC) | Estilos completos del panel: tabs + score + metrics + breakdown + flags + method-section. |
| `tests/zip.test.ts` | NEW | 3 tests del ZIP builder (BOM + filenames + ZIP vacío). |

### Hipótesis verificadas

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | `buildZip` con BOM | ✅ tests verifican `charCodeAt(0) === 0xFEFF` |
| H2 | EnginePanel con 2 tabs | ✅ rendering condicional via `useState<EngineTab>` |
| H3 | Botón "Score Hipóxico" en FileRow | ✅ condicional sobre `file.hypoxic` |
| H4 | Botón ZIP deshabilitado sin successFiles | ✅ `disabled={successCount === 0 || zipBusy}` |
| H5 | Tests ZIP passing | ✅ 3/3 |
| H6 | Build + tests verde | ✅ 19/19 + Vite 4.11s |

### DEBT cerrado

- **Sprint 19.B done.** Solo falta **Sprint 19.C** (archivar legacy-v0/ cuando Pablo confirme paridad con PDFs reales) para cierre formal de **DEBT-conversor-psg-migration-roadmap**.

### Pendiente smoke real con Pablo

Cuando Pablo procese 1 PDF real de cada equipo en el nuevo conversor:
- ¿El CSV output coincide con el del legacy? (comparación textual line-by-line vs CSV del legacy con mismo PDF).
- ¿El Score Hipóxico coincide con el del legacy? (mismo computeHypoxicScore aplicado al mismo PSGRecord debería dar mismo número exacto).
- ¿La UI es comprensible vs el legacy? (decisión UX final).

Si todo OK → Sprint 19.C ejecuta el archivado del legacy-v0 + cierra el DEBT formalmente.

## Bloque J — Reporte

**Sprint 19.B cerrado 2026-05-26.**

- **Scope alcanzado:** features iterativas completadas del Conversor PSG. Engine Hipóxico ahora con UI completa + ZIP multi-archivo + Methodology con cita Azarbarzin 2019.
- **Líneas nuevas:** ~620 totales (zip.ts 50 + EnginePanel.tsx 280 + styles.css +280 + zip.test.ts 60 + integrations).
- **Tests:** 19/19 vitest conversor-psg (16 CSV + 3 ZIP). **Total monorepo: 178 vitest tests** (clinical-engine 55 + psg-parser 104 + conversor-psg 19).
- **Vite build:** 4.11s, bundle main 668 kB (gzip 200 kB), pdf.js worker 1.4 MB code-splitted.
- **Dependencias added:** ninguna (JSZip ya estaba en Sprint 19).
- **DEBT cerrado:** ninguno aún (necesita 19.C para cerrar formalmente conversor-psg-migration-roadmap).
- **Progreso Conversor PSG: 95% (8.5/9 items)** — solo Sprint 19.C (archivar legacy) pendiente, ~30min de trabajo + confirmación de Pablo.
