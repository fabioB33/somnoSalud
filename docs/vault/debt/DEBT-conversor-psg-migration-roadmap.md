---
title: "Deuda Técnica — migración Conversor PSG legacy → modular (Sprints 15-19.C ✅ CERRADO 2026-05-26)"
date: 2026-05-14
closed_at: 2026-05-26
closed_by: sprint-19-c-archivar-legacy
tags: [deuda-tecnica, psg-parser, conversor-psg, migration, fase-2, closed-verified]
status: closed-verified
priority: medium
scope: sprint-15-16-17-18-19-19b-19c
detected_during: sprint-15-psg-parser-bootstrap
related:
  - "[[../sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
  - "[[../sprints/sprint-19-c-archivar-legacy/SPRINT-19-C-ARCHIVAR-LEGACY]]"
---

> [!success] Cerrado 2026-05-26 (Sprint 19.C)
> Migración Conversor PSG legacy → modular **100% completada**. 7/7 parsers + auto-detect + router + Engine Hipóxico Azarbarzin 2019 + Frontend Vite+React + Engine UI + ZIP + Methodology + archivado legacy con READMEs. **178 vitest tests passing** (clinical-engine 55 + psg-parser 104 + conversor-psg 19). Legacy preservado en `packages/webapp-conversor-psg/legacy-v0/_archived/index.html` por referencia histórica + smoke comparativo futuro con PDFs reales de Pablo. Tiempo total invertido: ~20.5 h (Sprint 15: 3h, 16: 4h, 17: 3h, 18: 3h, 19: 4h, 19.B: 3h, 19.C: 0.5h).

# DEBT-conversor-psg-migration-roadmap

> [!info] Origen
> Sprint 15 (2026-05-14) inició la migración del Conversor PSG legacy (1.887 LOC HTML monolítico en `packages/webapp-conversor-psg/legacy-v0/index.html`) al package modular `packages/psg-parser/` con TypeScript estricto. Sprint 15 entregó: bootstrap + parser piloto Philips Sleepware G3 + 15/15 tests passing. **Quedan 6 parsers + Engine Hipóxico + Frontend nuevo** distribuidos en Sprints 16-19.

## Contexto

El legacy `legacy-v0/index.html` sigue 100% funcional standalone (`python3 -m http.server 8765`). NO está roto. Esta DEBT trackea la migración progresiva — el legacy se archiva solo cuando el nuevo alcanza paridad funcional verificable (Sprint 19).

**Decisión estratégica (acordada con Fabio 2026-05-14):** fraccionar la migración Fase 2 (estimada 25-35 h por CLAUDE.md) en sprints chicos de 3-8 h cada uno. Permite parar entre sprints sin dejar trabajo huérfano.

## Roadmap

### Sprint 16 — ✅ closed-verified (2026-05-14)

- **BrainWave (PSG):** ✅ migrado (`src/parsers/brainwave-psg.ts`, 330 LOC, 14 tests).
- **Philips Alice NightOne:** ✅ migrado (115 LOC, 9 tests).
- **ResMed AirView Diagnóstico:** ✅ migrado (135 LOC, 13 tests).
- **Auto-detect + router:** ✅ `src/detect.ts` + `src/router.ts` con `UnknownFormatError` y `UnsupportedFormatError`. 14 tests integración.
- **Total:** 50 tests nuevos (Sprint 15: 15 → Sprint 16: 65). 3 bugs latentes legacy detectados y resueltos.
- Detalle: [[../sprints/sprint-16-3-parsers-diagnosticos/SPRINT-16-3-PARSERS-DIAGNOSTICOS]].

### Sprint 17 — ✅ closed-verified (2026-05-24)

- **ResMed AirView Tratamiento:** ✅ migrado (~130 LOC, 9 tests). Uso CPAP + presión + fugas + Cheyne-Stokes.
- **BMC Tratamiento:** ✅ migrado (~100 LOC, 10 tests). AHI/AI/HI/OAI/CAI desglosado + fecha YYYY/MM/DD invertida.
- **BMC Poligrafía:** ✅ migrado (~45 LOC, 4 tests). Caso especial: data en imágenes, solo extrae paciente + warning explícito.
- **Router activado:** los 3 formatos ya no tiran `UnsupportedFormatError`.
- **Types extendido:** +8 campos CPAP (`cpap_*` + `estudio_fecha_fin`).
- **Total:** 24 tests nuevos (Sprint 16: 65 → Sprint 17: 89). 3 bugs greedy regex detectados y resueltos.
- **Progreso migración:** **7/7 parsers (100%)** ✅. Quedan Sprint 18 (engine) + Sprint 19 (frontend).
- Detalle: [[../sprints/sprint-17-parsers-tratamiento/SPRINT-17-PARSERS-TRATAMIENTO]].

### Sprint 18 — ✅ closed-verified (2026-05-26)

