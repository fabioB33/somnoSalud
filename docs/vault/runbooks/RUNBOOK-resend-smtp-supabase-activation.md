---
title: "Runbook — Activación Resend SMTP custom en Supabase (sacar rate limit magic link)"
date: 2026-06-19
last_synced_with_vault_reality: 2026-06-19
tags: [runbook, resend, smtp, supabase, magic-link, rate-limit, dns, fase-1]
status: active
related:
  - "[[../debt/DEBT-resend-smtp-supabase]]"
  - "[[../processes/DEPLOY-WORKFLOW]]"
  - "[[../sprints/sprint-3-vercel-preview/SPRINT-3-VERCEL-PREVIEW]]"
owner: fabio + cowork
---

# Runbook — Activación Resend SMTP custom en Supabase

> Destraba el rate limit de 4 emails/hora del SMTP default de Supabase (que rompe el
> login con magic link en vivo) + mejora deliverability con sender propio.
> Cierra [[../debt/DEBT-resend-smtp-supabase]].

---

## ⚠️ Hallazgo empírico 2026-06-19 (corrige premisa del DEBT)

El DEBT original asume el dominio `somnosalud.com.ar` como sender. **Verificación DNS empírica del 2026-06-19 confirmó que ese dominio NO está registrado:**

```
$ dig @8.8.8.8 somnosalud.com.ar    → status: NXDOMAIN (sin NS, sin A, sin SOA)
$ dig @8.8.8.8 A somnosalud.com      → 13.248.243.5 (registrado por TERCERO, no es nuestro)
$ dig @8.8.8.8 A ifn.com.ar          → 104.26.x.x / 172.67.x.x (Cloudflare, dominio cliente activo)
```

**Implicancia:** no se puede usar `noreply@somnosalud.com.ar` hasta registrar el dominio. Tres caminos alternativos para el sender (decisión Jorge + Pablo):

| Camino | Sender | Pre-requisito | Pro / Contra |
|---|---|---|---|
| Registrar `.com.ar` | `noreply@somnosalud.com.ar` | Comprar dominio (~$15-30/año NIC.ar/DonWeb) + DNS nuevo | Dominio futuro del producto, sender más pro. Más lento. |
| Subdominio IFN | `noreply@somnosalud.ifn.com.ar` | Webmaster IFN agrega records DNS (Cloudflare) | Cero registro. Depende de tercero (IFN). |
| Subdominio Pampa Labs | `noreply@somnosalud.pampalabs.com` | DNS Pampa Labs (ya verificado en otro proyecto) | Más rápido. Sender dice "pampalabs". |
| Resend onboarding | `onboarding@resend.dev` | Ninguno | Solo test interno — **solo manda al email dueño de la cuenta Resend**, va a Spam. NO sirve para demo con terceros. |

---

## 🔑 Dato crítico — DÓNDE está el rate limit que rompe el login

El magic link NO lo manda la app (`lib/email/send.ts`), lo manda **Supabase Auth**. Por eso:

- **Configurar `RESEND_API_KEY` en Vercel NO destraba el magic link.** Eso solo activa los emails de la app (welcome / resultados), que hoy ni se invocan.
- **Para destrabar el magic link hay que configurar el SMTP custom en el dashboard de Supabase Auth.** Es operación en dashboard, no código.

El wrapper de la app (`lib/email/resend-client.ts` + `send.ts`) ya está completo y correcto (lazy init, best-effort, no bloquea el flow). **No hay nada que codear** en este sprint — es 100% operación + DNS.

---

## Pasos (orden de ejecución)

### FASE 0 — Decisión de dominio (BLOQUEANTE)

- [ ] Jorge + Pablo deciden el sender (tabla arriba). Sin esto, FASE 2 no avanza.
- [ ] Si se elige registrar `somnosalud.com.ar`: registrar en NIC.ar / DonWeb / Cloudflare Registrar.

