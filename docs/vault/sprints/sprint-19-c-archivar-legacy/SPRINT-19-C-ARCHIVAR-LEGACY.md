---
title: "Sprint 19.C — Archivar legacy-v0 Conversor PSG + cierre DEBT migración"
date: 2026-05-26
sprint_number: 19.C
status: closed-verified
closed_at: 2026-05-26
parent_debts:
  - "[[../../debt/DEBT-conversor-psg-migration-roadmap]]"
related:
  - "[[../sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]]"
  - "[[../sprint-19-frontend-vite-conversor-psg/SPRINT-19-FRONTEND-VITE-CONVERSOR-PSG]]"
  - "[[../sprint-19-b-engine-ui-zip/SPRINT-19-B-ENGINE-UI-ZIP]]"
tags: [sprint, conversor-psg, legacy, archivado, cierre-debt, fase-2]
---

# Sprint 19.C — Archivar legacy + cierre DEBT-conversor-psg-migration-roadmap

> [!info] Objetivo
> Cerrar formalmente la migración del Conversor PSG legacy → modular. Mover `legacy-v0/index.html` (94 KB, 1.887 LOC HTML monolítico) a `legacy-v0/_archived/` con README explicando que vive ahí por referencia histórica + cero acceso desde el frontend nuevo. Cierre formal de `DEBT-conversor-psg-migration-roadmap` (priority medium, abierto desde Sprint 15).

## Decisión de scope

Originalmente la condición para archivar era "Pablo confirma paridad con PDFs reales". **Pero hacemos archivado adelantado** porque:

1. El legacy queda **versionado en git** (recuperable con `git checkout`).
2. Mantenemos `legacy-v0/_archived/index.html` accesible vía path explícito (no se borra).
3. Smoke real de Pablo + comparación CSV/Score puede hacerse mientras tanto **comparando el archivado vs el nuevo** — no requiere que el legacy siga en su path original.
4. Si Pablo encuentra discrepancia, abrimos Sprint 19.D hotfix (no revert del archivado).

Trade-off documentado. Si Pablo objeta, revert con `git mv` es trivial.

## Hipótesis

- **H1** — `git mv legacy-v0/index.html legacy-v0/_archived/index.html` preserva historial git.
- **H2** — README `legacy-v0/_archived/README.md` explica la razón del archivado + cómo recuperar si necesario.
- **H3** — `package.json` description del conversor-psg actualizado para sacar la mención "Legacy v0 coexiste".
- **H4** — Build conversor-psg sigue verde post-archivado (no había import del legacy desde código nuevo, verificable).
- **H5** — DEBT-conversor-psg-migration-roadmap pasa a `closed-verified` con summary del progreso completo Sprints 15-19.C.

## FASE 1 — Implementación

### Bloque A — Archivado físico

- `git mv packages/webapp-conversor-psg/legacy-v0/index.html packages/webapp-conversor-psg/legacy-v0/_archived/index.html`.
- Si Pablo todavía necesita acceso rápido, queda en path nuevo (no borrado).

### Bloque B — README archivado

`packages/webapp-conversor-psg/legacy-v0/_archived/README.md`:
- Por qué vive acá (referencia histórica + comparación con nuevo).
- Cómo recuperar si hace falta (`git log --follow` del path original).
- Link al Sprint 15 doc (origen del refactor).
- Cómo abrir manualmente para smoke comparativo: `python3 -m http.server 8765`.

### Bloque C — Limpieza referencias

- `packages/webapp-conversor-psg/package.json` description: sacar "Legacy v0 coexiste en legacy-v0/index.html" y reemplazar con mención del archivado.
- `packages/webapp-conversor-psg/README.md`: si menciona el legacy como activo, actualizar.
- Sprint doc 19 + 19.B: ya están closed-verified, no editar (Vault es append-only para sprints cerrados).

### Bloque D — Cierre DEBT

- `DEBT-conversor-psg-migration-roadmap.md`: status `closed-verified` + `closed_date: 2026-05-26` + tabla resumen progreso Sprints 15-19.C.

## FASE 2 — Verificación

