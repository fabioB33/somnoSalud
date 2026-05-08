---
title: "QA Checklist — pre-deploy"
date: 2026-04-19
last_synced_with_vault_reality: 2026-04-19
tags: [process, qa, deploy, quality]
status: active
run: "antes de cada deploy a producción"
---

# QA Checklist — pre-deploy

Dos checklists según el tipo de deploy:

- **§A — Hotfix backend (7 items core):** deploys de `products/content-factory/` (API, crones, services, migrations). Reducido empíricamente a partir de los 5 sprints hotfix del 2026-04-18/19. Es el mínimo no-negociable.
- **§B — Release frontend (checklist extendido):** deploys de `products/content-factory-web/` (Playbook UI, landing, brand library). Incluye smoke visual + responsive + auth flow.

Si algún ítem falla → **NO deployar**, arreglar primero.

---

## §A — Hotfix backend (7 items CORE)

Preamble: este checklist reemplaza el anterior estilo "60 items" para deploys backend. Son los 7 items que **REALMENTE se ejecutaron en los 5 sprints hotfix del 2026-04-18/19** (meta-rate-limiter-buc-aware, rls-brand-integrations, meta-app-secret-rotation, sentry-dsn-prod, observability-pattern-1) y cuya ausencia causó incidents reales en el pasado. Criterio: si algún item falla, NO shippear.

1. **TypeScript strict** — `npm run typecheck` → EXIT 0. Zero `any`, zero `@ts-ignore` introducidos.
2. **Build limpio** — `npm run build` → EXIT 0. `dist/` regenerado.
3. **Tests pasan** — `npm test` → EXIT 0 en todas las suites (0 skipped, 0 fails, 0 todos). Si la feature agrega lógica nueva crítica, **tests nuevos obligatorios** (mínimo 1 happy path + 1 error path).
4. **Smoke test endpoint crítico** — al menos un `curl` (o request equivalente) al feature modificado con respuesta esperada. Para crones: query MCP sobre tabla target confirmando state esperado. Para RLS: dual curl (anon + publishable) verificando lockout.
5. **Boot signals post-deploy** — `docker compose logs --tail=100` muestra los 3-5 logs clave del boot: `[sentry] initialized`, `loadPersistedStates`, `crons scheduled: N registered`, container `running` status, ausencia de `ERROR` en tail.
6. **Git state clean** — `git status` solo cambios del sprint, sin basura. Ruido de `.obsidian/*` (graph.json / workspace.json) puede ignorarse — no commitear en commits de código.
7. **Vault actualizado al momento** — DEBT status actualizado (open → fix-in-progress → closed-verified solo con evidencia empírica per §C del DEPLOY-WORKFLOW), sprint doc con fase marcada, MOC si aplica, commit atómico con mensaje descriptivo.

Los 4 CRITICAL cerrados 2026-04-18/19 siguieron este checklist literal. Ver evidencia en:
- [[../sprints/sprint-meta-rate-limiter-buc-aware/SPRINT-META-RATE-LIMITER-BUC-AWARE]]
- [[../sprints/sprint-rls-brand-integrations-hotfix/SPRINT-RLS-BRAND-INTEGRATIONS-HOTFIX]]
- [[../sprints/sprint-meta-app-secret-rotation/SPRINT-META-APP-SECRET-ROTATION]]
- [[../sprints/sprint-sentry-dsn-prod-complete/SPRINT-SENTRY-DSN-PROD-COMPLETE]]
- [[../sprints/sprint-observability-pattern-1-complete/SPRINT-OBSERVABILITY-PATTERN-1-COMPLETE]]

---

## §B — Release frontend (checklist extendido)

> Checklist original pre-2026-04-19. Aplica a releases de `products/content-factory-web/` (Playbook UI). Requiere más coverage visual + responsive + auth flow por la naturaleza del frontend. Los items marcados explícitamente son post-launch-opcional cuando la release es pequeña (ej. fix de copy).

### 1. Build local

- [ ] `cd products/content-factory-web && npm run build` → `✓ built` sin errores
- [ ] 0 warnings de TypeScript (`tsc -b` embebido en build)
- [ ] Tamaño del bundle `index-*.js` no creció > 10% vs último deploy

