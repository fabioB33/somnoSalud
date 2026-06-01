# `@somnosalud/webapp-conversor-psg`

Utility client-side para parsear PDFs polisomnográficos de 7 equipos distintos y generar CSV en formato long compatible con el informe IFN.

> **Status (2026-05-26):** Vite + React + TypeScript modular consumiendo `@somnosalud/psg-parser`. Migración legacy → modular cerrada en Sprint 19.C. Legacy v0 archivado en `legacy-v0/_archived/` por referencia histórica.

## Equipos soportados (7/7 parsers)

- Philips Sleepware G3 (PSG completa) — ~212 campos
- Philips Alice NightOne (Poligrafía)
- BrainWave (PSG)
- ResMed AirView (Diagnóstico)
- ResMed AirView (Tratamiento/CPAP)
- BMC (Tratamiento/CPAP)
- BMC (Poligrafía diagnóstica) — datos limitados (mayormente imágenes)

## Quick start

```bash
# Desde la raíz del monorepo
pnpm --filter @somnosalud/webapp-conversor-psg dev
# Abrir http://localhost:5173/
```

Build de producción:

```bash
pnpm --filter @somnosalud/webapp-conversor-psg build
pnpm --filter @somnosalud/webapp-conversor-psg preview
```

## Features

- **Dropzone** drag & drop + click → file input, sólo PDFs.
- **Auto-detect** del equipo a partir del texto del PDF (`detectFormat` de psg-parser).
- **Parser modular** invoca el parser correcto vía `parseByFormat`.
- **CSV individual** con BOM UTF-8 (formato Excel), filename canónico `Apellido_Nombre_YYYYMMDD_HHMM.csv`.
- **ZIP multi-archivo** (`CSV_PSG_<timestamp>.zip`) con todos los CSV procesados.
- **Engine Hipóxico** Azarbarzin 2019 con UI completa: tab Resultados (score 0-100 + 12 metric cards + 6 breakdown bars + perfil A/B/C + flags clínicos + tabla detalle) + tab Methodology (7 secciones explicando el scoring + DOI link).
- **Procesamiento 100% local** — cero envío de datos clínicos al servidor.

## Engine Hipóxico

Score 0-100 con 6 componentes clínicos (computado en `@somnosalud/psg-parser` →
`computeHypoxicScore`):

1. Carga acumulativa (T90, T85, T80, HB) — 0-40
2. Ciclicidad (ODI) — 0-16
3. Profundidad (Nadir, % nadir<80) — 0-20
4. Modulador basal (SpO₂ basal vigilia) — 0-8
5. Modulador temporal (IAH REM/NREM ratio) — 0-8
6. Modulador clínico (input manual) — 0-8

Score máximo computable desde PDF: **~76/100** (HB + clustering + % nadir<80 requieren señal cruda SpO₂, no extraíble del informe).

Categorías:
- 1-15 → Carga hipóxica leve
- 16-39 → Moderada
- 40-69 → Alta
- 70-100 → Crítica

## Stack

- Vite 5 + React 18
- TypeScript estricto (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- pdf.js (`pdfjs-dist@4`) para extracción de texto
- JSZip para ZIP multi-archivo
- vitest para tests

## Tests

```bash
pnpm --filter @somnosalud/webapp-conversor-psg test
# 19/19 passing en ~770 ms (16 CSV + 3 ZIP)
```

Cobertura: CSV headers + 224 cols del SCHEMA + escape comas/quotes/newlines +
null handling + buildFilename + ZIP con BOM + ZIP vacío.

## Legacy v0 archivado

El HTML monolítico original (`index.html`, 1.887 LOC) vive en
`legacy-v0/_archived/` por referencia histórica. Ver el README de ese
directorio para detalles + cómo abrirlo si necesitás smoke comparativo.

## Referencias científicas (DOI centralizado)

Las refs DOI/PMID viven en `packages/clinical-engine/src/references.ts`
(SSOT del monorepo). Principal:

- **REF_HYPOXIC_AZARBARZIN_2019** — Azarbarzin A, et al. (2019) Eur Heart J 40(14):1149-1157. DOI: 10.1093/eurheartj/ehy624. PMID: 30376054.

## Licencia

Proprietary — SomnoSalud Team.
