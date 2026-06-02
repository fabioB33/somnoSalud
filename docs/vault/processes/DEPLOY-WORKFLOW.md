---
title: "Deploy Workflow — SomnoSalud (Vercel + GitHub Pages)"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [process, deploy, vercel, github-pages, somnosalud, schema-checkpoint, empirical-verification]
status: active
targets:
  - "Vercel — webapp-somnosalud (Next.js 14, App Router)"
  - "GitHub Pages — webapp-conversor-psg (Vite + React, 100% client-side)"
related:
  - "[[QA-CHECKLIST]]"
  - "[[SPRINT-CLOSURE-CHECKLIST]]"
  - "[[TEMPLATE-DEBT]]"
  - "[[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[AUDITORIA-METODOLOGIA]]"
  - "[[SUPERPOWERS-MULTI-AGENT-WORKFLOW]]"
  - "[[GSD-WORKFLOW]]"
---

# Deploy Workflow — SomnoSalud

> Reemplaza al DEPLOY-WORKFLOW heredado del Pampa Labs Core (que asumía VPS Docker `82.29.61.151`). SomnoSalud usa **Vercel** (webapp-somnosalud) + **GitHub Pages** (webapp-conversor-psg), sin VPS propio.
>
> El §C (Hotfix lifecycle + closed-verified pattern + triangulación 3 evidencias) se preserva tal cual del proceso original — es universal y aplica a cualquier deploy.
>
> Origen reescritura: [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]] (2026-05-08), cerrando [[../debt/DEBT-procesos-heredados-content-factory]].

## Targets de deploy

SomnoSalud tiene dos apps con flujos de deploy distintos:

| App | Target | Trigger | URL prod (post-Sprint 3-4) |
|---|---|---|---|
| `webapp-somnosalud` (Next.js 14) | **Vercel** | git push a `main` (auto) | `https://somnosalud.com.ar` (TBD Sprint 3) |
| `webapp-conversor-psg` (Vite + React) | **GitHub Pages** | git push a `main` (workflow) | `https://itsomnosalud.github.io/Somnosalud/conversor-psg/` (TBD Sprint 4) |

**Nota Fase 0 (2026-05-08):** ambos packages son skeleton hoy. Este workflow se aplica realmente cuando exista código en `webapp-somnosalud/src/app/` (Sprint 5+) y cuando se complete el refactor TS modular de `webapp-conversor-psg/` (Sprint 14+).

---

## §A — Pre-requisitos universales (cualquier deploy)

Antes de cualquier merge a `main` que vaya a deployarse:

- [ ] [[QA-CHECKLIST]] §A completo (clinical-engine 7 items + signoff Pablo si aplica) o §B (webapp) según el área tocada.
- [ ] Build local limpio (`pnpm build` → 5/5 successful).
- [ ] Tests verdes (`pnpm test` → 55/55 passing en clinical-engine + skeleton scripts noop OK).
- [ ] CI GitHub Actions verde en el último commit antes del deploy.
- [ ] Cambios commiteados a `main` siguiendo conventional commits (`feat:`, `fix:`, `clinical:`, `chore:`, `docs:`).
- [ ] Variables de entorno de producción seteadas (Vercel UI / GitHub Secrets), ver `CLAUDE.md` sección "Variables de entorno globales".

---

## §B — Deploy de `webapp-somnosalud` a Vercel

> Setup inicial documentado en Sprint 3 (Fase 0). Una vez configurado, los deploys son automáticos desde `main`.

### B.0 Doble remote git (formalizado 2026-05-26)

**Contexto:** Vercel Hobby plan (free) deploya repos personales de GitHub sin cargo extra; los repos de organizaciones (`itsomnosalud/Somnosalud`) requieren plan Pro o conexión vía GitHub App con permisos especiales. Para evitar costo + simplificar el setup, mantenemos **dos remotes** en el repo local:

| Remote | URL | Para qué |
|---|---|---|
| `origin` | `git@github.com:itsomnosalud/Somnosalud.git` | Repo canónico de la organización. Aquí ven Jorge / Pablo / cualquiera con acceso a la org. **Push principal de cada sprint.** |
| `vercel` | `git@github.com:fabioB33/somnoSalud.git` | Mirror personal de Fabio. **Sólo lo conoce Vercel** para auto-deploy. NO es source of truth. |

