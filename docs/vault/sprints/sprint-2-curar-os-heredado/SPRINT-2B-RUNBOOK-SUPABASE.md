---
title: "Sprint 2.B — Runbook crear project Supabase + setear MCP supabase-somnosalud"
date: 2026-05-08
last_synced_with_vault_reality: 2026-05-08
tags: [sprint, sprint-2b, supabase, mcp, runbook, fase-0, somnosalud, ownership-fabio]
status: pending-fabio
related:
  - "[[SPRINT-2-CURAR-OS-HEREDADO]]"
  - "[[../../MASTER-PLAN]]"
  - "[[../../../../CLAUDE]]"
  - "[[../../../../.mcp.json]]"
owner: fabio
participants: [fabio]
created: 2026-05-08
---

# Sprint 2.B — Runbook Supabase project + MCP

> Sprint complementario al [[SPRINT-2-CURAR-OS-HEREDADO]]. Se separó por **ownership**: requiere credenciales del Org Pampa Labs (acceso al dashboard supabase.com como admin del Org) que solo Fabio tiene. Cowork preparó el runbook listo, Fabio ejecuta cuando le convenga.

## Objetivo

1. Crear project Supabase llamado `somnosalud-platform` en el Org Pampa Labs (plan FREE inicial, scale a Pro Fase 1 si justificable).
2. Setear el MCP `supabase-somnosalud` activo en `.mcp.json` con el `project ref` real.
3. Verificar que Cowork puede consultar el project vía MCP (prueba: listar tablas, debería estar vacío).

## Pre-requisitos

- [ ] Cuenta Supabase con acceso admin al Org Pampa Labs (login en supabase.com).
- [ ] Token de acceso del Org (Settings → Access Tokens). Necesario para el MCP.
- [ ] Estar en cwd `~/Projects/Somnosalud` (o donde tengas el repo clonado).
- [ ] Sprint 2.A cerrado y pusheado a `origin/main` (ya hecho — ver commits `2fb6030` → `ef879f1`).

## Paso 1 — Crear project en supabase.com (UI)

1. Login en https://supabase.com/dashboard como admin del Org Pampa Labs.
2. Click **New Project**.
3. Configurar:
   - **Organization:** Pampa Labs.
   - **Name:** `somnosalud-platform`.
   - **Database Password:** generar password fuerte (>20 chars, alphanumérico). **Guardar en password manager** — Supabase no lo muestra otra vez. Una copia en `clients/ifn/secrets-2026-05/somnosalud-supabase-db-password.txt` (gitignored, regla #10 del CLAUDE.md).
   - **Region:** `South America (São Paulo)` — más cercano a AR, latencia <50ms desde Buenos Aires.
   - **Pricing Plan:** Free.
4. Click **Create new project**. Esperar 2-5 min hasta status `Active`.

## Paso 2 — Capturar valores del project

Una vez creado, ir a **Project Settings → API** y copiar:

| Campo | Valor | Dónde se usa |
|---|---|---|
| Project URL | `https://<ref>.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` (Vercel + local `.env.local`) |
| Project Reference ID | `<ref>` (ej: `abcdefghijklmnop`) | `.mcp.json` line agregar |
| `anon` `public` key | `eyJhbGc...` JWT largo | `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel + local) |
| `service_role` `secret` key | `eyJhbGc...` JWT largo | `SUPABASE_SERVICE_ROLE_KEY` (Vercel **production solo**, NUNCA expose al client) |

**Guardar las 4 en password manager + en `clients/ifn/secrets-2026-05/somnosalud-supabase-keys.txt` (gitignored).**

## Paso 3 — Crear access token del Org (para MCP)

1. Ir a https://supabase.com/dashboard/account/tokens.
2. Click **Generate new token**.
3. **Name:** `MCP-somnosalud-cowork-fabio`.
4. **Scope:** seleccionar el Org Pampa Labs (acceso a todos los projects del org).
5. Copy token (`sbp_...`). **Solo se muestra una vez.**
6. Guardar en `clients/ifn/secrets-2026-05/supabase-access-token-fabio.txt` (gitignored).

## Paso 4 — Setear variable de entorno local

Agregar al shell (`.zshrc` / `.bashrc`):

```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
```

Recargar:
```bash
source ~/.zshrc   # o ~/.bashrc según tu shell
echo "$SUPABASE_ACCESS_TOKEN"   # verificar que aparece (no vacío)
```

## Paso 5 — Actualizar `.mcp.json` con el project ref

El `.mcp.json` actual tiene el placeholder pendiente. Editar:

```json
"supabase-somnosalud": {
  "type": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@supabase/mcp-server-supabase@latest",
    "--project-ref=<REF_DEL_PROJECT>"
  ],
  "env": {
    "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
  }
}
```

Reemplazar `<REF_DEL_PROJECT>` con el `Project Reference ID` capturado en Paso 2.

Commit + push:
```bash
git add .mcp.json
git commit -m "chore(mcp): activar supabase-somnosalud con project ref real

