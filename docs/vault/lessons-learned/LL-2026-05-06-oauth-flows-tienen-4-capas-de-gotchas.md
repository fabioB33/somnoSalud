---
type: lesson-learned
date: 2026-05-06
sprint: ["77", "78"]
severity: high
category: oauth-integrations-discovery
tags:
  - oauth
  - google-ads
  - empirical-first
  - rule-8
  - integrations
  - api-requirements
  - mcc
  - developer-token
related_sprints:
  - SPRINT-77-GOOGLE-OAUTH-CALLBACK-STATE-BUG
  - SPRINT-78-GOOGLE-CUSTOMER-ID-AUTODISCOVERY
related_rules:
  - "regla #8 EMPIRICAL-FIRST-BEFORE-PLAN — refinamiento E4+E5 nuevas evidencias"
---

# LL-2026-05-06 — OAuth flows tienen 4 capas de gotchas (no 1)

> [!info] Lección heredada Pampa Labs Core
> Esta lesson learned se originó en el proyecto **Pampa Labs Core** (Sprints 77-78 Google Ads OAuth). Aplicable a SomnoSalud cuando se agreguen integraciones OAuth (Fase 3 wearables Oura/Fitbit/Apple Health, o Stripe Connect B2B sleep specialists). Las 4 capas (callback param naming + frontend rendering SSOT + customer_id auto-discovery + developer token / API access + smoke E2E) aplican universalmente a cualquier OAuth provider — validar las 4 ANTES de prometer time-to-value al cliente.
>
> Disclaimer agregado durante [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] (2026-05-08).

## Resumen

OAuth flows aparentemente simples ("conectá tu cuenta Google Ads") tienen **4 capas independientes** de potenciales bugs/blockers. Validar las 4 ANTES de prometer time-to-value al cliente.

Si solo validás 1-2 capas, vas a descubrir blockers a mitad del trabajo y prometiste algo que no podés cumplir HOY → pérdida de credibilidad con cliente.

## Las 4 capas

### Capa 1 — Callback param naming (OAuth standard vs custom)

**Problema típico:** el handler del callback espera un param custom (ej: `brand_id`) en lugar del standard OAuth (`state`). Google/Meta/TikTok envían siempre `state` con lo que el cliente embebió al iniciar el flow.

**Cómo detectar:** code review del callback handler + log del query params real que llega de Google.

**Caso real 2026-05-06:** Sprint 77 part 1. `config.routes.ts:106` esperaba `brand_id`, Google envió `state`. 100% de OAuth Google fallaban con HTTP 400 en 1ms.

### Capa 2 — Frontend rendering source-of-truth

**Problema típico:** la UI consulta una tabla legacy (creada en sprint anterior) en lugar de la SSOT actualizada por el callback OAuth. La conexión funciona técnicamente pero la UI muestra "Desconectado".

**Cómo detectar:** trazar `find()` o `select()` en el frontend + grep el endpoint que consume + verificar la tabla SQL real que retorna data.

**Caso real 2026-05-06:** Sprint 77 part 2. `PlaybookSettings.tsx:624` leía de `channelConnections` (tabla legacy `channel_connections`) en lugar de `googleStatus` (de `/integrations/status` que lee `brand_integrations` SSOT). UI mostraba "Conectar" aunque tokens estaban en DB correcta.

### Capa 3 — Customer ID / account selection auto-discovery

**Problema típico:** el OAuth grant da acceso a múltiples accounts pero el sistema no descubre cuál vincular. Persiste solo refresh_token sin saber qué cuenta consultar.

**Cómo detectar:** verificar que el callback hace una llamada extra a `listAccessibleAccounts` / `me/accounts` / `customers:listAccessibleCustomers` (el endpoint depende del provider). Sin esa llamada, el `ad_account_id` queda NULL.

**Caso real 2026-05-06:** Sprint 78 plan. Lure post-OAuth tiene refresh_token pero `ad_account_id=NULL`. Cron `metricsSync` skipea Lure por guard `if (!integ?.ad_account_id) return null`. Sin Customer ID el sistema no sabe qué cuenta Google Ads consultar.

### Capa 4 — Developer token / API access pre-requisites

**Problema típico:** el provider requiere un token / approval previo a nivel de aplicación que es independiente del OAuth del user. Sin ese token, **toda llamada a la API rechaza** independientemente del OAuth flow.

**Cómo detectar:** leer docs oficiales del provider sobre "API access requirements" / "developer token" / "app verification" / "sensitive scope review".

