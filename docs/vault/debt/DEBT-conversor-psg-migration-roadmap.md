---
title: "Deuda Técnica — migración Conversor PSG legacy → modular (Sprints 16-19 pendientes)"
date: 2026-05-14
tags: [deuda-tecnica, psg-parser, conversor-psg, migration, fase-2, open]
status: open
priority: medium
scope: sprint-16-17-18-19
detected_during: sprint-15-psg-parser-bootstrap
related:
  - "[[../sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
---

# DEBT-conversor-psg-migration-roadmap

> [!info] Origen
> Sprint 15 (2026-05-14) inició la migración del Conversor PSG legacy (1.887 LOC HTML monolítico en `packages/webapp-conversor-psg/legacy-v0/index.html`) al package modular `packages/psg-parser/` con TypeScript estricto. Sprint 15 entregó: bootstrap + parser piloto Philips Sleepware G3 + 15/15 tests passing. **Quedan 6 parsers + Engine Hipóxico + Frontend nuevo** distribuidos en Sprints 16-19.

## Contexto

El legacy `legacy-v0/index.html` sigue 100% funcional standalone (`python3 -m http.server 8765`). NO está roto. Esta DEBT trackea la migración progresiva — el legacy se archiva solo cuando el nuevo alcanza paridad funcional verificable (Sprint 19).

**Decisión estratégica (acordada con Fabio 2026-05-14):** fraccionar la migración Fase 2 (estimada 25-35 h por CLAUDE.md) en sprints chicos de 3-8 h cada uno. Permite parar entre sprints sin dejar trabajo huérfano.

## Roadmap

### Sprint 16 — 3 parsers diagnósticos (~3-4 h)

- **BrainWave (PSG):** parser legacy líneas 645-897. Formato muy similar a Sleepware G3 con variantes (fecha DD-MM-YYYY, hora "23/03/2026 10:08 PM", SpO2 umbrales desde <88%, arousal sin columna Dl+D).
- **Philips Alice NightOne:** parser legacy líneas 898-1000. Poligrafía sin EEG (subset reducido).
- **ResMed AirView Diagnóstico:** parser legacy líneas 1001-1108. Poligrafía con OData.
- Cada parser: src/parsers/<equipo>.ts + tests/fixtures/<equipo>.ts + tests/parsers/<equipo>.test.ts.
- Patrón establecido en Sprint 15 (regex idénticas al legacy, shape PSGRecord compartido).

### Sprint 17 — 3 parsers tratamiento + BMC (~3 h)

- **ResMed AirView Tratamiento:** parser legacy líneas 1109-1192. Reporte CPAP/cumplimiento.
- **BMC Tratamiento:** parser legacy líneas 1193-1259.
- **BMC Poligrafía:** parser legacy líneas 1260-1421. Mayormente imágenes en el PDF original, texto extraíble limitado.
- Idem patrón Sprint 15-16.

### Sprint 18 — Engine Hipóxico modular + tests con DOI (~5-7 h)

- **Engine Hipóxico:** función `computeHypoxicScorePSG()` del legacy líneas 1648-1738. Score 0-100 con 6 componentes (Azarbarzin 2019 hypoxic burden + variantes IFN).
- Migrar a `src/engine/hypoxic.ts` + agregar DOI a `clinical-engine/src/references.ts` (NO duplicar — `references.ts` es SSOT).
- Tests vitest con casos clínicos: severo / moderado / leve / normal.
- Considerar mover el engine a `clinical-engine/` si es lógica clínica pura (decisión de arquitectura a tomar en Sprint 18 con triangulación).

### Sprint 19 — Frontend Vite+React (~5-8 h)

- Reemplazar `legacy-v0/index.html` con Vite + React + pdf.js + JSZip modular en `packages/webapp-conversor-psg/src/`.
- Componentes: Dropzone, FileList, FileRow, EnginePanel, CSVExport, ZipExport.
- Coexistencia temporal: `legacy-v0/` queda accesible hasta paridad confirmada. Después se mueve a `legacy-v0/_archived/` con README explicando que vive ahí por referencia histórica.
- Smoke E2E (Playwright o manual): subir 1 PDF de cada equipo + verificar CSV output coincide con el del legacy.

### Sub-DEBT futuro — PDFs reales anonimizados

- Sprint 15 trabaja con fixtures sintéticos (cero datos de pacientes reales).
- Pedir a Pablo (vía WhatsApp) 1 PDF anonimizado por equipo (7 totales) para reemplazar fixtures sintéticos en Sprint 18-19.
- Permite verificación empírica real: comparar output del nuevo parser vs output del legacy sobre el mismo PDF — cualquier diferencia es bug.

## Evidencia

- `cat packages/webapp-conversor-psg/legacy-v0/index.html | wc -l` → 1887 líneas.
- `grep -c "^function parse" packages/webapp-conversor-psg/legacy-v0/index.html` → 7 parsers.
- `ls packages/psg-parser/src/parsers/` → 1 archivo (philips-sleepware-g3.ts, Sprint 15).

## Scope total estimado

~14-22 h restantes en 4 sprints (16-19). El Sprint 15 ya invirtió ~3 h.

## Prioridad

**Medium.** No es ruta crítica para SomnoSalud webapp (productos independientes). El legacy funciona standalone. Pero:

1. El monorepo tiene un package `psg-parser/` parcialmente implementado (Sprint 15) — dejarlo huérfano genera deuda de "código que no termina de migrarse".
2. SomnoSalud webapp Fase 3 podría querer integrar Conversor PSG (paciente sube su PSG en `/eval/` → auto-pobla SleepData) — requiere el parser modular invocable como dep.
3. Tests con PDFs reales aumentan la confiabilidad clínica del flow (vs el legacy actual sin tests).

## Relacionados

- [[../sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]] — sprint origen (parser piloto + bootstrap).
- `packages/webapp-conversor-psg/legacy-v0/index.html` — código legacy 1.887 LOC.
- `packages/clinical-engine/src/references.ts` — SSOT de DOI/PMID. Engine Hipóxico Azarbarzin 2019 debe agregarse acá si Sprint 18 mueve el engine al clinical-engine.
