---
title: "Deuda Técnica — Activar Resend SMTP custom en Supabase para sacar rate limit 4/h"
date: 2026-05-26
last_updated: 2026-06-02
tags: [deuda-tecnica, supabase, smtp, resend, magic-link, rate-limit, fase-1, open]
status: open
priority: high
scope: sprint-dedicated-post-domain-confirm
detected_during: sprint-14-observabilidad-ci
elevated_to_high_during: sprint-3-vercel-preview
related:
  - "[[../sprints/sprint-14-observabilidad-ci/SPRINT-14-OBSERVABILIDAD-CI]]"
  - "[[../sprints/sprint-3-vercel-preview/SPRINT-3-VERCEL-PREVIEW]]"
  - "[[../hotfixes/2026-05-26-magic-link-localhost-redirect/HOTFIX]]"
---

# DEBT-resend-smtp-supabase

> [!warning] Elevado a priority `high` el 2026-06-02
> Durante smoke real de Sprint 3, el rate limit Supabase SMTP default (4 emails/hora **por project**, no por destinatario) chocó múltiples veces durante el debug del bug magic link localhost. Con Pablo + Jorge + Fabio activos + cualquier paciente prueba, esto va a chocar regularmente y bloquear iteración.

## Contexto

Sprint 14 (2026-05-09) dejó el wrapper Resend instalado **idle** en `packages/webapp-somnosalud/lib/email/resend-client.ts` (lazy init que retorna `null` si no hay `RESEND_API_KEY`). Hasta hoy nunca se activó porque (a) no había deploy productivo todavía, (b) el flow de magic link usaba SMTP default de Supabase y alcanzaba.

Hoy (2026-06-02) Sprint 3 cerró el primer deploy Vercel productivo con login real end-to-end. Durante el smoke verification, el rate limit default de Supabase (4 emails/hora **por project**) se chocó múltiples veces porque:

1. Fabio probó magic link → bug redirect localhost (1 email).
2. Reintentó tras Site URL fix → bug "path invalid" (1 email).
3. Reintentó con `https://` correcto → OK (1 email).
4. Jorge probó (1 email).
5. Pablo probó (1 email).

5 emails en ~1h, ya estaba al tope. Si Jorge le manda el link a 2 colegas más para que prueben → bloqueado todos.

## Evidencia empírica del impacto

```
auth.users (verificado vía admin API 2026-06-02 23:30 UTC):
- pabloferrero@ifn.com.ar    | last_sign_in 2026-06-02 21:27 UTC
- jorgeleporace@gmail.com    | last_sign_in never (creado pero no completó)
- cgc.fboschetti@gmail.com   | last_sign_in 2026-06-02 23:18 UTC
```

Jorge intentó pero le saltó "Demasiados intentos. Esperá unos minutos" antes de completar.

## Riesgos

1. **Iteración bloqueada cada vez que hay debug.** 4 emails se gastan rapidísimo con cualquier flow real.
2. **Deliverability mala.** Sender `noreply@mail.app.supabase.io` va a Spam frecuente, sobre todo en bandejas corporate (IFN, hospitales).
3. **Profesionalismo.** Cuando Pablo presente la plataforma a colegas de IFN, mostrar email de un dominio supabase es señal de "todavía no producción". Email con `noreply@somnosalud.com.ar` da otra impresión.
4. **Escala B2C.** Cuando arranquen pacientes reales (post-Sprint Stripe), 4/h es ridículo.

## Propuesta de fix

### Pre-requisitos

- **Confirmar dominio `somnosalud.com.ar`** registrado y con quién (Pablo / Jorge / Pampa Labs). Probable Pablo / IFN ya lo tengan.
- **DNS access** del dominio (para agregar 3 records SPF + DKIM + DMARC).

### Pasos del sprint

