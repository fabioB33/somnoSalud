---
title: "MASTER-PLAN — SomnoSalud roadmap operativo"
date: 2026-05-07
last_synced_with_vault_reality: 2026-05-07
tags: [master-plan, roadmap, somnosalud, planning, pampalabs-context]
status: active
related:
  - "[[index]]"
  - "[[../../CLAUDE]]"
  - "[[vision/PRODUCT-VISION-SOMNOSALUD]]"
  - "[[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]]"
owner: jorge + pablo-ferrero + cowork
created: 2026-05-07
---

# MASTER-PLAN — SomnoSalud Roadmap Operativo

> Roadmap consolidado de las 3 fases del producto. Cada fase tiene sprints específicos numerados que se documentan en `sprints/sprint-NN-<slug>/`.
>
> Detalle clínico y técnico exhaustivo en [[clinical/somnosalud/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07]].

---

## 📊 Estado actual (2026-05-08 mañana)

- ✅ **Fase 0.1 — Bootstrap monorepo** completado (pnpm workspaces + 5 packages + 25 source files importados + 55/55 tests passing)
- ✅ **Fase 0.2 — Migración remote** a `itsomnosalud/Somnosalud` Private (force-push exitoso, 73 objects)
- ✅ **Fase 0.3 — Setup Pampa Labs OS** (CLAUDE.md + Vault structure + 12 procesos + 6 LLs + 46 agents + .mcp.json + .gitignore extendido)
- ✅ **Fase 0.4 — Sprint 1 closed-verified (2026-05-08):** commit `pnpm-lock.yaml` ya estaba (`6f8f6c9`) + CI verde local triangulado + cleanup OS heredado (package-lock huérfano borrado, SETUP.sh archivado, análisis exhaustivo SSOT resuelto, 4 packages skeleton habilitados con turbo). Detalle: [[sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]].
- ✅ **Fase 0.5 — Sprint 2.A closed-verified (2026-05-08):** curado de 46 agents heredados → 26 activos (25 mantenidos + 1 propio `compliance-anmat` AR/ANMAT) + 22 archivados con README. QA-CHECKLIST y DEPLOY-WORKFLOW reescritos para SomnoSalud (Vercel + GH Pages, sin VPS Docker). SCC Bloque F adaptado, TEMPLATE-DEBT con ejemplos reales SomnoSalud, 5 LLs con disclaimer cross-product. CLAUDE.md "Skills obligatorias" reescrita con lista curada en 10 categorías. Detalle: [[sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]. Cierra DEBT-curar-agents-pampalabs-os y DEBT-procesos-heredados-content-factory.
- ⏳ **Fase 0.6 — Sprint 2.B pending Fabio:** crear project Supabase `somnosalud-platform` en Org Pampa Labs (plan FREE, region São Paulo) + setear MCP `supabase-somnosalud` con project ref real. Runbook listo en [[sprints/sprint-2-curar-os-heredado/SPRINT-2B-RUNBOOK-SUPABASE]]. Ownership: Fabio (requiere credenciales Org Pampa Labs).
- ✅ **Fase 1 arrancada — Sprint 5 closed-verified (2026-05-08):** scaffold completo de `webapp-somnosalud` con Next.js 14 + Tailwind 3.4 + shadcn/ui (Button + Card) + tsconfig extend + workspace dep `somnosalud-clinical-engine` validado empíricamente (`scoreISI` ejecutándose en build-time) + welcome page con paleta SomnoSalud + footer compliance (M.N. Pablo Ferrero 119.783). `pnpm dev` arranca en 2s, `pnpm build` genera prerendered estático. CI cross-monorepo verde (5-6/N tasks successful, clinical-engine 55/55). Decisión equipo Fabio: saltar Sprints 2.B + 3 ya que webapp puede correr 100% client-side hasta S9+. Detalle: [[sprints/sprint-5-scaffold-webapp-somnosalud/SPRINT-5-SCAFFOLD-WEBAPP-SOMNOSALUD]].
- ✅ **Sprint 5.5 closed-verified (2026-05-08):** documentación completa del Sprint 5 en el Vault. 9 archivos nuevos: 3 ADRs (stack frontend Next 14 + workspace deps clinical-engine + compliance gates 6 capas) + 1 convenciones frontend (10 secciones operativas) + 1 stack inventory snapshot 2026-05-08 + 3 README de dirs nuevas (architecture/adr, concepts, reference) + 1 sprint doc. Plus 2 updates: overview.md con Mermaid actualizado + sequence diagram Fase 1 + webapp-somnosalud/README.md rewrite. Detalle: [[sprints/sprint-5-5-documentacion-vault/SPRINT-5-5-DOCUMENTACION-VAULT]].
- ✅ **Sprint 6 closed-verified (2026-05-08):** capas 1-3 de [[architecture/adr/ADR-003-compliance-gates-en-codigo|ADR-003]] implementadas en código. Capa 1 middleware (verificada empíricamente con curl: 307 sin cookie, 200 con cookie). Capa 2 `app/eval/layout.tsx` con DisclaimerBanner. Capa 3 verificación edad <18 con UTC handling. 4 pantallas P0 funcionales (/disclaimer, /terms, /eval/profile, /eval/menor-no-permitido). 4 componentes shadcn nuevos (Checkbox, Input, Label, Alert). Estado client-side via sessionStorage (`usePersistEval`) + cookie consent (`useConsent`). Welcome con CTA habilitado. 17 archivos nuevos en webapp-somnosalud, ~1.500 LOC. Detalle: [[sprints/sprint-6-compliance-gates/SPRINT-6-COMPLIANCE-GATES]].
- 🔧 **HOTFIX 2026-05-09 (commit 07f6851):** gradient SomnoSalud no se aplicaba al body porque Tailwind JIT no genera utilities custom referenciadas solo via `@apply` en CSS. Fix: CSS directo en `globals.css`. Detalle: [[hotfixes/HOTFIX-2026-05-09-tailwind-apply-utility-no-generado]] + lección [[lessons-learned/LL-2026-05-09-tailwind-apply-no-genera-utilities-no-usadas]].
- ✅ **Sprint 7.A closed-verified (2026-05-09):** Capa 4 ADR-003 implementada (`/eval/safety` con `evaluateAllSafetyRules` + `/eval/derivacion-especialista` para block hard + Alert warning para restrict). Componente genérico `<QuestionnaireForm>` reutilizable extendido para soportar items con `options` propios (ISI-like) + escala global (ESS-like). 3 cuestionarios funcionales: `/eval/isi` (7×5niveles, Bastien 2001), `/eval/ess` (8×4niveles, Johns 1991), `/eval/stopbang` (5 manual + 3 auto desde profile, Chung 2008). 14 archivos nuevos en webapp + 1 sprint doc, ~1.450 LOC. CI verde + 12 routes detectadas. Smoke E2E con curl: 11/11 HTTP 200, middleware bloquea correctamente. Detalle: [[sprints/sprint-7-a-cuestionarios-safety/SPRINT-7-A-CUESTIONARIOS-SAFETY]].
- ✅ **Sprint 7.B closed-verified (2026-05-09):** PHQ-9 (con detección live ítem 9 + `<CrisisHotlineCard>` reusable variant default/reinforced, Decisión E3) + GAD-7 + DASS-21 (21 items intercalados sin agrupar por subscale para no romper validación clínica) + sleep diary form custom (7 campos heterogéneos) + lab opcional (7 parámetros con 3 paths skip) + genetics opcional (5 variantes con sentinel "no lo sé") + placeholder `/eval/results`. **18 routes detectadas en build** (flow completo de evaluación funcional, salvo Capa 5 results). 14 archivos nuevos en webapp + 1 sprint doc, ~1.500 LOC. CI verde + smoke E2E todas las rutas HTTP correcto. Detalle: [[sprints/sprint-7-b-mental-health-sleep-lab-genetics/SPRINT-7-B-MENTAL-HEALTH-SLEEP-LAB-GENETICS]].
- ✅ **Sprint 8 closed-verified (2026-05-09):** `/eval/results` Capa 5 ADR-003 implementada. `lib/results-builder.ts` función pura (testeable, server-side ready) que invoca todos los `score*` + `classifyInsomniaPhenotype` + `assessRisk` + `generateRecommendations` (respeta safety rules: blockedRecommendations excluidos) + `calculatePrecision` + `analyzeLabPanel` + `analyzeGeneticProfile`. `<DisclaimerBanner variant="reinforced">` arriba/abajo + M.N. + footer IFN. Accordion con 6 secciones colapsables. Export PDF via `window.print()` + CSS `@media print` completo (fondo blanco, texto negro, URLs visibles, break-inside-avoid). Botón reset limpia sessionStorage. Panel debug con `?debug=1` (JSON raw para Pablo). PHQ-9 ítem 9 ≥ 1 dispara CrisisHotlineCard reinforced arriba. Risk severe muestra Alert prominente "consultar especialista urgente". Detalle: [[sprints/sprint-8-results-capa-5/SPRINT-8-RESULTS-CAPA-5]] + sub-DEBT [[debt/DEBT-sleep-form-fields-faltantes]] (5 campos no capturados, signoff Pablo Sprint 9).
- 🎉 **FASE 1 CLIENT-SIDE CERRADA (2026-05-09):** flow completo de evaluación funcional 100% en sessionStorage, sin Supabase. 13 pantallas reales + 7 capas de compliance + 19 routes prerendered + Middleware. Listo para smoke visual humano + signoff clínico Pablo antes de pasar a persistencia.
- ✅ **Sprint 8.5 closed-verified (2026-05-09):** UX polish del `<QuestionnaireForm>` post-feedback "es un bodrio contestar". Pills horizontales (grid auto-fit responsive) + number badge con tick lucide Check cuando answered + sticky progress bar interno al form + smooth scroll automático al siguiente item al responder (300ms delay) + highlight ring-2 cuando pill checked + DASS-21 con separators "Parte 1/2/3 de 3" cada 7 ítems sin mencionar subscale. CI verde + smoke E2E 17/17 rutas HTTP 200. Bug detectado y resuelto: `/eval/dass21` HTTP 500 en dev runtime por webpack cache stale → fix `rm -rf .next`. Detalle: [[sprints/sprint-8-5-ux-cuestionario/SPRINT-8-5-UX-CUESTIONARIO]].
- ✅ **Sprint 8.6 closed-verified (2026-05-09):** Welcome expandida + 3 páginas estáticas públicas + footer compartido. `app/page.tsx` rewrite con header nav, hero, "Cómo funciona" (4 steps numerados), "Qué vas a recibir" (preview card mock ISI 14/28 Evidencia A), 2 cards orientativo/respaldo, FAQ Accordion (5 Q: gratis/privacidad/reemplaza-médico/cuánto-tarda/qué-hago-resultados) + box emergencia 0800-999-0091. `/about` con M.N. Dr. Ferrero + IFN + 3 cards "cómo se construyó" + compliance regulatorio. `/privacidad` política completa Ley 25.326+26.529+1089/2012 en 10 secciones + resumen "30s". `/not-found` 404 custom con Moon icon. `<PublicFooter>` reusable. 22 routes prerendered + Middleware. Smoke E2E 6/6 rutas correctas (incluyendo HTTP 404 custom). Detalle: [[sprints/sprint-8-6-welcome-expandida/SPRINT-8-6-WELCOME-EXPANDIDA]].

- ✅ **Sprint 8.7 closed-verified (2026-05-09):** Polish UX + a11y baseline. shadcn Skeleton + FormSkeleton compuesto → reemplazo de 13 `<p>Cargando datos...</p>` repetidos en /eval/* forms. shadcn Dialog + Sonner Toaster instalados; `window.confirm` ugly de "Empezar de nuevo" reemplazado por Dialog elegante con destructive variant. `<Toaster />` montado en root layout disponible para feedback futuro (Sprint 9+ acciones). Bloque `@media (prefers-reduced-motion: reduce)` en globals.css respeta WCAG 2.1 SC 2.3.3 + 2.2.2 — desactiva animaciones/transiciones/smooth-scroll. role="status" + aria-label en placeholders. Lighthouse audit deferred para smoke humano. CI verde + smoke E2E 7/7 rutas correctas. Detalle: [[sprints/sprint-8-7-polish-a11y/SPRINT-8-7-POLISH-A11Y]].

- ✅ **Sprint 13 closed-verified (2026-05-09):** **19/19 tests E2E Playwright passing en 37.9s.** Setup `@playwright/test` + Chromium headless + `playwright.config.ts` con webServer auto-launch. Helpers reusables: `skipToEvalWithProfile`, `skipToResults`, `acceptConsent`, `fillProfile`. 6 specs: happy path + `?debug=1` (3), Capa 1+3+4 (7), PHQ-9 ítem 9 detection LIVE + reverse (2), Lab/Genetics skip (2), Results redirect + Reset Dialog confirmar/cancelar (3), 404 custom + back (2). Bugs detectados y corregidos durante: SAFE-040 es restrict (no block), strict mode regex generico, shadcn radio sr-only requiere click en label. Sub-DEBT abierto: [[debt/DEBT-e2e-ci-integration]] (CI workflow para Sprint 14, low priority). Detalle: [[sprints/sprint-13-e2e-playwright/SPRINT-13-E2E-PLAYWRIGHT]].

- ✅ **Sprint 14 closed-verified (2026-05-14):** Observabilidad + CI Playwright. **Sentry idle** instalado (`@sentry/nextjs@10.53.1` + 3 config files client/server/edge con DSN-gate, `withSentryConfig` wrap en `next.config.mjs`, tunnelRoute `/monitoring`) — sin DSN no envía eventos. **Resend wrapper idle** (`resend@6.12.3` + `lib/email/resend-client.ts` lazy + `lib/email/send.ts` con `sendResultsEmail` que early-returns sin API key + template HTML placeholder `results-summary.ts`) — no se invoca todavía, listo para Sprint 9+. **CI E2E:** job `e2e` añadido a `.github/workflows/ci.yml` con cache Chromium `~/.cache/ms-playwright`, `playwright install-deps chromium` separado para cache-hit, build webapp + `pnpm test:e2e` con `CI=true`, upload artifacts on failure (playwright-report + test-results, retention 14d), timeout 15 min. `.env.example` creado con Sentry + Resend + Supabase vars vacías. Smoke local pre-push: build verde (22 routes, +83 KB First Load JS shared por Sentry SDK) + 19/19 E2E passing en 1.3 min. **Cierra DEBT-e2e-ci-integration.** CI verde primer push: pendiente verificación Fabio. Detalle: [[sprints/sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]].

- ✅ **Sprint 9 closed-verified (2026-05-14):** SleepForm extension cierra cobertura clínica al 100%. Shape `EvalState['sleep']` extendido de 7 a 13 campos (6 nuevos opcionales): `earlyAwakeningFreq` + `earlyAwakeningMin` (cierra gap crítico de detección EMA en `classifyInsomniaPhenotype` — antes hardcodeado a 0 lo que hacía el threshold `>=30` siempre falso), `caffeineCupsDay` + `caffeineLastHour`, `screenBeforeBed`, `treatmentPreference`. UI: sección Accordion "Más detalles (opcional)" con 4 fieldsets agrupados — paciente que no expande sigue avanzando como antes (backwards compat). `buildSleepData()` en results-builder.ts ya no hardcodea defaults — lee del state con fallbacks `?? 'never'` / `?? 0` solo si el paciente skipped. **Cierra DEBT-sleep-form-fields-faltantes.** Ejercicio postergado a sprint futuro sleep-hygiene dedicado. Decisión clínica asumida sin signoff explícito Pablo (mitigación: no se cambió lógica clinical-engine, solo input — validación visual pendiente próxima reunión IFN). 19/19 E2E sigue passing post-cambios. Detalle: [[sprints/sprint-9-sleep-form-fields-extension/SPRINT-9-SLEEP-FORM-FIELDS-EXTENSION]].

- ✅ **Sprint 15 closed-verified (2026-05-14):** Bootstrap `@somnosalud/psg-parser` package + parser piloto **Philips Sleepware G3** migrado 1:1 desde `legacy-v0/index.html` (líneas 316-636, ~320 LOC TS estricto). Setup: tsconfig + vitest + esbuild siguiendo mismo patrón que clinical-engine. Estructura: `src/types.ts` (PSGRecord ancho ~100 campos enumerados + index signature dinámico para los ~80 generados), `src/utils.ts` (helpers `parseSpanishDate` + `parseHour` + `titleCase` + `num` + `normalizeWhitespace` migrados 1:1), `src/parsers/philips-sleepware-g3.ts`, `src/index.ts` barrel. Tests: 4 fixtures sintéticos (completo / mínimo / decimal / no-determinado) + 15 tests vitest (3 describes) cubriendo paciente + estudio + arquitectura + estadificación + hipnograma + IAH/RDI + SpO2/ODI/T90 + posición + missing fields + edge cases. **15/15 tests passing en 8 ms.** Cero deps pesadas added, cero regresión clinical-engine (55/55 sigue verde). Bug detectado y resuelto: TS estricto reveló que index signature `string | number | undefined` no asignable directo a campo `number?` — fix con typeof guard. **Abre DEBT-conversor-psg-migration-roadmap** con scope Sprints 16-19 (BrainWave + Philips NightOne + ResMed Diag → Sprint 16; ResMed Trat + BMC Trat + BMC Poli → Sprint 17; Engine Hipóxico Azarbarzin 2019 → Sprint 18; Frontend Vite+React → Sprint 19). Legacy coexiste hasta paridad confirmada. Detalle: [[sprints/sprint-15-psg-parser-bootstrap/SPRINT-15-PSG-PARSER-BOOTSTRAP]].

- ✅ **Sprint 16 closed-verified (2026-05-14):** 3 parsers diagnósticos restantes + auto-detect + router. **65/65 tests passing en 563 ms** (Sprint 15: 15 → Sprint 16: +50 = 14 BrainWave + 9 NightOne + 13 ResMed Diag + 14 detect-router). Parsers nuevos: `parseBrainWavePSG()` (~330 LOC, formato similar a Sleepware G3 con AM/PM + fecha DD-MM-YYYY + SpO2 <88/<92), `parsePhilipsNightOne()` (~115 LOC, poligrafía sin EEG, subset reducido del PSGRecord), `parseResMedDiagnostico()` (~135 LOC, Cheyne-Stokes + pulso + duración h:mm convertida a min). `src/detect.ts` con `detectFormat()` cubre 7 formatos (4 implementados + 3 tiran `UnsupportedFormatError`). `src/router.ts` con `parseByFormat()` + clases de error `UnknownFormatError` / `UnsupportedFormatError`. Types extendido con `cheyne_stokes_porc`, `fc_*_lpm`, `apneas_*_indice_por_hora`, `spo2_menor_88_*` (8), `spo2_menor_92_*` (8). **3 bugs latentes del legacy detectados y resueltos** (regex greedy NightOne paciente, regex Supino NightOne con `\n|$` que `normalizeWhitespace` rompe, charclass BrainWave paciente sin coma — fixes mejoran sin romper compat). Cero regresión cross-package. **Progreso migración Conversor PSG: 4/7 parsers (57%) + detect + router.** Detalle: [[sprints/sprint-16-3-parsers-diagnosticos/SPRINT-16-3-PARSERS-DIAGNOSTICOS]].

- ✅ **Sprint 2.B closed-verified (2026-05-18):** Bootstrap Supabase project `somnosalud-platform` (Org Pampa Labs, region sa-east-1 São Paulo, plan Free) + schema inicial. **5 migraciones SQL aplicadas vía MCP** `supabase-somnosalud`: 0001 `profiles` (extension auth.users + compliance fields + trigger `handle_new_user` SECURITY DEFINER), 0002 `evaluations` (1 row por intento + JSON cols por cuestionario + enum status), 0003 `audit_log` append-only Ley 25.326, 0004 `rls_policies` (6 policies todas `TO authenticated`, ninguna expuesta a `anon`), 0005 `harden_definer_functions` (hardening post-advisors: search_path='' + REVOKE EXECUTE en handle_new_user). **0 lints de seguridad** post-aplicación. MCP supabase-somnosalud operativo + `.env.local` con 5 vars Supabase. Detalle: [[sprints/sprint-2-b-supabase-schema/SPRINT-2-B-SUPABASE-SCHEMA]].

- ✅ **Sprint 9.A closed-verified (2026-05-18):** Cliente Supabase + magic link auth + middleware combinado. `@supabase/ssr@0.10.3` + `@supabase/supabase-js@2.106.0`. `lib/supabase/{client,server,middleware}.ts` siguiendo patrón oficial (no inyectar lógica entre createServerClient + getUser). Routes nuevas: `/login` (Server Component + LoginForm Client + Server Action `signInWithOtp`), `/auth/callback` (Route Handler con validación open-redirect del `?next=`). Middleware combina refresh Supabase + compliance gate cookie. `.env.example` actualizado con 5 vars Supabase (formato keys 2025+: `sb_publishable_*` browser + `sb_secret_*` server only). 24/24 static pages build verde. Detalle: [[sprints/sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]].

- ✅ **Sprint 9.B-login-ux closed-verified (2026-05-23):** UX upgrade /login post smoke real magic link. `components/brand/BrandLogo.tsx` reusable (Moon icon + wordmark "SomnoSalud", sizes sm/md/lg). Login page rediseñada con BrandLogo header + card footnote Dr. Pablo Ferrero (M.N. 119.783) + IFN. LoginForm upgrade: spinner Loader2 + "Enviando link…" en pending, email validation inline con regex + warning ámbar onBlur, submit disabled cuando email inválido, success card con CheckCircle2 + email confirmado + helper "Revisá Spam" + "Usar otro email" reload. **Verificación DB end-to-end con cuenta real Fabio (`cgc.fboschetti@gmail.com`):** auth.users + public.profiles populated correctamente vía trigger handle_new_user (Sprint 2.B H5 ✅ confirmada). Detalle: [[sprints/sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX]].

- ✅ **Sprint 9.C-persist-eval closed-verified (2026-05-23):** Write-through DB para evaluations + /mis-resultados + auth gate + PublicHeader. 4 Server Actions (`app/eval/actions.ts`): `upsertEvaluationFromState`, `markEvaluationCompleted` (con audit_log entry + revalidatePath), `getMyEvaluations` (RLS filtra automático), `migrateLocalStateToDb`. `signOut()` Server Action. `usePersistEval` REWRITE dual-mode: debounce 800ms write-through DB si hay sesión, sessionStorage si anónimo. `latestStateRef` evita stale closures del debounce. `/mis-resultados` Server Component lista evaluations con scores ISI/ESS/STOP-BANG/PHQ-9, redirect `/login?next=/mis-resultados` si !auth. `PublicHeader` Server Component con auth slot (email + Mis resultados + Cerrar sesión). Middleware extendido: auth gate `/mis-resultados`. **19/19 E2E Playwright passing post-cambios** (cero regresión flow anónimo). Detalle: [[sprints/sprint-9-c-persist-eval/SPRINT-9-C-PERSIST-EVAL]].

- ✅ **Sprint 17 closed-verified (2026-05-24):** 3 parsers tratamiento + 7/7 parsers PSG completos. `parseResMedTratamiento` (~130 LOC, AirSense CPAP titulación con rango fechas + uso promedio + presión + fuga), `parseBMCTratamiento` (~100 LOC, fecha YYYY/MM/DD invertida + AHI/AI/HI/OAI/CAI), `parseBMCPoligrafo` (~45 LOC, caso especial datos en imágenes + warning explícito en missing[]). Router activa los 3 formatos (saca de `UnsupportedFormatError`). PSGRecord extendido con 8 campos CPAP (`cpap_*` + `estudio_fecha_fin`). **89/89 tests passing en 615 ms** (Sprint 16: 65 + Sprint 17: +24). **3 bugs greedy regex detectados y resueltos** durante: ResMed Trat paciente, ResMed Trat dispositivo `AirSense \d+ \w+`, BMC Trat/Poli paciente. **Conversor PSG migración: 7/7 parsers (100%)**, queda solo Sprint 18-19. Detalle: [[sprints/sprint-17-parsers-tratamiento/SPRINT-17-PARSERS-TRATAMIENTO]].

- ✅ **Sprint 9.D-auth-gate-eval closed-verified (2026-05-26):** Hard auth gate en `/eval/*` + E2E helper con test users reales. Cierra gap compliance detectado por Fabio: anónimo podía completar evaluación sin identificarse (violación Ley 25.326 + 26.529). Middleware: `/eval` agregado a `AUTH_PROTECTED_PREFIXES` con excepción `/eval/menor-no-permitido` (terminal post-rechazo edad). Welcome page async: CTA "Empezar evaluación" linkea `/login?next=/disclaimer` si anónimo. E2E helper refactor: `createTestUser()` + `setSupabaseSessionCookies()` via Supabase admin API. `globalTeardown.ts` borra users `e2e-*` automático post-suite. **20/20 E2E passing en 2.4 min** (19 originales + T2b auth+consent). Smoke HTTP: `/eval/profile` sin auth → 307 `/login?next=`. Detalle: [[sprints/sprint-9-d-auth-gate-eval/SPRINT-9-D-AUTH-GATE-EVAL]].

- ✅ **Sprint 9.E-consent-persist-db closed-verified (2026-05-26):** Consent en 3 capas (defense-in-depth Ley 26.529 + Decreto 1089/2012): cookie `somno_consent_v1` middleware + `profiles.consent_terms_accepted_at` + `audit_log` action `profile.consent_terms_accepted`. `lib/consent/version.ts` con `CONSENT_TERMS_VERSION='v1'` SSOT. `app/consent/actions.ts` con `acceptConsent()` Server Action idempotente (preserva timestamp original — relevante legal). `TermsForm` invoca fire-and-forget post-cookie. **Cierra DEBT-consent-persist-db.** **20/20 E2E sigue passing**, globalTeardown borró 16 test users automático. Detalle: [[sprints/sprint-9-e-consent-persist-db/SPRINT-9-E-CONSENT-PERSIST-DB]].

- ✅ **Sprint 18 closed-verified (2026-05-26):** Engine Hipóxico Azarbarzin 2019 + DOI/PMID centralizado + 15 tests. `computeHypoxicScore(record: PSGRecord)` migrado 1:1 desde legacy líneas 1648-1737 a `psg-parser/src/engine/hypoxic.ts` (~230 LOC TS estricto). 6 componentes (carga + ciclicidad + profundidad + mod basal/temporal/clínico), 4 categorías clínicas (leve/moderada/alta/crítica). `REF_HYPOXIC_AZARBARZIN_2019` agregado a `clinical-engine/src/references.ts` (DOI 10.1093/eurheartj/ehy624, PMID 30376054, Eur Heart J 2019;40(14):1149-1157, evidence A) — cross-package import respeta regla #13 NO-HARDCODED. Decisión arquitectónica documentada: engine vive en `psg-parser` (consume PSGRecord) NO `clinical-engine` (cuestionarios + safety). Limitaciones documentadas: sin señal cruda SpO2, max real ~76 (no 100). **104/104 tests psg-parser** + **55/55 clinical-engine** = **159/159 vitest tests monorepo**. Detalle: [[sprints/sprint-18-engine-hipoxico/SPRINT-18-ENGINE-HIPOXICO]].

- ✅ **Sprint 19 closed-verified (2026-05-26):** Frontend Vite+React Conversor PSG MVP. Bootstrap `webapp-conversor-psg` con Vite 5 + React 18 + TS estricto + pdfjs-dist@4 + jszip. Workspace dep `@somnosalud/psg-parser` consumida directo (cero duplicación de lógica). Estructura: `src/lib/` (schema 224 cols + csv builder + filename builder + pdf.js wrapper) + `src/hooks/usePsgFiles.ts` orquesta pipeline (extractText → detectFormat → parseByFormat → computeHypoxicScore) + `src/components/` (Dropzone con drag&drop + keyboard a11y, FileList, FileRow con Download CSV individual). **16 tests vitest** del CSV builder (escape comas/quotes/newlines + filename format + schema length). `pnpm build` Vite verde, `dist/` 3.5 MB (pdf.js worker bundled). **Total monorepo: 175 vitest tests passing** (clinical-engine 55 + psg-parser 104 + conversor-psg 16). Coexistencia con legacy-v0 mantenida. **Progreso Conversor PSG migración: 89% (8/9 items)** — quedan Sprint 19.B (ZIP + Engine UI tabs + Methodology, ~3h) + 19.C (archivar legacy, ~30min) para cierre formal DEBT. Detalle: [[sprints/sprint-19-frontend-vite-conversor-psg/SPRINT-19-FRONTEND-VITE-CONVERSOR-PSG]].

- ✅ **Sprint 19.B closed-verified (2026-05-26):** Features iterativas del Conversor PSG completadas. **ZIP multi-archivo** (`buildZip` con JSZip + BOM UTF-8 + filename `CSV_PSG_<timestamp>.zip`). **`<EnginePanel>`** React con 2 tabs: Resultados (score grande coloreado + 12 metric cards + 6 breakdown bars + perfil A/B/C badge + flag-list crit/warn + tabla detalle 11 filas) y Methodology (7 secciones explicando scoring Azarbarzin 2019 + DOI link). Integración en `App.tsx` (state engineFileId + zipBusy + handleDownloadAll + render condicional EnginePanel) + `<FileRow>` botón "Score Hipóxico" condicional. **19/19 tests vitest** (16 CSV + 3 ZIP nuevos). Vite build verde 4.11s, bundle main 668 kB (gzip 200 kB). **Total monorepo: 178 vitest tests**. **Progreso Conversor PSG: 95% (8.5/9)** — solo falta Sprint 19.C archivar legacy-v0 con confirmación Pablo. Detalle: [[sprints/sprint-19-b-engine-ui-zip/SPRINT-19-B-ENGINE-UI-ZIP]].

- ✅ **Sprint 19.C closed-verified (2026-05-26):** Archivado formal de `legacy-v0/index.html` (94 KB, 1.887 LOC) a `legacy-v0/_archived/` con `git mv` (historial preservado) + README archivado con instrucciones de recovery + smoke comparativo + tabla de migraciones Sprints 15-19.B. `package.json` description + README del package + 7 docstrings en `src/` actualizados al nuevo path. Verificación: typecheck verde + 19/19 vitest + Vite build 2.88s + cero refs stale al path viejo. **Cierra DEBT-conversor-psg-migration-roadmap (closed-verified 2026-05-26).** Migración 100% completada. Detalle: [[sprints/sprint-19-c-archivar-legacy/SPRINT-19-C-ARCHIVAR-LEGACY]].

**Próxima sesión sugerida:** Sprint 3 (deploy Vercel preview webapp-somnosalud, ~2h) para que Pablo y Jorge vean producción cuando se vean esta semana. Setup operativo de Fabio en Vercel + Supabase Redirect URLs documentado en [[processes/DEPLOY-WORKFLOW]] §B. Alternativa: Sprint 3.B (Conversor PSG a Vercel separado) o pausa total esperando smoke real de Pablo.

---

## Fase 0 — Setup repo + ship-it (Semana 1, 5-8 horas)

**Objetivo:** repo limpio con CI verde + ambos productos deployados con dominio profesional.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 0.1 | Bootstrap monorepo + first commit | ✅ closed-verified | 4h ejecutadas |
| 0.2 | Migración remote a itsomnosalud/Somnosalud | ✅ closed-verified | 0.5h |
| 0.3 | Setup Pampa Labs OS en este repo | ✅ closed-verified | 2h |
| 1 | Cleanup OS heredado + CI verde local triangulado | ✅ closed-verified | 1.5h ejecutadas (2026-05-08) |
| 2.A | Curar agents heredados + reescribir procesos heredados + adaptar SCC/TEMPLATE-DEBT | ✅ closed-verified | ~3h ejecutadas (2026-05-08) |
| 2.B | Crear project Supabase Org Pampa Labs + setear MCP `supabase-somnosalud` (ownership Fabio, requiere credenciales) | ⏳ pending Fabio | 1h |
| 3 | Deploy webapp-somnosalud preview a Vercel + dominio | ⏳ pending | 2h |
| 4 | Deploy webapp-conversor-psg a GitHub Pages | ⏳ pending | 1h |

**Criterio de cierre Fase 0:** ambos productos accesibles públicamente vía URL profesional + CI verde + project Supabase listo para arrancar persistencia.

---

## Fase 1 — Robustez clínica + persistencia (Semanas 2-5, 25-35 horas)

**Objetivo:** SomnoSalud webapp con auth + persistencia + compliance legal mínimo + tests clínicos completos.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| **5** | **Scaffold Next.js 14 webapp-somnosalud + Tailwind + shadcn/ui + workspace dep clinical-engine + welcome page** | ✅ closed-verified | ~2h ejecutadas (2026-05-08) |
| 6 | Pantallas P0 compliance gates: disclaimer + T&C + verificación edad <18 + profile (sin persistencia, sessionStorage) | ⏳ | 3-4h |
| 7 | Pantallas cuestionarios: ISI + STOP-BANG + PHQ-9 (con detección ítem 9) + GAD-7 + DASS-21 + sleep + lab + genetics, scoring real con clinical-engine | ⏳ | 5-6h |
| 8 | Pantalla resultados + recomendaciones + disclaimer obligatorio + MN visible + export PDF | ⏳ | 3-4h |
| 9 | (post Sprint 2.B) Schema inicial Supabase: users + evaluations + answers + RLS multi-tenant | ⏳ | 4h |
| 10 | Auth Supabase (email + magic link) + protected routes | ⏳ | 3h |
| 11 | Persistencia evaluación migrada de sessionStorage → Supabase (save partial progress + resume) | ⏳ | 4h |
| 12 | Responsive mobile-first audit + fixes | ⏳ | 4h |
| 13 | Tests unitarios cobertura 100% `clinical-engine/scoring/` (50+ tests adicionales) | ⏳ | 5h |
| 14 | Sentry + Resend setup (error tracking + welcome email) | ⏳ | 2h |
| 15 | E2E Playwright cobertura básica (happy path 12 steps + safety triggers) | ⏳ | 4h |

**Criterio de cierre Fase 1:** un paciente AR puede crear cuenta + completar evaluación + recibir resultados con compliance legal full + retomar evaluación si abandonó.

---

## Fase 2 — Conversor PSG modular + storage (Semanas 6-9, 25-35 horas)

**Objetivo:** Conversor PSG refactoreado a TypeScript modular + integración con webapp-somnosalud + storage Supabase encrypted.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 14 | Refactor HTML monolítico Conversor PSG a `psg-parser/` modular TypeScript | ⏳ | 6h |
| 15 | Tests con fixtures de PSGs reales anonimizados (7 equipos × 2-3 fixtures cada uno) | ⏳ | 5h |
| 16 | Engine Hipóxico expuesto como API reutilizable | ⏳ | 3h |
| 17 | Storage Supabase para PSGs subidos (encrypted at rest + signed URLs) | ⏳ | 4h |
| 18 | Integración SomnoSalud × Conversor (paciente sube PSG → auto-pobla datos clínicos) | ⏳ | 5h |
| 19 | UI/UX para upload PSG + preview parsed data + edit antes de save | ⏳ | 4h |

**Criterio de cierre Fase 2:** un paciente puede subir su PSG (cualquier de los 7 equipos) y los datos quedan integrados a su evaluación.

---

## Fase 3 — Producto B2B + escalado (Semanas 10-16, 40-60 horas)

**Objetivo:** Multi-tenant white-label para sleep specialists + freemium B2B + accesibilidad full + i18n.

| Sprint | Entregable | Estado | Horas est. |
|---|---|---|---|
| 20-22 | Multi-tenant: cada doctor tiene su instancia con branding propio (logo, colors, dominio custom) | ⏳ | 12h |
| 23-24 | OCR labs (auto-extracción de valores de análisis sangre desde PDFs lab) | ⏳ | 8h |
| 25-26 | Integración wearables Oura/Fitbit/Apple Watch (sleep tracking pasivo) | ⏳ | 10h |
| 27-28 | Stripe billing freemium + tiers FREE / PRO / CLINIC | ⏳ | 8h |
| 29 | PWA install + offline-first | ⏳ | 4h |
| 30-31 | i18n EN + PT (locales + clinical instruments translated by validated source) | ⏳ | 6h |
| 32-33 | Accesibilidad WCAG 2.1 AA completa (audit + fixes) | ⏳ | 8h |
| 34 | Compliance escalado: HIPAA Supabase Enterprise tier + GDPR compliance kit | ⏳ | 6h |

**Criterio de cierre Fase 3:** SomnoSalud es producto SaaS B2B vendible a sleep specialists internacionales con compliance USA + UE.

---

## Decisiones estratégicas pendientes

| Decisión | Quién decide | Cuándo |
|---|---|---|
| ¿Vault SomnoSalud se publica? (vault.somnosalud.com vs solo local) | Jorge + Pablo | Sprint 3 |
| ¿Dominio custom para webapp-somnosalud? (somnosalud.com.ar vs subdominio Pampa Labs) | Pablo | Sprint 3 |
| ¿Pricing B2B Fase 3? (FREE / PRO $X / CLINIC $Y) | Jorge + Pablo + market research | Sprint 27 |
| ¿Validación clínica externa con sleep specialists colegas? | Pablo | Pre-Fase 3 |
| ¿Open-source `clinical-engine`? (estrategia de adopción) | Jorge + Pablo | Pre-Fase 3 |

---

## Riesgos identificados

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Validación regulatoria ANMAT puede requerir clasificación dispositivo médico Clase II | 🟠 Alta | Sprint 5: consultar con experto regulatorio + documentar disclaimer fuerte. Probable Clase I (orientativo). |
| Pablo Ferrero limited bandwidth para signoff clínico cada cambio scoring | 🟡 Media | Async via WhatsApp + reuniones quincenales. Documentar quotes en sprint docs. |
| Costos Supabase escalan en Fase 1 (FREE → Pro $25/mes mínimo) | 🟢 Baja | Justificable contra retainer $2K/mes. |
| HIPAA Fase 3 requiere Supabase Enterprise tier ($$$) | 🟡 Media | Postergar Fase 3 USA hasta validar producto-mercado en AR/LATAM primero. |

---

*Última actualización: 2026-05-26 (Sprint 19.C cerrado — archivado legacy + cierre formal DEBT-conversor-psg-migration-roadmap. Migración Conversor PSG 100%)*
*Próxima revisión: post-Sprint 3 (Vercel preview deploy webapp-somnosalud)*
