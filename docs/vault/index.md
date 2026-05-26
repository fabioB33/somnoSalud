---
title: "SomnoSalud Vault — Map of Content (MOC)"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [moc, index, vault, somnosalud, pampalabs-context]
status: active
related:
  - "[[../../CLAUDE]]"
  - "[[MASTER-PLAN]]"
  - "[[vision/PRODUCT-VISION-SOMNOSALUD]]"
  - "[[clinical/COMPLIANCE-ARGENTINA]]"
owner: jorge + pablo-ferrero + cowork
created: 2026-05-07
---

# SomnoSalud Vault — Map of Content

> Punto de entrada del Vault Obsidian del proyecto SomnoSalud.
> Todo doc empieza acá o se vincula desde acá. Si un doc no es alcanzable desde este MOC vía wikilinks, está huérfano.

---

## 🎯 Documentos canónicos (leer primero)

- [[../../CLAUDE]] — el CLAUDE.md raíz del repo, define quiénes somos + reglas + stack + roadmap
- [[MASTER-PLAN]] — roadmap de las 3 fases con entregables por sprint
- [[vision/PRODUCT-VISION-SOMNOSALUD]] — visión del producto + tesis + targets B2C/B2B
- [[vision/PRODUCT-ROADMAP-2026-05-18-jorge]] — brief Jorge SaaS B2C suscripción + B2B White Label API keys + E-commerce satelital. Status: pending-pablo-input
- [[clinical/COMPLIANCE-ARGENTINA]] — compliance regulatorio Ley 25.326 + 26.529 + ANMAT
- [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — análisis pre-bootstrap (Drive Pablo + plan de migración del bundle compilado al source TypeScript + decisiones técnicas + 3 fases roadmap detallado)

---

## 📐 Procesos universales (heredados de Pampa Labs OS)

Los procesos viven en `processes/` y son **reutilizables cross-product**. Cualquier sprint debe seguirlos:

- [[processes/AUDITORIA-METODOLOGIA]] — metodología de auditoría Fase A trimestral
- [[processes/DEPLOY-WORKFLOW]] — proceso de deploy + triangulación 3 evidencias
- [[processes/QA-CHECKLIST]] — checklist técnico pre-merge
- [[processes/SPRINT-CLOSURE-CHECKLIST]] — FASE 4 obligatoria + Bloque K filesystem housekeeping
- [[processes/TEMPLATE-DEBT]] — template para crear DEBTs
- [[processes/OBSIDIAN-VAULT-CONVENTIONS]] — convenciones del Vault
- [[processes/LOOP-7-STEPS]] — loop iterativo de desarrollo
- [[processes/VERIFICATION-QUERY-SCHEMA]] — schema para queries de verificación de DEBTs
- [[processes/GSD-WORKFLOW]] — workflow `/gsd:plan-phase` y `/gsd:execute-phase`
- [[processes/SUPERPOWERS-MULTI-AGENT-WORKFLOW]] — paralelización de patches independientes
- [[processes/VAULT-PUBLISH]] — proceso de publicación del Vault (cuando aplique)
- [[processes/GOOGLE-OAUTH-VERIFICATION-SUBMISSION]] — submit OAuth verification a Google (relevante Fase 3 si hacemos OAuth Google)

---

## 🧠 Lessons learned (heredados Pampa Labs OS + nuevos del proyecto)

- [[lessons-learned/LL-2026-05-04-debt-status-drift-cross-brand-leakage-false-alarm]] — el DEBT status puede dar drift cross-brand con cross-leakage; verificar con triangulación 3 evidencias antes de proponer fix
- [[lessons-learned/LL-2026-05-05-empirical-vps-logs-revealed-schema-drift]] — smoke E2E con cuenta FRESH es evidencia obligatoria para flows self-service, no solo logs/sentry
- [[lessons-learned/LL-2026-05-06-listAccessibleCustomers-pattern]] — pattern reutilizable para auto-discovery customer_id post-OAuth (aplicable a Meta/TikTok/LinkedIn/Stripe Connect)
- [[lessons-learned/LL-2026-05-06-oauth-flows-tienen-4-capas-de-gotchas]] — refinamiento regla #8 EMPIRICAL-FIRST: OAuth flows requieren 5 evidencias E1-E5 (callback param naming + frontend rendering SSOT + customer_id auto-discovery + developer token / API access + smoke E2E)
- [[lessons-learned/LL-2026-05-06-rpc-validar-name-no-solo-slug]] — al validar uniqueness en RPC, validar `name` no solo `slug` (caso Lure brand fantasma)
- [[lessons-learned/LL-2026-05-07-filesystem-housekeeping-drift]] — 5 patrones que rompen la regla del Vault como fuente única (worktrees, deliverables, repos externos, naming, branches stale) + mitigaciones formalizadas
- [[lessons-learned/LL-2026-05-08-conteo-describe-vs-test-blocks]] — contar tests con grep de `describe(` da número falso; siempre correr el test runner para conteo real (vitest/jest reportan línea `Tests N passed`)
- [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]] — Tailwind JIT NO genera utility custom referenciada solo via `@apply` en CSS; usar CSS directo o `safelist`. Detectado en HOTFIX-2026-05-09 (gradient SomnoSalud ausente del body)

