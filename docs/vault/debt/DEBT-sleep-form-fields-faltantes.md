---
title: "Deuda Técnica — SleepForm captura solo 7 de 12 campos del SleepData clinical-engine"
date: 2026-05-09
tags: [deuda-tecnica, webapp, sleep-form, clinical-engine, closed-verified]
status: closed-verified
closed_date: 2026-05-14
closed_by: sprint-9-sleep-form-fields-extension
priority: medium
scope: sprint-9
detected_during: sprint-8-results-capa-5
related:
  - "[[../sprints/sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]]"
  - "[[../sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]]"
  - "[[../sprints/sprint-9-sleep-form-fields-extension/SPRINT-9-SLEEP-FORM-FIELDS-EXTENSION]]"
---

> [!success] Cerrado 2026-05-14 (Sprint 9)
> SleepForm extendido de 7 a 13 campos. 6 nuevos opcionales en sección Accordion "Más detalles": `earlyAwakeningFreq`, `earlyAwakeningMin` (cierra el gap crítico de detección EMA en `classifyInsomniaPhenotype`), `caffeineCupsDay`, `caffeineLastHour`, `screenBeforeBed`, `treatmentPreference`. `buildSleepData()` ya no hardcodea defaults — propaga valores reales del state. Ejercicio postergado a sprint futuro sleep-hygiene dedicado (no parte de este cierre). Decisión clínica asumida sin signoff Pablo explícito (validación visual queda pendiente próxima reunión IFN — sin riesgo porque NO se modificó lógica del clinical-engine, solo se enriqueció su input). 19/19 E2E passing post-cambios.


# DEBT-sleep-form-fields-faltantes

> [!info] Origen
> Detectado durante Sprint 8 al implementar `lib/results-builder.ts` función `buildSleepData()`. La interface `SleepData` del clinical-engine (`packages/clinical-engine/src/types.ts:38`) tiene **12 campos** pero `state.sleep` del Sprint 7.B captura solo **7**. En el builder se proveen defaults razonables, pero algunos afectan algoritmos clínicos.

## Contexto

### `SleepData` requerida por clinical-engine

```typescript
interface SleepData {
  sleepLatencyMinutes: number;        // ✅ capturado Sprint 7.B
  nightAwakenings: number;            // ✅ capturado
  earlyAwakening: 'never' | 'sometimes' | 'frequently' | 'always';  // ❌ default 'never'
  earlyMorningAwakeningMinutes: number;  // ❌ default 0
  totalSleepHours: number;            // ✅ capturado
  timeInBedHours: number;             // ✅ capturado
  subjectiveQuality: number;          // ✅ capturado (slider 1-10)
  bedtimeWeekday?: string;            // ✅ capturado
  waketimeWeekday?: string;           // ✅ capturado
  caffeineLastHour?: number;          // ❌ no capturado (opcional, default undefined)
  caffeineCupsDay?: number;           // ❌ no capturado
  screenBeforeBed?: 'always' | 'frequently' | 'sometimes' | 'never';  // ❌ no capturado
  exerciseFrequency?: number;         // ❌ no capturado
  exerciseTime?: string;              // ❌ no capturado
  treatmentPreference?: 'natural_only' | 'open_to_supplements' | 'open_to_all';  // ❌ no capturado
}
```

### Impacto

**Crítico (afectan phenotype):**
- `earlyAwakening` + `earlyMorningAwakeningMinutes` → `classifyInsomniaPhenotype` los usa para detectar early morning awakening (EMA) component. Si paciente realmente tiene EMA, **no lo detectamos** porque hardcodeamos `'never'` y `0`.

**Medio (afectan recomendaciones):**
- `caffeineLastHour` + `caffeineCupsDay` → relevante para `engine/sleep-hygiene.ts` (sugerir reducir cafeína antes de dormir).
- `screenBeforeBed` → idem (sugerir blue-light filter / no pantalla 1h antes).
- `exerciseFrequency` + `exerciseTime` → idem (timing de ejercicio).
- `treatmentPreference` → afecta qué recomendaciones se priorizan (paciente que prefiere "natural_only" no debería ver melatonina priority).

**Bajo (no afectan algoritmos hoy):**
- Ninguno.

## Evidencia

- `packages/webapp-somnosalud/lib/results-builder.ts:127-138` — función `buildSleepData()` con defaults documentados con comentario.
- `packages/webapp-somnosalud/app/eval/sleep/SleepForm.tsx` — captura 7 campos.
- `packages/clinical-engine/src/engine/phenotype.ts` — usa `earlyAwakening` + `earlyMorningAwakeningMinutes` en detección EMA.
- Búsqueda: `grep "earlyAwakening\|caffeineCups\|screenBefore" packages/clinical-engine/src/`.

## Propuesta

Sprint 9 (~1.5h):

1. **Decisión clínica con Pablo** (vía WhatsApp): ¿qué campos vale agregar al SleepForm? Mi recomendación priorizada:
   - **Crítico**: `earlyAwakening` + `earlyMorningAwakeningMinutes` (afecta phenotype, base de recomendaciones).
   - **Útil**: `caffeineLastHour` + `caffeineCupsDay` + `screenBeforeBed`.
   - **Skippable**: `exerciseFrequency` + `exerciseTime` (puede ir en sleep hygiene step separado en Sprint 11+).
   - **Importante UX**: `treatmentPreference` — afecta priorización de recomendaciones farmacológicas vs comportamentales.

2. Extender `SleepForm.tsx` con los campos aprobados. Mantener UX clean (collapsible "más detalles" para no overwhelm).
3. Update `EvalState['sleep']` shape en `usePersistEval.ts`.
4. Update `buildSleepData()` para usar los valores reales en lugar de defaults.
5. Verificar empíricamente con `?debug=1` en `/eval/results` que phenotype + recommendations cambian con los nuevos campos.

## Scope

**Sprint 9** (preferiblemente). Sin esto, **no afecta** Sprint 9 Supabase setup (la migración persiste el shape actual), pero **sí afecta** la **calidad clínica** de las recomendaciones — paciente puede recibir recomendaciones sub-óptimas.

## Prioridad

**medium** — afecta calidad clínica pero no es bloqueante. Pablo Ferrero (owner clínico) decide en qué sprint priorizar. Crítico antes de pre-launch público (Sprint 13+) porque afecta lo que el paciente ve como recomendación final.

## Relacionados

- [[../sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]] — donde se diseñó el SleepForm minimalista original.
- [[../sprints/sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]] — donde se detectó al integrar buildResults con clinical-engine.
- [[../../../.claude/agents/compliance-anmat]] — signoff Pablo necesario para cualquier cambio en flow clínico.