- **Engine Hipóxico:** `computeHypoxicScore(record: PSGRecord)` migrado a `psg-parser/src/engine/hypoxic.ts` (~230 LOC TS estricto).
- 6 componentes (carga / ciclicidad / profundidad / mod basal / mod temporal / mod clínico). Max teórico 100, real ~76 sin señal cruda SpO2.
- 4 categorías clinicas: leve (≤15) / moderada (16-39) / alta (40-69) / crítica (≥70).
- DOI/PMID Azarbarzin 2019 (10.1093/eurheartj/ehy624, PMID 30376054) agregado a `clinical-engine/src/references.ts` como `REF_HYPOXIC_AZARBARZIN_2019` (SSOT del monorepo).
- Decisión arquitectónica: engine vive en `psg-parser` (no `clinical-engine`) porque consume `PSGRecord` y es scoring específico de polisomnografía.
- **15 tests vitest** cubriendo 4 categorías + perfil C + mod temporal REM-predominant + edge cases. Total psg-parser: 104/104.
- Detalle: [[../sprints/sprint-18-engine-hipoxico/SPRINT-18-ENGINE-HIPOXICO]].

### Sprint 19 — ✅ MVP closed-verified (2026-05-26)

- Bootstrap Vite + React 18 + TS estricto + pnpm workspace dep `@somnosalud/psg-parser`.
- Componentes: Dropzone (drag&drop + click + keyboard a11y), FileList, FileRow (status badge + Download CSV individual).
- Hook `usePsgFiles` orquesta pipeline: extractText (pdf.js) → detectFormat → parseByFormat → computeHypoxicScore.
- `src/lib/`: schema (224 columnas + MAPPING_INFORME + EXTRA_INFORME), csv builder, filename builder, pdf.js wrapper.
- **16 tests vitest passing** (CSV escape edge cases + filename format + schema length).
- `pnpm build` Vite verde (`dist/` 3.5 MB con pdf.js worker bundled).
- Coexistencia con legacy-v0 mantenida.
- Detalle: [[../sprints/sprint-19-frontend-vite-conversor-psg/SPRINT-19-FRONTEND-VITE-CONVERSOR-PSG]].

### Sprint 19.B — ✅ closed-verified (2026-05-26)

- ZIP multi-archivo con JSZip + BOM UTF-8 + filename `CSV_PSG_<timestamp>.zip` (3 tests vitest).
- `<EnginePanel>` con 2 tabs: **Resultados** (score grande coloreado por catClass + 12 metric cards + 6 breakdown bars + perfil A/B/C + flags clínicos + tabla detalle 11 filas) y **Methodology** (7 secciones explicando scoring + cita Azarbarzin 2019 con DOI link).
- Integración: `<FileRow>` botón "Score Hipóxico" condicional + `<App>` state `engineFileId` + render condicional panel + botón "Descargar todos (ZIP)".
- **19/19 tests vitest** (16 CSV + 3 ZIP). Vite build verde 4.11s.
- Log técnico expandido y descripciones específicas quedaron diferidos a 19.C (decisión scope post smoke con Pablo).
- Detalle: [[../sprints/sprint-19-b-engine-ui-zip/SPRINT-19-B-ENGINE-UI-ZIP]].

### Sprint 19.C — Pendiente (archivar legacy)

- Cuando Pablo confirme paridad con PDFs reales, mover `legacy-v0/` → `legacy-v0/_archived/`.
- README explicando que vive ahí por referencia histórica + cómo correrlo si se necesita.

### Sub-DEBT futuro — PDFs reales anonimizados

- Sprint 15 trabaja con fixtures sintéticos (cero datos de pacientes reales).
- Pedir a Pablo (vía WhatsApp) 1 PDF anonimizado por equipo (7 totales) para reemplazar fixtures sintéticos en Sprint 18-19.
- Permite verificación empírica real: comparar output del nuevo parser vs output del legacy sobre el mismo PDF — cualquier diferencia es bug.

## Evidencia

- `cat packages/webapp-conversor-psg/legacy-v0/index.html | wc -l` → 1887 líneas.
- `grep -c "^function parse" packages/webapp-conversor-psg/legacy-v0/index.html` → 7 parsers.
- `ls packages/psg-parser/src/parsers/` → 1 archivo (philips-sleepware-g3.ts, Sprint 15).

## Scope total estimado

**Progreso global 95% (8.5/9 items):** 7/7 parsers + auto-detect + router + Engine Hipóxico + Frontend MVP + Engine UI + ZIP + Methodology ✅. Sólo Sprint 19.C (archivar legacy ~30min, requiere confirmación Pablo con smoke real de PDFs IFN) pendiente. Tiempo invertido: ~20h total (15: 3h + 16: 4h + 17: 3h + 18: 3h + 19: 4h + 19.B: 3h). **Total monorepo tests post-Sprint 19.B: 178 vitest passing** (clinical-engine 55 + psg-parser 104 + conversor-psg 19).

## Prioridad

**Medium.** No es ruta crítica para SomnoSalud webapp (productos independientes). El legacy funciona standalone. Pero:

1. El monorepo tiene un package `psg-parser/` parcialmente implementado (Sprint 15) — dejarlo huérfano genera deuda de "código que no termina de migrarse".
2. SomnoSalud webapp Fase 3 podría querer integrar Conversor PSG (paciente sube su PSG en `/eval/` → auto-pobla SleepData) — requiere el parser modular invocable como dep.
3. Tests con PDFs reales aumentan la confiabilidad clínica del flow (vs el legacy actual sin tests).

## Relacionados

- [[../sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]] — sprint origen (parser piloto + bootstrap).
- `packages/webapp-conversor-psg/legacy-v0/index.html` — código legacy 1.887 LOC.
- `packages/clinical-engine/src/references.ts` — SSOT de DOI/PMID. Engine Hipóxico Azarbarzin 2019 debe agregarse acá si Sprint 18 mueve el engine al clinical-engine.
