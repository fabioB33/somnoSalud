---
title: "Deuda Técnica — vitest sin coverage output rompe turbo cache"
date: 2026-05-08
last_updated: 2026-06-19
tags: [deuda-tecnica, testing, vitest, turbo, cache, infraestructura, open, cosmetic]
status: open
priority: low
scope: sprint-2
detected_during: sprint-1-cleanup-os-heredado
notes_2026_06_19: "Audit confirmó que el warning sigue presente pero NO bloquea ningún CI ni rompe builds — solo es ruido en logs. Fix recomendado (30 min) en próximo sprint que toque infrastructure/testing: agregar a vitest.config.ts → coverage: {reporter: ['text', 'json', 'html'], reportsDirectory: 'coverage'}. Mientras tanto, low priority OK."
related:
  - "[[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
---

# DEBT-vitest-coverage-output

> [!info] Origen
> Detectado durante FASE 1 H3 del Sprint 1 al correr el pipeline CI local. Turbo emite warning en cada `pnpm test` y `pnpm build`.

## Contexto

`turbo.json` declara el task `test` con `outputs: ["coverage/**"]` (línea 16) pero la config actual de vitest en `packages/clinical-engine/vitest.config.ts` no genera coverage por default. Resultado: turbo cachea el task pero emite warning porque no encuentra los outputs declarados.

```
WARNING  no output files found for task somnosalud-clinical-engine#test. Please check your `outputs` key in `turbo.json`
```

Y desde Sprint 1 también para los 4 packages skeleton:

```
WARNING  no output files found for task @somnosalud/psg-parser#test
WARNING  no output files found for task @somnosalud/shared-ui#test
WARNING  no output files found for task @somnosalud/webapp-conversor-psg#test
WARNING  no output files found for task @somnosalud/webapp-somnosalud#test
```

**Impacto:** ruido en logs de CI + turbo cache no funciona como debería para `test` (el cache hit solo detecta inputs, no compara outputs vs realidad).

**No bloqueante** — los tests siguen pasando 55/55. Pero el warning sucio entrena al equipo a ignorar warnings de turbo, lo que es peligroso a futuro cuando aparezca uno real.

## Evidencia

- `turbo.json:16` declara `"outputs": ["coverage/**"]` para task `test`.
- `packages/clinical-engine/vitest.config.ts` (líneas 1-8) no tiene config `coverage` — no se genera carpeta `coverage/`.
- Output de `pnpm test 2>&1 | tail -5` muestra el warning con cada uno de los 5 packages.

## Propuesta

Dos opciones:

1. **Activar coverage real** — agregar a `vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config';
   export default defineConfig({
     test: {
       include: ['tests/**/*.test.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'lcov'],
         reportsDirectory: 'coverage',
       },
     },
   });
   ```
   + agregar `@vitest/coverage-v8` a devDeps. Output: carpeta `coverage/` real, turbo deja de quejarse, y nos sirve para el target Fase 1 Sprint 11 ("100% cobertura `clinical-engine/scoring/`").

2. **Quitar `outputs: ["coverage/**"]` de `turbo.json`** y declarar el task como `outputs: []`. Más simple pero pierde la capacidad de cachear el resultado coverage cuando se active.

**Recomendación:** opción 1. Estimación: 30 min. Bloqueada hasta que decidamos en Sprint 2 si vale el costo de agregar `@vitest/coverage-v8` (~5 MB instalado).

## Scope

Sprint 2 o cualquier sprint que toque tests del clinical-engine. No urgente.

## Prioridad

**low** — solo es ruido en logs. No afecta compliance, ni clínica, ni roadmap. Pero conviene cerrarlo antes de que el equipo se acostumbre a ignorar warnings de turbo.

## Relacionados

- [[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — sprint que detectó el DEBT
- [[../processes/QA-CHECKLIST]] — el §A item 3 pide tests OK; coverage real lo refuerza.
- [[../MASTER-PLAN]] — Sprint 11 (Fase 1) exige 100% coverage `clinical-engine/scoring/`, este DEBT habilita la métrica.