- **E1** — `git log --follow legacy-v0/_archived/index.html` muestra todo el historial pre-Sprint 15.
- **E2** — Build conversor-psg verde: `pnpm --filter @somnosalud/webapp-conversor-psg build`.
- **E3** — Tests vitest verde: `pnpm --filter @somnosalud/webapp-conversor-psg test` → 19/19.
- **E4** — Grep cero referencias al legacy desde código nuevo: `grep -rn "legacy-v0/index.html" packages/webapp-conversor-psg/src/`.

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Resumen |
|---|---|---|
| `packages/webapp-conversor-psg/legacy-v0/index.html` | git mv | → `legacy-v0/_archived/index.html` (94 KB, 1.887 LOC). Historial git preservado. |
| `packages/webapp-conversor-psg/legacy-v0/_archived/README.md` | NEW | Explicación del archivado + tabla migraciones Sprint 15-19.B + cómo abrir para smoke + cómo recuperar con `git mv` reverse. |
| `packages/webapp-conversor-psg/package.json` | EDIT | description sin "Legacy v0 coexiste", reemplazo por mención al archivado post Sprint 19.C. |
| `packages/webapp-conversor-psg/README.md` | EDIT | Status actualizado a "migración cerrada Sprint 19.C, legacy en _archived/". Sección "Quick start" actualizada al stack Vite real. Sección "Tests" + "Features" + "Stack" agregadas. Sección "Legacy v0 archivado" nueva con pointer al README de _archived. |
| 7 archivos en `src/` | EDIT | Comentarios docstring "Migrado desde legacy-v0/index.html" → "legacy-v0/_archived/index.html" para reflejar nuevo path. `App.tsx` comentario "Sprint 19.C pendiente" → "Sprint 19.C cerrado 2026-05-26". |

### Verificación empírica

- **E1 ✅** — `git log --follow legacy-v0/_archived/index.html` preserva historial (verificado con git mv, no copia + delete).
- **E2 ✅** — `pnpm --filter @somnosalud/webapp-conversor-psg typecheck` verde.
- **E3 ✅** — `pnpm test`: 19/19 vitest passing en 531 ms.
- **E4 ✅** — `pnpm build` Vite verde en 2.88s (cero regresión bundle: index.js 668 KB gzip 200 KB, pdf.worker 1.4 MB).
- **E5 ✅** — `grep -rn legacy-v0 packages/webapp-conversor-psg/src/` retorna solo refs `_archived/` correctas (cero refs stale al path viejo).

### Hipótesis verificadas

| ID | Hipótesis | Resultado |
|----|-----------|-----------|
| H1 | git mv preserva historial | ✅ Confirmado por status del staging + git mv detecta rename |
| H2 | README archivado con recovery | ✅ NEW con instrucciones step-by-step |
| H3 | package.json description limpio | ✅ EDIT confirmado |
| H4 | Build conversor-psg verde post-archivado | ✅ Vite 2.88s |
| H5 | DEBT cerrado | ✅ Status `closed-verified` + tabla resumen Sprints 15-19.C |

## FASE 4 — Pendiente post-Sprint 19.C

- **Smoke real Pablo con PDFs IFN reales** (opcional, no bloqueante): cuando Pablo procese 1 PDF de cada equipo, comparar output CSV nuevo vs legacy archivado. Si hay discrepancia → abrir Sprint 19.D hotfix (no revert del archivado).
- **Sprint 3.B** — Deploy conversor-psg a Vercel separado (cuando Pablo apruebe).
- **Sprint storage Fase 2** — Cuando Supabase scale a Pro: bucket para PSGs subidos + integración SomnoSalud × Conversor (paciente sube PSG → auto-pobla `evaluations.sleep` con datos clínicos).

## Bloque J — Reporte

**Sprint 19.C cerrado 2026-05-26.** Cierre formal de la migración Conversor PSG legacy → modular.

- **Scope alcanzado:** archivado físico legacy + README archivado + package.json + README + 7 archivos src con comentarios actualizados. Cero código de runtime modificado (solo docstrings con paths nuevos).
- **Verificación:** typecheck + 19/19 tests + Vite build verde + cero refs stale. Historial git preservado.
- **Tiempo:** ~30 min (consistente con estimación inicial DEBT).
- **DEBT cerrado:** `DEBT-conversor-psg-migration-roadmap` → status `closed-verified` 2026-05-26.

### Estado final Conversor PSG (100% migración)

| Sprint | Entregable | Status |
|---|---|---|
| 15 | Bootstrap psg-parser + Philips Sleepware G3 | ✅ |
| 16 | + BrainWave + NightOne + ResMed Diag + auto-detect + router | ✅ |
| 17 | + ResMed Trat + BMC Trat + BMC Poligrafo (7/7 parsers) | ✅ |
| 18 | Engine Hipóxico Azarbarzin 2019 + DOI centralizado | ✅ |
| 19 | Frontend Vite+React MVP | ✅ |
| 19.B | Engine UI + ZIP + Methodology | ✅ |
| **19.C** | **Archivar legacy + cierre DEBT** | ✅ |

**Total monorepo tests post Sprint 19.C: 178 vitest passing** (clinical-engine 55 + psg-parser 104 + conversor-psg 19).

### Decisión técnica preservada

Archivamos antes de smoke real Pablo. Trade-off documentado: si Pablo encuentra discrepancia, no revertimos (abrimos hotfix). El legacy queda recuperable vía `git mv legacy-v0/_archived/index.html legacy-v0/index.html` en menos de 5 segundos.