Sprint 2.B: project somnosalud-platform creado en Org Pampa Labs
(plan FREE, region São Paulo). MCP supabase-somnosalud ahora apunta
al ref real con SUPABASE_ACCESS_TOKEN del Org via env var.

Cierra Fase 0.5 del MASTER-PLAN.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
```

## Paso 6 — Verificar MCP funciona desde Cowork

Reiniciar Claude Code (cerrar y abrir el repo nuevamente) para que cargue el nuevo `.mcp.json`. Después pedirle a Cowork:

> "Listá las tablas del project Supabase usando el MCP `supabase-somnosalud`."

Esperado: respuesta con 0 tablas (project recién creado, schema vacío). Si Cowork puede correr la query → MCP activo. Si error de permisos → revisar `SUPABASE_ACCESS_TOKEN` + scope del token.

## Paso 7 — Cierre del sprint 2.B

Una vez verificado el MCP funcionando:

- [ ] Actualizar `docs/vault/MASTER-PLAN.md` Sprint 2.B → `closed-verified` con commit hash.
- [ ] Actualizar `CLAUDE.md` raíz sección "MCP Servers configurados" — quitar "PENDIENTE crear project" en la entrada `supabase-somnosalud`.
- [ ] Crear session note `docs/vault/sessions/2026-05-XX-supabase-project-creado.md` con: timestamp, ref del project capturado, decisión de region São Paulo, evidencia de MCP funcionando (screenshot de query exitosa).

## Notas

### Por qué FREE tier inicial

Plan FREE Supabase incluye:
- 500 MB DB storage, 1 GB file storage, 2 GB egress/mes, 50k MAU.
- Pause automático tras 7 días sin actividad — relevante en Fase 0 cuando aún no hay tráfico.

Suficiente para Sprint 5-13 (schema initial + auth + persistencia evaluacion + tests E2E). Scale a Pro ($25/mes) cuando arranque tráfico real (Fase 1 launch público).

### Por qué region São Paulo

Latencia desde Buenos Aires:
- São Paulo: ~50ms (mejor opción regional).
- US East (N. Virginia): ~150ms.
- EU West: ~200ms.

Para una webapp clínica con 12 pasos de evaluación + persistencia parcial, la latencia importa. São Paulo es la región AWS más cercana servida por Supabase para el cono sur.

### Riesgo a mitigar

- **Password DB committeada por error:** usar siempre `clients/` (gitignored regla #10). Verificar `git status` antes de cada commit que la carpeta `clients/` no aparece.
- **Token Supabase expuesto:** `SUPABASE_ACCESS_TOKEN` SOLO en variables de entorno locales, nunca hardcoded en `.mcp.json`. El `${SUPABASE_ACCESS_TOKEN}` interpola desde env, no desde literal.
- **service_role_key expuesto al client:** **NUNCA** prefijar con `NEXT_PUBLIC_*`. Solo se usa server-side (Server Actions Next.js, API routes con runtime nodejs).

---

*Runbook preparado durante [[SPRINT-2-CURAR-OS-HEREDADO]] (2026-05-08) por Cowork. Ejecución pendiente Fabio cuando agende ventana.*