### FASE 1 — Cuenta Resend (no requiere DNS)

- [ ] Registrarse en [resend.com](https://resend.com) con email de Pampa Labs o Pablo. Plan **Free**: 3.000 emails/mes + 100/día (suficiente Fase 1).
- [ ] (Opcional, smoke inmediato) Generar una API key y mandarse un test a sí mismo desde `onboarding@resend.dev` para confirmar que la cuenta funciona.

### FASE 2 — Verificar dominio en Resend (requiere DNS del dominio elegido)

- [ ] Resend Dashboard → **Domains** → Add Domain → escribir el dominio/subdominio elegido.
- [ ] Resend genera 3 records. Agregarlos en el panel DNS del dominio:
  - `TXT` (SPF) — ej. `v=spf1 include:_spf.resend.com ~all`
  - `CNAME` x2 (DKIM) — valores que Resend muestra (ej. `resend._domainkey`)
  - `TXT` (DMARC, recomendado) — ej. `v=DMARC1; p=none;`
- [ ] Esperar propagación (típico 30 min, hasta 24h).
- [ ] Resend Dashboard → botón **Verify**. Esperar estado `Verified` (verde).

### FASE 3 — SMTP custom en Supabase (lo que destraba el magic link)

- [ ] Resend → Settings → **API Keys** → crear key (scope: Sending access). Copiarla.
- [ ] Supabase Dashboard → proyecto `goxdopciwvahrxdeirft` → **Authentication → SMTP Settings** → Enable Custom SMTP:
  - **Host:** `smtp.resend.com`
  - **Port:** `465`
  - **Username:** `resend`
  - **Password:** la API key de Resend
  - **Sender email:** el sender del dominio verificado (ej. `noreply@somnosalud.ifn.com.ar`)
  - **Sender name:** `SomnoSalud`
- [ ] Supabase → **Authentication → Rate Limits → Emails** → subir de `4/h` a `60/h` (o más).

### FASE 4 — Vercel env (activa emails de la app: welcome / resultados)

- [ ] Vercel → Project Settings → Environment Variables (Production + Preview):
  - `RESEND_API_KEY` = la misma API key
  - `RESEND_FROM_EMAIL` = el sender verificado (ej. `noreply@somnosalud.ifn.com.ar`)
- [ ] Redeploy para que tome las env vars.

### FASE 5 — Smoke test (criterio de cierre del DEBT)

- [ ] **Sender:** mandar magic link → email llega con `From: SomnoSalud <noreply@...>`.
- [ ] **Rate limit:** mandar 10 magic links a emails distintos en 5 min → todos llegan.
- [ ] **Deliverability:** verificar que NO va a Spam en Gmail / Outlook / iCloud (probar 1 de cada).
- [ ] **App emails:** (cuando Sprint 9.G esté en prod) confirmar welcome email sale por Resend.

Cierra [[../debt/DEBT-resend-smtp-supabase]] cuando los 4 puntos de FASE 5 pasen.

---

## Resumen de quién hace qué

| Tarea | Quién | Requiere |
|---|---|---|
| Decisión dominio sender | Jorge + Pablo | — |
| Registrar dominio (si aplica) | Fabio | tarjeta |
| Cuenta Resend + API key | Fabio | email |
| DNS records | Fabio (o webmaster IFN si es subdominio ifn.com.ar) | acceso DNS |
| SMTP en Supabase + rate limit | Fabio (o Cowork vía MCP `supabase-somnosalud` para leer estado) | dashboard |
| Vercel env vars | Fabio | dashboard Vercel |
| Smoke test | Fabio + Cowork | post-deploy |

> **Nota Cowork:** el MCP `supabase-somnosalud` puede leer el estado del proyecto pero la config de SMTP Auth + rate limits se setea desde el dashboard (no expuesta vía MCP API). Los clics de Resend/Supabase/Vercel los hace Fabio; Cowork prepara valores exactos + verifica smoke post-config.