---

## 🏥 Clínico

- [[clinical/COMPLIANCE-ARGENTINA]] — compliance regulatorio AR
- [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]] — análisis pre-bootstrap

> **A medida que se validan algoritmos clínicos con Pablo, agregar acá:** carpeta `clinical/scoring-validation/` con un doc por instrumento (ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21) documentando: fuente DOI/PMID, casos edge, signoff conceptual de Pablo (quote WhatsApp + fecha).

---

## 🚀 Sprints

- [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]] — cleanup del OS heredado tras commit `6f8f6c9`: package-lock huérfano, SETUP.sh foot-gun, análisis exhaustivo duplicado, packages skeleton sin package.json. Cierra Fase 0.4 del MASTER-PLAN. Status: closed-verified.
- [[sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] — Sprint 2.A curar 46 agents heredados → 26 activos (25 mantenidos + 1 propio `compliance-anmat`) + 22 archivados con README. Reescritura QA-CHECKLIST + DEPLOY-WORKFLOW para SomnoSalud. Adaptación SCC + TEMPLATE-DEBT + disclaimer 5 LLs. CLAUDE.md "Skills obligatorias" reescrita. Cierra DEBT-curar-agents-pampalabs-os y DEBT-procesos-heredados-content-factory. Status: closed-verified.
- [[sprints/sprint-2-curar-os-heredado/SPRINT-2B-RUNBOOK-SUPABASE]] — Sprint 2.B runbook listo para Fabio (crear project Supabase Org Pampa Labs FREE São Paulo + setear MCP supabase-somnosalud con project ref real). Status: pending-fabio.
- [[sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]] — Sprint 5 scaffold inicial webapp-somnosalud (Next.js 14 App Router + Tailwind + shadcn/ui + tsconfig + workspace dep clinical-engine + welcome page con smoke test scoreISI en build-time). Salta Sprint 2.B y 3 por decisión equipo (no bloquean webapp client-side). Status: closed-verified.
- [[sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]] — Sprint 5.5 complementario captura en Vault las decisiones técnicas + convenciones + stack inventory post-Sprint 5. 9 docs nuevos en Vault + 2 updates (overview.md + README webapp). 3 nuevos directorios (architecture/adr, concepts, reference) con README index. Status: closed-verified.
- [[sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]] — Sprint 6 implementa capas 1-3 de ADR-003 (middleware Capa 1 verificada con curl, layout Capa 2 DisclaimerBanner, profile Capa 3 verificación edad <18 UTC) + 4 pantallas P0 + 4 componentes shadcn nuevos (Checkbox, Input, Label, Alert) + estado client-side (sessionStorage + cookie consent). 17 archivos nuevos en webapp. Status: closed-verified.
- [[sprints/sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]] — Sprint 7.A implementa Capa 4 ADR-003 (`/eval/safety` con `evaluateAllSafetyRules` + `/eval/derivacion-especialista` para block hard + restrict warning) + componente genérico `<QuestionnaireForm>` reutilizable (extendido para `item.options` ISI-like) + 3 cuestionarios (ISI 7×5niveles, ESS 8×4niveles uniformes, STOP-BANG 5manual+3auto). 14 archivos nuevos, 12 routes detectadas, smoke E2E 11/11 HTTP 200. Status: closed-verified.
- [[sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]] — Sprint 7.B implementa PHQ-9 (con detección live ítem 9 + CrisisHotlineCard variant default/reinforced) + GAD-7 + DASS-21 (21 items intercalados, sin agrupar para no romper validación clínica) + sleep diary form custom (7 campos heterogéneos) + lab opcional (7 parámetros con 3 paths skip) + genetics opcional (5 variantes con sentinel "no sé") + placeholder /eval/results. 14 archivos nuevos, 18 routes detectadas, flow de evaluación end-to-end funcional. Status: closed-verified.
- [[sprints/sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]] — Sprint 8 implementa Capa 5 ADR-003 con `/eval/results` real: `lib/results-builder.ts` función pura + ResultsContent con Accordion 6 secciones (resumen scoring + recomendaciones + lab + genetics + banderas + datos faltantes) + DisclaimerBanner reinforced top/bottom + export PDF + reset + ?debug=1 panel. PHQ-9 ítem 9 dispara hotline reinforced. Risk severe muestra derivación urgente. **Cierra Fase 1 client-side: 13 pantallas + 7 capas compliance + 19 routes prerendered.** Sub-DEBT abierto: [[debt/DEBT-sleep-form-fields-faltantes]]. Status: closed-verified.
- [[sprints/sprint-8-5-ux-cuestionario/SPRINT-8-5-UX-CUESTIONARIO]] — Sprint 8.5 UX polish del `<QuestionnaireForm>` post-feedback: pills horizontales (no stack vertical), number badge con tick lucide, progress sticky interno, smooth scroll al siguiente item, separators DASS-21 "Parte 1/2/3 de 3". Sin cambios lógica clínica. 17/17 rutas HTTP 200. Status: closed-verified.
- [[sprints/sprint-8-6-welcome-expandida/SPRINT-8-6-WELCOME-EXPANDIDA]] — Sprint 8.6 welcome expandida (4 steps "cómo funciona" + preview card "qué vas a recibir" + FAQ accordion 5 Q + box emergencia) + 3 páginas estáticas públicas: `/about` (Dr. Ferrero + IFN + compliance), `/privacidad` (política Ley 25.326/26.529 completa, 10 secciones), `/not-found` (404 custom). Footer compartido `<PublicFooter>` reusable. 22 routes prerendered. Status: closed-verified.
- [[sprints/sprint-8-7-polish-a11y/SPRINT-8-7-POLISH-A11Y]] — Sprint 8.7 polish + a11y baseline. shadcn Skeleton + FormSkeleton (reemplaza 13 `<p>Cargando datos...</p>`) + shadcn Dialog (reemplaza `window.confirm` ugly de "Empezar de nuevo") + Sonner Toaster montado en root layout (disponible para feedback futuro) + `@media prefers-reduced-motion` global (WCAG 2.1 SC 2.3.3 + 2.2.2). Status: closed-verified.
- [[sprints/sprint-13-e2e-playwright/SPRINT-13-E2E-PLAYWRIGHT]] — Sprint 13 tests E2E Playwright robustos del flow client-side. Setup @playwright/test + Chromium + webServer auto-launch + helpers reusables (`skipToEvalWithProfile`, `skipToResults`, `acceptConsent`, `fillProfile`). 6 spec files cubren happy path + ?debug=1, compliance Capa 1/3/4 (middleware + edad + SAFE-040 restrict/acknowledge), PHQ-9 ítem 9 LIVE detection, lab/genetics skip, results redirect + Reset Dialog, 404 custom. **19/19 tests passing en 37.9s.** Sub-DEBT: [[debt/DEBT-e2e-ci-integration]] (low priority, Sprint 14). Status: closed-verified.
- [[sprints/sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]] — Sprint 14 observabilidad mínima + CI E2E. `@sentry/nextjs@10.53.1` instalado **idle** (3 config files con DSN-gate, `withSentryConfig` wrap, tunnelRoute `/monitoring` — DSN vacío = SDK no envía eventos). `resend@6.12.3` wrapper **idle** (`lib/email/resend-client.ts` lazy + `send.ts` early-returns sin API key + template HTML placeholder, sin invocación todavía — listo para Sprint 9+). Job `e2e` en `ci.yml` con cache Chromium + artifact upload on failure + timeout 15 min. `.env.example` creado. Build local +83 KB First Load JS shared (Sentry SDK), 19/19 E2E sigue passing. **Cierra [[debt/DEBT-e2e-ci-integration]].** Status: closed-verified.
- [[sprints/sprint-9-sleep-form-fields-extension/SPRINT-9-SLEEP-FORM-FIELDS-EXTENSION]] — Sprint 9 extiende SleepForm de 7 a 13 campos (6 nuevos opcionales en Accordion colapsable "Más detalles"): EMA (frecuencia + minutos, cierra gap crítico de detección fenotipo en `classifyInsomniaPhenotype` que antes era siempre falso por hardcoded 0), cafeína (tazas/día + última hora), pantallas antes de dormir, preferencia de tratamiento. `buildSleepData()` ya no hardcodea defaults — propaga valores reales del state. Ejercicio postergado a sprint futuro sleep-hygiene dedicado. Decisión clínica asumida sin signoff explícito Pablo (mitigación: no se tocó lógica clinical-engine). 19/19 E2E sigue passing. **Cierra [[debt/DEBT-sleep-form-fields-faltantes]].** Status: closed-verified.
- [[sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]] — Sprint 15 arranca migración Conversor PSG legacy → modular. Bootstrap `@somnosalud/psg-parser` package (tsconfig + vitest + esbuild siguiendo patrón clinical-engine) + parser piloto **Philips Sleepware G3** (320 LOC TS estricto, regex idénticas al legacy líneas 316-636, shape `PSGRecord` 1:1) + 4 fixtures sintéticos + 15 tests vitest passing en 8 ms (paciente + estudio + arquitectura + estadificación + hipnograma + IAH/RDI + SpO2/ODI/T90 + posición + missing fields + edge cases). Helpers compartidos en `utils.ts`: `parseSpanishDate`, `parseHour`, `titleCase`, `num`, `normalizeWhitespace`. Cero deps pesadas added. Cero regresión clinical-engine (55/55). **Abre [[debt/DEBT-conversor-psg-migration-roadmap]]** (Sprints 16-19 pendientes: 6 parsers restantes + Engine Hipóxico + frontend Vite+React). Legacy `legacy-v0/index.html` coexiste hasta paridad confirmada Sprint 19. Status: closed-verified.
- [[sprints/sprint-16-3-parsers-diagnosticos/SPRINT-16-3-PARSERS-DIAGNOSTICOS]] — Sprint 16 migra 3 parsers diagnósticos restantes + auto-detect + router. `parseBrainWavePSG()` (330 LOC, AM/PM + fecha DD-MM-YYYY + SpO2 <88/<92), `parsePhilipsNightOne()` (115 LOC, poligrafía sin EEG), `parseResMedDiagnostico()` (135 LOC, Cheyne-Stokes + pulso + duración h:mm). `src/detect.ts` cubre 7 formatos (4 implementados + 3 lanzan `UnsupportedFormatError`). `src/router.ts` con `parseByFormat()` + clases de error. Types extendido con `cheyne_stokes_porc`, `fc_*_lpm`, `apneas_*_indice_por_hora`, `spo2_menor_88/92_*`. **65/65 tests passing en 563 ms** (Sprint 15: 15 → +50 nuevos). **3 bugs latentes del legacy detectados y resueltos** (regex greedy NightOne paciente, regex Supino requiere `\n|$` que normalizeWhitespace rompe, charclass BrainWave sin coma). Cero regresión. **Progreso migración Conversor PSG: 4/7 parsers (57%) + detect + router.** Status: closed-verified.
- [[sprints/sprint-2-b-supabase-schema/SPRINT-2-B-SUPABASE-SCHEMA]] — Sprint 2.B bootstrap Supabase project + schema inicial. Project `somnosalud-platform` Org Pampa Labs, sa-east-1, plan Free. **5 migraciones aplicadas vía MCP**: 0001 profiles (extension auth.users + trigger handle_new_user SECURITY DEFINER), 0002 evaluations (JSON cols por cuestionario + enum status), 0003 audit_log append-only, 0004 RLS policies (6 policies TO authenticated), 0005 harden_definer_functions. **0 lints seguridad** post-aplicación. MCP `supabase-somnosalud` operativo. Status: closed-verified.
- [[sprints/sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]] — Sprint 9.A cliente Supabase + magic link. `@supabase/ssr@0.10.3` + `supabase-js@2.106.0`. Helpers `lib/supabase/{client,server,middleware}.ts`. Routes `/login` (LoginForm + Server Action signInWithOtp), `/auth/callback` (Route Handler con open-redirect validation). Middleware combina refresh Supabase + compliance gate. Keys formato 2025+ (sb_publishable + sb_secret). 24/24 static pages build verde. Status: closed-verified.
- [[sprints/sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]] — Sprint 9.B UX upgrade /login: `BrandLogo` reusable (Moon icon + wordmark), Dr. Pablo Ferrero + IFN footnote, spinner + email validation inline + success card con icon Mail. Verificación DB end-to-end con cuenta real Fabio: `auth.users` + `public.profiles` populated vía trigger `handle_new_user` (Sprint 2.B H5 confirmada empíricamente). Status: closed-verified.
- [[sprints/sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]] — Sprint 9.C write-through DB + `/mis-resultados` + PublicHeader + auth gate. 4 Server Actions en `app/eval/actions.ts` (upsert + markCompleted + getMyEvaluations + migrateLocal). `usePersistEval` REWRITE dual-mode: debounce 800ms write-through DB si sesión, sessionStorage si anónimo. `/mis-resultados` Server Component con redirect auth. PublicHeader con auth slot (email + logout). Middleware extendido auth gate `/mis-resultados`. **19/19 E2E passing** cero regresión flow anónimo. Status: closed-verified.
- [[sprints/sprint-17-parsers-tratamiento/SPRINT-17-PARSERS-TRATAMIENTO]] — Sprint 17 cierra los 3 parsers tratamiento restantes. `parseResMedTratamiento` (130 LOC AirSense CPAP + rango fechas), `parseBMCTratamiento` (100 LOC fecha YYYY/MM/DD invertida + AHI/AI/HI/OAI/CAI), `parseBMCPoligrafo` (45 LOC caso especial datos en imágenes + warning explícito). Router activa los 3 (saca de UnsupportedFormatError). PSGRecord extendido 8 campos CPAP. **89/89 tests passing** (Sprint 16: 65 + 24 nuevos). **3 bugs greedy regex resueltos**. **Conversor PSG: 7/7 parsers (100%)**. Status: closed-verified.
- [[sprints/sprint-9-d-auth-gate-eval/SPRINT-9-D-AUTH-GATE-EVAL]] — Sprint 9.D hard auth gate `/eval/*` + E2E con test users reales. Cierra gap compliance: anónimo podía completar evaluación sin identificarse (violación Ley 25.326 + 26.529). Middleware bloquea `/eval/*` sin sesión → `/login?next=`. Welcome async detecta sesión para rutear CTA. E2E helper refactor: `createTestUser()` + `setSupabaseSessionCookies()` via admin API + `globalTeardown.ts` cleanup automático. **20/20 E2E passing en 2.4 min** con auth real (no mockean). Status: closed-verified.
- [[sprints/sprint-9-e-consent-persist-db/SPRINT-9-E-CONSENT-PERSIST-DB]] — Sprint 9.E consent en 3 capas (cookie + DB profile + audit_log). `lib/consent/version.ts` con `CONSENT_TERMS_VERSION='v1'` SSOT. `app/consent/actions.ts` con `acceptConsent()` Server Action idempotente (preserva timestamp original — relevante legal). TermsForm invoca fire-and-forget post-cookie. Cumple Ley 26.529 + Decreto 1089/2012 defense-in-depth. **Cierra [[debt/DEBT-consent-persist-db]].** Status: closed-verified.
- [[sprints/sprint-18-engine-hipoxico/SPRINT-18-ENGINE-HIPOXICO]] — Sprint 18 Engine Hipóxico Azarbarzin 2019. `computeHypoxicScore(record: PSGRecord)` migrado 1:1 desde legacy líneas 1648-1737 a `psg-parser/src/engine/hypoxic.ts` (~230 LOC TS estricto). 6 componentes (carga + ciclicidad + profundidad + mod basal/temporal/clínico). 4 categorías (leve/moderada/alta/crítica). DOI/PMID Azarbarzin 2019 (10.1093/eurheartj/ehy624 + PMID 30376054, Eur Heart J 2019;40(14):1149-1157) agregado a `clinical-engine/src/references.ts` como `REF_HYPOXIC_AZARBARZIN_2019` SSOT. Decisión arquitectónica: engine vive en psg-parser (consume PSGRecord). Limitaciones documentadas: sin señal cruda SpO2, max real ~76. **104/104 psg-parser + 55/55 clinical-engine = 159/159 monorepo**. Status: closed-verified.
- [[sprints/sprint-19-frontend-vite-conversor-psg/SPRINT-19-FRONTEND-VITE-CONVERSOR-PSG]] — Sprint 19 frontend Vite+React MVP del Conversor PSG. Bootstrap `webapp-conversor-psg` con Vite 5 + React 18 + TS estricto + pdfjs-dist@4 + jszip. Workspace dep `@somnosalud/psg-parser` consumida directo. `src/lib/` (schema 224 cols + csv builder + filename builder + pdf.js wrapper) + `src/hooks/usePsgFiles.ts` orquesta pipeline (extractText → detectFormat → parseByFormat → computeHypoxicScore) + `src/components/` (Dropzone con drag&drop + keyboard a11y + FileList + FileRow con Download CSV). **16 tests vitest passing**, Vite build verde 3.5 MB. **Total monorepo: 175 vitest tests** (clinical 55 + psg-parser 104 + conversor 16). **Progreso Conversor PSG: 89% (8/9 items)** — quedan Sprint 19.B (UI tabs Engine Hipóxico + ZIP, ~3h) + 19.C (archivar legacy ~30min). Status: closed-verified.

Cada sprint vive en `sprints/sprint-NN-<slug>/SPRINT-NN-<SLUG>.md`. Convención de naming: ASCII-safe lowercase con guiones-medios (regla #12 CLAUDE.md).

---

## 🏛️ Architecture Decision Records (ADRs)

Cada ADR documenta **una decisión arquitectural** del proyecto con contexto, alternativas, consecuencias. Son inmutables — si algo cambia, se crea ADR nueva con `supersedes: ADR-NNN`.

- [[architecture/adr/README|ADRs index]] — listado canónico + template + cuándo escribir uno.
- [[architecture/adr/ADR-001-stack-frontend-webapp-somnosalud|ADR-001]] — Stack frontend webapp-somnosalud (Next 14 + App Router + Tailwind 3 + RSC).
- [[architecture/adr/ADR-002-workspace-dependency-clinical-engine|ADR-002]] — Workspace dependency strategy para `somnosalud-clinical-engine`.
- [[architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]] — Compliance gates en código (disclaimer + consent + edad + safety).

## 📐 Concepts (guías vivas)

Convenciones operativas día a día y patrones reutilizables. Distinto a ADRs — son guías que pueden actualizarse sin superseding.

- [[concepts/README|Concepts index]].
- [[concepts/CONVENCIONES-FRONTEND-WEBAPP|Convenciones frontend webapp-somnosalud]] — RSC vs client, naming, paths, accesibilidad mínima, cómo agregar pantalla nueva.

## 📚 Reference (snapshots frozen-in-time)

Stack inventories, snapshots de versiones, glosarios. Versionados con fecha en suffix.

- [[reference/README|Reference index]].
- [[reference/STACK-INVENTORY-2026-05-08|Stack inventory 2026-05-08]] — versiones reales instaladas post-Sprint 5.

---

## 💰 DEBTs (technical debt)

> Vacío al inicio del proyecto. Cada DEBT detectado durante un sprint se agrega siguiendo [[processes/TEMPLATE-DEBT]]. NO usar GitHub Issues — el Vault es SSOT.

---

## 🚨 Hotfixes

Hotfixes urgentes detectados post-cierre de sprint que requieren fix inmediato. Cada hotfix documenta detección + diagnóstico triangulado + fix + verificación empírica.

- [[hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]] — gradient SomnoSalud ausente del body por Tailwind JIT no generando utility custom referenciada solo desde `@apply` en CSS. Fix: CSS directo en lugar de `@apply` para reglas globales. Lección: [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]].

---

## 🔍 Audits

> Vacío al inicio. Auditoría Fase A trimestral según [[processes/AUDITORIA-METODOLOGIA]] (~próxima 2026-08-07 o post major release).

---

## 📅 Sessions

> Notes de sesiones de trabajo. Cada sesión mayor (>2 horas o decisión arquitectural significativa) se documenta en `sessions/YYYY-MM-DD-<slug>.md`.

---

## 🌐 Cross-references al Vault Pampa Labs

Algunos contextos están en el Vault de Pampa Labs (`~/Pampa-Labs-Core/docs/vault/`) y NO se duplican acá por SSOT discipline:

- **Audit filesystem cleanup 2026-05-07** que motivó este setup OS: `~/Pampa-Labs-Core/docs/vault/audits/2026-05-07-vault-filesystem-cleanup/`
- **CLAUDE.md de Pampa Labs core** (referencia para reglas universales y patrón mental): `~/Pampa-Labs-Core/CLAUDE.md`
- **Análisis exhaustivo SomnoSalud** versión original: `~/Pampa-Labs-Core/docs/vault/clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md` (copia local en este Vault: [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]])

---

*Última actualización: 2026-05-07 noche (setup Pampa Labs OS)*