**Workflow operativo (sprint normal):**

```bash
# 1. Trabajar normalmente, pushear a origin (org)
git push origin main

# 2. Antes de querer ver el cambio en producción Vercel, mirror a vercel
git push vercel main
```

**Atajo opcional** — push a ambos en una línea (alias en `~/.gitconfig`):

```ini
[alias]
    pushall = !git push origin main && git push vercel main
```

**Reglas:**

- `origin` es **canónico**. PRs, issues, releases, code review viven ahí.
- `vercel` es **mirror**. NO se aceptan PRs ahí. Si alguien clona desde `fabioB33/somnoSalud`, dirigirlo al de la org.
- **Re-sync** si divergen: `git fetch vercel && git push vercel main --force-with-lease` (sólo Fabio, sólo con confirmación de Jorge).
- El MCP `github` sigue apuntando a `itsomnosalud/Somnosalud`.

### B.1 Setup inicial (Sprint 3, una sola vez)

1. **Conectar repo a Vercel** desde el dashboard de Fabio (cuenta personal `fabioB33`):
   - Import Project → `fabioB33/somnoSalud` (mirror del repo canónico — ver §B.0 arriba)
   - **Root Directory:** `packages/webapp-somnosalud`
   - **Framework Preset:** Next.js
   - **Build Command:** `pnpm --filter @somnosalud/webapp-somnosalud build` (Vercel auto-detecta turbo/pnpm cuando ve `pnpm-workspace.yaml`)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `pnpm install --frozen-lockfile` (root del monorepo)