### 2. Módulos cargando

Levantar `npm run dev` y verificar que cada ruta principal renderiza sin errores en consola:

- [ ] `/landing-v2` — PublicLanding con cinematic scroll funcional (frames cargan)
- [ ] `/login` — form de login
- [ ] `/playbook` — PlaybookDashboard con métricas above-the-fold
- [ ] `/playbook/creatives` — pipeline de creativos
- [ ] `/playbook/campaigns` — lista de campañas
- [ ] `/playbook/optimizer` — auto-optimizer
- [ ] `/playbook/ab-tests` — A/B tests
- [ ] `/playbook/settings` — settings
- [ ] `/playbook/ai-marketer` — Luna
- [ ] `/brand-library` — Brand Library
- [ ] `/chat` — Chat
- [ ] `/video-studio` — Video Studio

### 3. Light mode

- [ ] Si el `ThemeToggle` está activo: toggleear y verificar que **no hay texto ilegible** en ninguna ruta principal
- [ ] Si light mode sigue roto: confirmar que `ThemeToggle` **no está importado** en ningún consumer

### 4. Responsive

Probar en DevTools resoluciones:
- [ ] 375 × 667 (iPhone SE) — nav hamburger, sin scroll horizontal, CTAs accesibles
- [ ] 768 × 1024 (iPad) — layouts de grilla 2-col, sidebar collapsible
- [ ] 1440 × 900 (desktop) — layout completo, max-width respetado

### 5. Animaciones

- [ ] Cinematic scroll en landing pública: frames avanzan al scrollear, sin jank
- [ ] GSAP entrance animations: secciones aparecen con fade+slide
- [ ] Hover states en botones / cards: transiciones suaves
- [ ] Dropdowns de PlaybookNav: abren y cierran con animación

### 6. Rutas sin 404

- [ ] Todos los links del sidebar → navegan sin error
- [ ] Todos los links de PlaybookNav (incluyendo dropdowns children) → navegan sin error
- [ ] Links del footer de PublicLanding → navegan a rutas existentes
- [ ] Deep links directo (tipeando URL) → renderizan correctamente

### 7. Auth flow

- [ ] Usuario no logueado → `/playbook` redirige a `/login`
- [ ] Login exitoso → redirige a `/playbook`
- [ ] Logout → redirige a `/login`

#### §B.7.4 — OAuth Google flow (Sprint 73.A — DEBT-supabase-auth-lock-deadlock-google-oauth)

- [ ] Click "Continuar con Google" en `/login` → redirige a `accounts.google.com/o/oauth2/v2/auth?...` en menos de 1 s, sin freeze del renderer.
- [ ] Callback Google → redirige a `/auth/callback` → llega a `/setup` o `/playbook` según estado de onboarding.
- [ ] Logout → `/login` → click "Continuar con Google" nuevamente → redirige sin warning de gotrue-js `Lock not released within 5000ms` en console.
- [ ] DevTools Console en `/login` (hard reload) → 0 mensajes con pattern `gotrue-js: Lock` y 0 errors en console.
- [ ] DevTools Network → entry a `accounts.google.com/o/oauth2/v2/auth` con status 302 capturada al click.

### 8. Consola del browser

- [ ] 0 errores en DevTools Console en cada ruta principal
- [ ] 0 warnings de React (keys, hooks, etc.)
- [ ] 0 requests fallidos en Network tab (evitar 404/500 en assets o API)

### 9. Git hygiene

- [ ] Commit message descriptivo (`fix:`, `feat:`, `sprint-NN:` prefix)
- [ ] `git status` limpio antes del push
- [ ] Nada de `.env` o secrets en el diff

### 10. Docker build (si aplica a esta release)

- [ ] `docker compose -f products/content-factory-web/docker-compose.yml build --no-cache` completa sin errores
- [ ] Imagen resultante arranca: `docker compose up -d` + health check OK

---

Si algún punto falla: **NO deployar**. Arreglar + volver al punto 1.

## Cross-links

- [[DEPLOY-WORKFLOW]] — pasos de deploy después del QA OK.
- [[../MASTER-PLAN#Track D — Procesos|Master Plan Track D]]
- [[../PAMPALABS-CONTEXT-SKILL]] — fuente única de contexto.