1. **Cuenta Resend** — registro en [resend.com](https://resend.com) con email de Pampa Labs o Pablo. Plan Free: 3.000 emails/mes + 100/día (suficiente Fase 1).
2. **Add domain `somnosalud.com.ar`** en Resend dashboard.
3. **Agregar DNS records** (Resend genera los valores exactos):
   - `TXT` con SPF
   - `CNAME` x2 con DKIM
   - `MX` (opcional, solo si querés recibir emails también)
   - `TXT` con DMARC (recomendado)
4. **Esperar propagación DNS** (5min-24h, típico 30min).
5. **Verify domain en Resend** (botón en dashboard).
6. **Obtener API Key** de Resend (Settings → API Keys).
7. **Configurar SMTP custom en Supabase** Auth → SMTP Settings:
   - Host: `smtp.resend.com`
   - Port: `465` (TLS)
   - Username: `resend`
   - Password: la API Key generada arriba
   - Sender email: `noreply@somnosalud.com.ar`
   - Sender name: `SomnoSalud`
8. **Subir rate limit** en Supabase Auth → Rate Limits → "Emails" a un número alto (ej. 60/h).
9. **Smoke test:** mandar 5 magic links seguidos a distintos emails. Verificar que todos llegan + sender correcto.
10. **Actualizar Vercel env vars** con `RESEND_API_KEY` + `RESEND_FROM_EMAIL=noreply@somnosalud.com.ar`. El wrapper `lib/email/resend-client.ts` ya está listo para invocar Resend desde Server Actions futuras (welcome email, results summary, etc).

### Estimación

**~2 horas activas** + tiempo de propagación DNS (30min-24h dependiendo del DNS provider).

Distribución:
- Setup cuenta Resend + add domain: 15 min
- Generar + agregar DNS records: 30 min
- Esperar propagación + verify: variable
- Configurar SMTP custom + rate limit: 20 min
- Smoke test + verificar deliverability: 30 min
- Sprint doc + commit + push: 25 min

## Prioridad

**High** (elevada desde medium en Sprint 3). Justificación:

| Razón | Severidad |
|---|---|
| Cada bug debug del flow auth consume 1+ emails del bucket | Alta — bloquea iteración |
| Pablo va a mostrar plataforma a colegas IFN → email no profesional baja credibilidad | Alta — riesgo reputacional |
| Spam folder común con sender default Supabase | Alta — UX degradada |
| Sin esto, no podemos invitar > 4 testers/hora simultáneamente | Media — escala limitada |

No es bloqueante para Sprint 3 (cerrado con la limitación documentada). Sí es bloqueante para cualquier crecimiento del piloto (> 5 usuarios concurrentes).

## Bloqueante actual

**Decisión Jorge / Fabio:** ¿quién tiene DNS access del dominio `somnosalud.com.ar`?

- Si Pablo/IFN tiene el dominio → mandar mensaje a Pablo con los DNS records exactos (Resend los genera) para que pida al webmaster IFN agregarlos.
- Si nadie lo tiene → primer paso es registrar el dominio (Nominalia, GoDaddy, Cloudflare Registrar, etc.). Costo típico $15-30/año para `.com.ar`.

## Alternativas evaluadas

### Alternativa A — Upgrade Supabase Pro ($25/mes)

Sube el rate limit sin cambiar SMTP. **Rechazada** por:
- Costo fijo $25/mes vs Resend Free.
- No fixea el sender email (sigue siendo `mail.app.supabase.io`).
- No fixea deliverability problem.
- Tradeoff price/value malo: Pro tiene otros benefits útiles (backups daily, no auto-pause) pero el rate limit en sí no justifica el costo.

### Alternativa B — Mantener rate limit + DEBT abierto

Es lo que hacemos hoy. Aceptable mientras el piloto es ≤ 5 usuarios y nadie está debugging activamente. **Aprobada como solución temporal** hasta que se resuelva el bloqueante de DNS access.

## Verificación post-fix

Tras activar Resend SMTP:

1. **Sender verification:** mandar magic link → email llega con `From: SomnoSalud <noreply@somnosalud.com.ar>`.
2. **Rate limit test:** mandar 10 magic links seguidos a emails distintos en 5 minutos. Todos deben llegar (con rate limit subido a 60/h o más).
3. **Deliverability:** verificar que el email no va a Spam folder de Gmail / Outlook / iCloud (probar con cuenta de cada uno).
4. **Cookies de bypass:** asegurar que ningún email reuse el bucket de magic links Supabase legacy.

Cierra DEBT cuando estos 4 puntos pasen.