2. **Variables de entorno** (Vercel → Project Settings → Environment Variables).
   **CRÍTICO:** nombres deben coincidir EXACTO con `.env.example` (formato keys Supabase 2025+):

   Required (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL` — `https://goxdopciwvahrxdeirft.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — formato `sb_publishable_*` (NO el viejo JWT anon)
   - `SUPABASE_SECRET_KEY` — formato `sb_secret_*` (NO el viejo `SERVICE_ROLE_KEY`)
   - `SUPABASE_PROJECT_REF` — `goxdopciwvahrxdeirft`

   NO setear en Vercel (solo local + MCP):
   - `SUPABASE_ACCESS_TOKEN` — uso exclusivo del MCP local de Cowork, NO la app

   Opcionales Fase 1+ (cuando se activen):
   - `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (cuando exista DNS verify)
   - `NEXT_PUBLIC_SENTRY_DSN` + `SENTRY_ORG` + `SENTRY_PROJECT` + `SENTRY_AUTH_TOKEN`
   - `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (Fase 1 analytics)

3. **Supabase Redirect URLs — CRÍTICO post primer deploy (Sprint 3):**
   - Tomar la URL preview generada por Vercel (ej. `https://somnosalud-xxx.vercel.app`).
   - Abrir [https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/auth/url-configuration](https://supabase.com/dashboard/project/goxdopciwvahrxdeirft/auth/url-configuration).
   - Sección **Redirect URLs** → Add: `https://<vercel-url>/auth/callback`.
   - **Sin esto el magic link rompe** — el click del email redirige a Supabase, que valida el `redirect_to` contra esta lista. Si la URL preview no está, el flow falla.
   - Si Vercel genera URLs por preview branch distintas, considerar usar el dominio production fijo o agregar wildcard si Supabase lo permite.

4. **Dominio custom** (sprint aparte, decisión Fabio/Pablo):
   - Si `somnosalud.com.ar` (recomendado): apuntar A record / CNAME a Vercel + verificar SSL.
   - Subdominio Pampa Labs alternativo: `somnosalud.pampalabs.com`.
   - **Al agregar dominio custom:** repetir paso 3 con la URL nueva.

5. **Branch protection** GitHub:
   - `main` requiere PR review + CI verde antes de merge.
   - Vercel preview se genera automáticamente para cada PR.

### B.2 Deploy operativo (cada cambio a main)

```bash
# Pre-merge (en branch o main local)
pnpm install --frozen-lockfile
pnpm --filter @somnosalud/webapp-somnosalud lint
pnpm --filter @somnosalud/webapp-somnosalud typecheck
pnpm --filter @somnosalud/webapp-somnosalud test
pnpm --filter @somnosalud/webapp-somnosalud build

# Push a main → Vercel auto-deploy
git push origin main
```

Vercel toma el commit, instala deps, corre el build, y deploya. **Sin acción manual adicional.**

### B.3 Smoke test post-deploy (obligatorio)

Esperar 2-5 minutos a que Vercel termine el deploy. Verificar:

- [ ] **Vercel dashboard:** deploy `Ready` (no `Error`, no `Building`).
- [ ] **Smoke browser:**
  - `https://somnosalud.com.ar/` → 200, página welcome renderiza.
  - `https://somnosalud.com.ar/disclaimer` → 200, disclaimer visible.
  - `https://somnosalud.com.ar/eval/profile` → 200 (o redirect a `/login` si auth requerida).
  - `https://somnosalud.com.ar/eval/results` → disclaimer médico + M.N. Pablo Ferrero 119.783 visible.
- [ ] **DevTools Console:** 0 errores JS en cada ruta.
- [ ] **DevTools Network:** 0 requests fallidos (no 404/500), HTTPS en todos los recursos.
- [ ] **Lighthouse:** Performance >70, Accessibility >85, Best Practices >85 (en `/eval/profile`).

### B.4 Rollback Vercel

Si algo falla en producción:

1. **Vercel dashboard** → Deployments → seleccionar último deploy estable → click `Promote to Production`. Rollback en <30s, sin re-build.
2. Documentar el bug en `docs/vault/incidents/INCIDENT-YYYY-MM-DD-<slug>.md` antes de reintentar deploy.
3. Crear DEBT en `docs/vault/debt/DEBT-<slug>.md` con root cause + plan de fix.

---

## §C — Deploy de `webapp-conversor-psg` a GitHub Pages

> Setup inicial documentado en Sprint 4 (Fase 0). Hoy el conversor sigue funcionando 100% en `legacy-v0/index.html`. El refactor TS modular es Fase 2.

### C.1 Setup inicial (Sprint 4, una sola vez)

1. **Crear workflow** `.github/workflows/deploy-conversor-psg.yml`:
   ```yaml
   name: Deploy Conversor PSG to GitHub Pages
   on:
     push:
       branches: [main]
       paths:
         - 'packages/webapp-conversor-psg/**'
         - 'packages/psg-parser/**'
         - 'packages/clinical-engine/**'
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v3
           with:
             version: 9
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'pnpm'
         - run: pnpm install --frozen-lockfile
         - run: pnpm --filter @somnosalud/webapp-conversor-psg build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: packages/webapp-conversor-psg/dist
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

2. **GitHub Settings → Pages:**
   - Source: `GitHub Actions`
   - Custom domain (opcional): TBD Pablo Sprint 4.

3. **Vite config** (`packages/webapp-conversor-psg/vite.config.ts`):
   ```ts
   export default defineConfig({
     base: process.env.NODE_ENV === 'production' ? '/Somnosalud/conversor-psg/' : '/',
     // ...
   });
   ```

### C.2 Deploy operativo (cada cambio a main)

```bash
# Pre-merge
pnpm --filter @somnosalud/webapp-conversor-psg build  # vite build, output a dist/
pnpm --filter @somnosalud/webapp-conversor-psg test   # parser regression contra fixtures

# Push a main → GitHub Actions ejecuta workflow → Pages se actualiza
git push origin main
```

GitHub Actions toma 2-4 minutos. Sin acción manual adicional.

### C.3 Smoke test post-deploy (obligatorio)

- [ ] **GitHub Actions tab:** workflow `Deploy Conversor PSG` con status verde.
- [ ] **GitHub Settings → Pages:** "Your site is live at https://itsomnosalud.github.io/Somnosalud/conversor-psg/".
- [ ] **Smoke browser:**
  - URL principal → 200, drag & drop área visible.
  - Subir un PDF fixture conocido (Philips Sleepware G3 anonimizado) → CSV generado correctamente.
  - Engine Hipóxico calcula score esperado para fixture canónico.
- [ ] **DevTools Console:** 0 errores. PDF.js worker carga desde CDN (cdnjs).
- [ ] **DevTools Network:** todos los recursos HTTPS, no mixed content.

### C.4 Rollback GitHub Pages

GitHub Pages no tiene "promote previous deployment" como Vercel. Rollback se hace por código:

```bash
git log --oneline -10                    # identificar último commit estable
git revert <HASH_BAD_COMMIT>             # crear commit que reversa el cambio
git push origin main                     # workflow re-deploya el estado anterior
```

Documentar bug + crear DEBT antes de reintentar.

---

## §D — Schema checkpoint Supabase (cuando aplique)

> **Aplicable desde Sprint 5 (Fase 1)** cuando exista schema Supabase. NO aplica a deploys frontend puros sin migration.

Heredado del proceso original — es universal y crítico cuando se hace migration o backfill.

**Aplicable si el deploy incluye:**
- Migration SQL nueva (`infrastructure/supabase/migrations/NNN-*.sql`).
- Script de backfill histórico ejecutado contra Supabase prod.
- Cualquier cambio que altere row counts esperados en tablas target.

**NO aplicable** si es solo deploy frontend / código sin cambio de schema. En ese caso §B.3 / §C.3 smoke test basta.

### D.1 Baseline pre-deploy

Capturar snapshot vía MCP `supabase-somnosalud`:

```sql
-- Ejemplo Sprint 7 (persistencia evaluacion):
SELECT 'evaluations' AS table_name, COUNT(*) AS rows_pre FROM evaluations
UNION ALL
SELECT 'eval_responses', COUNT(*) FROM eval_responses
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
```

Guardar output en sprint doc bajo `## CHECKPOINT-PRE-DEPLOY`.

### D.2 Expectativa declarada por el sprint runbook

El sprint doc debe declarar antes del deploy los valores esperados post-deploy:

```md
## Expectativa post-deploy (schema checkpoint)

- `evaluations` count: esperado ≥ <baseline + N nuevas registradas durante migration>.
- `eval_responses.consent_version` columna nueva con `NOT NULL DEFAULT 'v1'`.
- RLS policy `evaluations_owner_only` activa (verificar `pg_policies`).
- Audit log entry por cada migration aplicada en `audit_log` con `action = 'migration_applied'`.
```

### D.3 Verificación empírica post-deploy

Re-ejecutar query D.1 + comparar con expectativa D.2:

| Check | Pre | Post | Expected | Status |
|-------|-----|------|----------|--------|
| `evaluations` count | <N> | <M> | ≥ <N + delta> | ✅ |
| `eval_responses.consent_version` | NULL | 'v1' | NOT NULL | ✅ |
| RLS `evaluations_owner_only` | ausente | presente | presente | ✅ |

**Si cualquier check falla:** bloqueo automático del cierre. NO etiquetar `closed-verified` sobre dataset parcial.

### D.4 Triangulación 3 signals

- **Signal 1 (log literal):** output de la migration desde Supabase dashboard / CLI.
- **Signal 2 (query DB):** SQL del D.3 con output literal vía MCP.
- **Signal 3 (schema introspection):** `information_schema.columns` + `pg_indexes` + `pg_policies` para tabla target.

Los 3 signals DEBEN aparecer inline en el sprint doc bajo "Evidencia empírica final" antes de `closed-verified`.

---

## §E — Hotfix lifecycle + closed-verified pattern (UNIVERSAL)

> Patrón heredado del Pampa Labs Core, aplicable a cualquier deploy en cualquier stack. Preservado tal cual del proceso original. Define cuándo un DEBT realmente se cierra.

Un DEBT no se marca como `closed-verified` hasta que haya **evidencia empírica post-deploy**. Status progression:

1. **`open`** — DEBT detectado, sin trabajo aún.
2. **`fix-in-progress`** — código committed pero aún no deployado (o deploy en curso).
3. **`ready-for-deploy`** — push OK + runbook escrito, esperando ventana de deploy.
4. **`closed-verified`** — deploy aplicado + **mínimo 3 de estas evidencias** acumuladas:
   - **Boot log / build log** verifica las señales esperadas (Vercel deploy `Ready`, GH Actions verde, Supabase migration applied).
   - **Smoke test empírico** con output concreto del `curl` o response browser (status code + body relevante).
   - **Query MCP** (`supabase-somnosalud` cuando exista) sobre tabla target confirma state esperado.
   - **Dashboard externo** muestra el evento (ej: Sentry Issue nuevo con tags correctos, Vercel analytics, PostHog event received, Resend delivery confirmed).

Si solo hay 1-2 evidencias, el DEBT **se mantiene en `ready-for-deploy`** hasta acumular la 3ra. Nunca saltar directo a `closed-verified` sin evidencia triangulada.

### Regla importante: nunca cerrar en el mismo commit que deploya

El commit que introduce el fix sube a `ready-for-deploy`. El commit que cierra el DEBT a `closed-verified` **ocurre después** con las evidencias recolectadas. Esto fuerza que el deploy real ocurra antes del cierre documental y evita "closed-on-paper" sin verificación.

Ejemplos del patrón aplicado en otros proyectos (Pampa Labs Core, ver Vault correspondiente):
- Hash `1a0d410` fix → hash `0387c48` close DEBT (post-verify, separación temporal).
- Hash `e2caee9` fix RLS → hash `b68584f` close DEBT (post dual curl).

Aplicar igual en SomnoSalud cuando empiecen los deploys reales (Sprint 3+).

---

## §F — Frecuencia y ventanas de deploy

- **Sprint cleanup / docs (sin código de prod):** deploy continuo, cada commit a `main`.
- **Sprints `clinical-engine`:** deploy con signoff Pablo + smoke test ampliado. Idealmente lunes-miércoles para tener bandwidth si rollback.
- **Sprints `webapp-somnosalud`:** deploy continuo via Vercel preview en PR + production deploy al merge.
- **Hotfixes:** deploy inmediato tras QA reducido (build + smoke test módulo afectado). Sin esperar ventana.
- **Release de features grandes (multi-sprint):** ventana definida (horario bajo tráfico AR, ej: 23h-02h ART).

---

## §G — Cuándo NO deployar

- ❌ CI GitHub Actions rojo en el último commit.
- ❌ Test suite con tests skipped silenciosamente (verificar `pnpm test` reporta `0 skipped`).
- ❌ Cambio en `clinical-engine/scoring/` o `safety/` o `engine/recommendations.ts` o `engine/risk-integrator.ts` o `references.ts` **sin signoff Pablo Ferrero documentado** (quote textual + screenshot WhatsApp + archivado en `docs/vault/clinical/scoring-validation/`).
- ❌ Migration con `verification_query` que devuelve `bug-present` (ver [[VERIFICATION-QUERY-SCHEMA]]).
- ❌ DEBT de prioridad CRITICAL abierto que afecta el área deployada.
- ❌ Vacaciones / fin de semana sin on-call disponible (Pablo + Cowork + Fabio backup).

---

## Cross-links

- [[QA-CHECKLIST]] — checklist técnico pre-merge (§A clinical-engine, §B webapp, §C conversor-psg).
- [[SPRINT-CLOSURE-CHECKLIST]] — FASE 4 obligatoria + Bloque K filesystem housekeeping post-merge.
- [[TEMPLATE-DEBT]] — template para crear DEBTs cuando se detecta gap durante deploy.
- [[AUDITORIA-METODOLOGIA]] — regla #11 sync pass post-auditoría + regla #12 empirical verification triangulada.
- [[VERIFICATION-QUERY-SCHEMA]] — schema para queries de verificación de DEBTs.
- [[../clinical/COMPLIANCE-ARGENTINA]] — checklist Pre-launch público + plan de respuesta a brechas.
- [[../../../.claude/agents/compliance-anmat]] — invocar antes de deploy que toque flow consent/disclaimer/safety.

## Referencia histórica

El DEPLOY-WORKFLOW anterior (heredado commit `6f8f6c9`) asumía VPS Docker `82.29.61.151` con `docker compose -f products/content-factory-web/docker-compose.yml`. Los 4 sprints del 2026-04-18/19 referenciados (meta-rate-limiter-buc-aware, rls-brand-integrations, meta-app-secret-rotation, sentry-dsn-prod, observability-pattern-1) eran de Pampa Labs Core, no SomnoSalud. La reescritura completa fue trabajo de [[../sprints/sprint-2-curar-os-heredado/SPRINT-2-CURAR-OS-HEREDADO]].

El §E (Hotfix lifecycle + closed-verified pattern) se preservó tal cual porque es un patrón universal aplicable independiente del stack.

---

*Última actualización: 2026-05-08 — reescrito durante Sprint 2.A para SomnoSalud (Vercel + GH Pages, sin VPS).*
