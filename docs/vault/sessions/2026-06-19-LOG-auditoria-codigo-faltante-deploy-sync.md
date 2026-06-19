---
title: "Session LOG 2026-06-19 — Auditoría '¿falta código?' + deploy sync mirror Vercel + Resend runbook"
date: 2026-06-19
type: session-log
status: closed
tags: [session, auditoria, deploy, vercel, mirror, resend, drift, fase-1, tier-2]
related:
  - "[[../MASTER-PLAN]]"
  - "[[../debt/DEBT-resend-smtp-supabase]]"
  - "[[../runbooks/RUNBOOK-resend-smtp-supabase-activation]]"
  - "[[../processes/DEPLOY-WORKFLOW]]"
owner: fabio + cowork
git_head_at_session: c494cab
---

# Session LOG 2026-06-19 — Auditoría código faltante + deploy sync + Resend prep

> Sesión con Fabio. Objetivo evolucionó: arrancó como "mostrar el proyecto al cliente"
> → "¿se subió a Vercel?" → "¿falta algo de código?". Cierre: deploy sincronizado +
> auditoría empírica confirmó que NO falta código + Resend dejado preparado (runbook).

---

## Contexto inicial

Fabio pidió analizar `products/somnosaludweb` y luego preguntó: (a) ¿qué falta de funcionalidades para mostrar al cliente?, (b) ¿se pudo subir al repo de Fabio para que Vercel se actualice?, (c) **lo central: ¿falta algo de código en el proyecto?**

---

## Trabajo realizado

### 1. Deploy sync — mirror Vercel estaba 18 commits atrasado 🔴→✅

Hallazgo empírico (verificado contra GitHub vía `git ls-remote`, no doc):

| Ref | Commit | Estado |
|---|---|---|
| `origin/main` (itsomnosalud, canónico) | `c494cab` (Sprint 14) | al día |
| clon local | `c494cab` | al día |
| **mirror `fabioB33/somnoSalud`** (lo que Vercel deploya) | `a5c6747` | **18 commits atrás** |

Producción servía una versión sin Sprints 9.G → 14 (email transaccional, Plan/Hoy, Diario+Gamificación, Backoffice multi-user, Premium waitlist, Mis resultados).

**Fix aplicado:** agregado remote `vercel` al clon (no existía) → `git fetch vercel` → verificación de seguridad `git merge-base --is-ancestor vercel/main main` = **true** (vercel/main era ancestro directo, cero divergencia, el mirror no tenía commits propios) → `git push vercel main` **fast-forward limpio sin `--force`**. Verificado post-push: mirror = `c494cab` = idéntico a origin.

**Pendiente Fabio (no ejecutable desde sandbox):**
- Dashboard Vercel: confirmar deploy `c494cab` salió `Ready` (18 commits con deps nuevas: Sentry +83 KB, Resend, framer-motion).
- Supabase Auth → Redirect URLs: confirmar que `https://somno-salud-webapp-somnosalud.vercel.app/auth/callback` sigue presente (sin esto magic link rompe).

### 2. Auditoría "¿falta código?" — veredicto: NO falta código ✅

Triangulación empírica (regla #8 EMPIRICAL-FIRST):

**E1 — 3 agentes paralelos** (Explore) auditando: webapp-somnosalud / clinical-engine+psg-parser / drift docs-vs-código. Los 3 coincidieron: cero stubs, cero funciones vacías, cero imports rotos, cero handlers vacíos.

**E2 — build + test reales** (post `pnpm install`):
- `pnpm test` monorepo → **227 tests passing** (55 clinical-engine + 104 psg-parser + 19 conversor + 49 webapp), 0 fallos.
- `pnpm typecheck` webapp → **0 errores TS**.
- `pnpm build` webapp → `✓ Compiled successfully`. Falló solo el prerender por falta de `.env` local.

**E3 — falsación del único "error"**: creado `.env.local` dummy (valores fake) → rebuild → `✓ Generating static pages (30/30)`. Confirma que el error era **env-only, NO código**. En Vercel las env vars sí están seteadas (por eso la app está live). `.env.local` dummy eliminado post-prueba.

**Únicos no-completos (ninguno bloqueante):**
- `shared-ui` → skeleton intencional (`build` = `echo 'skeleton — pendiente Fase 1'`). No se usa, las 2 webapps funcionan sin él.
- Sprint 20 (agente voz) → research sin código, correctamente marcado `research-pending-approval`.
- Resend + Sentry → `idle` esperando API key = **operación, no código faltante**. El build compila sin ellas.

### 3. Drift documental detectado y corregido

- **Sprints 10-14 (Tier 2 paridad)** estaban mergeados en main + tests verdes pero NO figuraban en MASTER-PLAN (que decía "última actualización 2026-06-02"). Agregados al roadmap con commits + rutas verificadas.
- **Drift de numeración:** "Sprint 13/14" de Tier 2 paridad (Premium waitlist / Mis resultados) colisionan con "Sprint 13/14" de Fase 1 original (E2E Playwright / Observabilidad). Documentado explícitamente en MASTER-PLAN.
- **Frontmatter Sprints 10-12** siguen en `code-pending-merge` pese a estar en main → drift de status, pendiente reconciliar a `closed-verified` (Bloque K).

### 4. Resend SMTP — preparado (no ejecutado, es operación)

Hallazgo empírico que corrige premisa del DEBT: **`somnosalud.com.ar` NO está registrado** (`dig @8.8.8.8` → NXDOMAIN). El `.com` es de un tercero; `ifn.com.ar` (cliente) sí existe en Cloudflare. El rate-limit que rompe el login es del **magic link de Supabase Auth, NO de la app** → se arregla con SMTP custom en dashboard Supabase, no con env en Vercel. El wrapper de la app (`lib/email/*`) ya está completo.

Entregables: [[../runbooks/RUNBOOK-resend-smtp-supabase-activation]] (FASES 0-5 + tabla quién-hace-qué) + DEBT actualizado con los 2 hallazgos.

---

## Decisiones / pendientes para Jorge + Pablo

1. **Dominio sender de emails** (bloqueante Resend): registrar `somnosalud.com.ar` vs subdominio `ifn.com.ar` vs `pampalabs.com`. Fabio dijo que Pablo tiene un dominio → confirmar cuál y configurarlo.
2. **Sprint 20 agente voz**: 7 decisiones pendientes signoff.

## Pendientes Cowork próxima sesión

- Reconciliar frontmatter Sprints 10-14 `code-pending-merge` → `closed-verified`.
- Commitear esta documentación (MASTER-PLAN + session log + runbook + DEBT) a `origin/main`.
- Resend: ejecutar runbook cuando Pablo defina dominio.

---

## Archivos tocados esta sesión

| Archivo | Acción |
|---|---|
| `docs/vault/MASTER-PLAN.md` | Sprints 10-14 + deploy sync + auditoría + footer + próximas acciones |
| `docs/vault/debt/DEBT-resend-smtp-supabase.md` | Hallazgo NXDOMAIN + magic-link-es-de-Supabase + link runbook |
| `docs/vault/runbooks/RUNBOOK-resend-smtp-supabase-activation.md` | NUEVO — runbook operativo completo |
| `docs/vault/sessions/2026-06-19-LOG-auditoria-codigo-faltante-deploy-sync.md` | NUEVO — este log |
| (git) remote `vercel` + `git push vercel main` | Mirror sincronizado a `c494cab` |