**Sub-capa 4.1 — Pre-requisitos institucionales**: a veces para conseguir el developer token hay que tener un "Manager Account" / "Business Verification" / "Verified domain". Eso suma pasos previos no triviales.

**Caso real 2026-05-06:** Sprint 78 blocker. Google Ads API requiere `GOOGLE_ADS_DEVELOPER_TOKEN`. Sin él, todas las requests Google Ads API rechazan con `403 PERMISSION_DENIED`. Para conseguir el token hay que tener un Manager Account (MCC) primero — verificado empíricamente en `ads.google.com/aw/apicenter`: "The API Center is only available to manager accounts."

Pampa Labs no tiene MCC todavía (solo cuentas individuales como Lure `543-749-4807`). Hay que crear MCC primero (5 min, gratis) → apply Test access (instant) → apply Basic access (1-2 días business review).

## Tabla resumen — checklist pre-vuelo OAuth integration

Antes de prometer "te conecto X HOY":

| Capa | Pregunta | Cómo verificar empíricamente |
|---|---|---|
| 1. Callback param naming | ¿El handler lee el param OAuth standard que el provider envía? | Code review del handler + log del query params real |
| 2. Frontend rendering SSOT | ¿La UI consulta el endpoint que lee la SSOT actualizada por el callback? | Grep frontend `find()` + verificar tabla SQL real |
| 3. Customer ID auto-discovery | ¿El callback descubre y persiste el account ID además del refresh_token? | Code review callback + DB query post-OAuth para ver ad_account_id |
| 4. Developer token / API access | ¿El provider requiere token / approval / verification a nivel app? | Docs oficiales del provider + verificación empírica env vars VPS |
| 4.1 Pre-requisitos institucionales | ¿Para conseguir ese token hay requisitos previos (MCC, business verify, etc)? | Página de application del provider + estado actual de Pampa Labs |

Solo si las 5 están OK → time-to-value real es predictible.

## Refinamiento regla #8 EMPIRICAL-FIRST

Para tareas que involucren **OAuth + APIs externas con scopes restringidos** (Meta, Google, TikTok, LinkedIn), la triangulación pre-flight ahora requiere **5 evidencias** (no 3):

- E1 — Code review (callback handler + service)
- E2 — DB query estado actual `brand_integrations` / equivalente
- E3 — Logs prod del último intento (si hay)
- **E4 (nueva) — Verificación developer token / API access en docs oficiales + env VPS**
- **E5 (nueva) — Verificación pre-requisitos institucionales (MCC, business verification, sensitive scope app verification)**

Sin E4 + E5, prometer time-to-value es **ruleta rusa con cliente**. El upfront cost de verificar 4 minutos extra es mucho menor que el costo reputacional de prometer y descubrir blocker en mitad del trabajo.

## Regla operativa derivada — comunicación al cliente

Cuando un cliente pide "conectame X" durante una llamada:

**MAL (high-risk):** "Sí, lo conectamos hoy"

**BIEN (verifiable):** "Vamos a destrabarlo. Voy a verificar 4 cosas en 5 minutos antes de darte un timeline real: el código del callback, el estado de la app en el provider, los env vars del backend, y los pre-requisitos de tu cuenta. Una vez verificado te paso plan honesto: HOY si no hay blockers, mañana si necesitamos approvals tipo developer token, o jueves si necesitamos business review del provider."

Esta cadencia preserva credibilidad incluso cuando hay blockers — cliente entiende que somos rigurosos vs improvisar.

## Vínculos relacionados

- [[../sprints/sprint-77-google-oauth-callback-state-bug/SPRINT-77-GOOGLE-OAUTH-CALLBACK-STATE-BUG]] — sprint que detectó capas 1+2
- [[../sprints/sprint-78-google-customer-id-autodiscovery/SPRINT-78-GOOGLE-CUSTOMER-ID-AUTODISCOVERY]] — sprint que detectó capas 3+4
- [[../sessions/2026-05-06-cowork-lure-google-ads-oauth-sprint-77-78-mcc-discovery]] — sesión completa
- [[../debt/DEBT-env-vars-undocumented]] — DEBT preexistente confirmado capa 4
- [[CLAUDE.md]] regla #8 EMPIRICAL-FIRST — fuente de la actualización E4+E5

---

*Lección aplicable a cualquier integración OAuth futura (Meta, Google, TikTok, LinkedIn, Stripe Connect, etc). Las 4 capas son universales — los nombres de capa-4 cambian por provider pero existen siempre.*
