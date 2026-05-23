---
title: "Sprint 9.B-login-ux — UX upgrade /login + BrandLogo + verificación DB end-to-end"
date: 2026-05-23
sprint_number: 9.B-login-ux
status: closed-verified
parent_debts: []
related:
  - "[[../sprint-9-a-supabase-client-auth/SPRINT-9-A-SUPABASE-CLIENT-AUTH]]"
  - "[[../sprint-2-b-supabase-schema/SPRINT-2-B-SUPABASE-SCHEMA]]"
tags: [sprint, supabase, login, ux, brand, magic-link, fase-1]
---

# Sprint 9.B-login-ux — UX upgrade /login + BrandLogo + verificación DB end-to-end

> [!info] Objetivo
> Cerrar el feedback de Fabio post smoke real magic link: agregar identidad visual (BrandLogo) + referencia explícita a Dr. Pablo Ferrero/IFN + mejoras UX del form (loading visible, success card, validation inline, helper spam). Verificación empírica del trigger `handle_new_user` con cuenta real.

## Contexto

Sprint 9.A (2026-05-18) entregó cliente Supabase + magic link + Route Handler `/auth/callback`. Quedó pendiente:

1. **Smoke real end-to-end:** Fabio hizo login con `cgc.fboschetti@gmail.com` desde el browser, recibió el email, hizo click, terminó logueado.
2. **Verificación DB:** confirmar empíricamente que el trigger `handle_new_user` (Sprint 2.B) creó la row en `public.profiles`.
3. **Feedback UX:** "el /login no se ve que es de SomnoSalud / Dr. Sueño — falta logo + branding".

Este sprint corto (~1 h) cierra esos 3 items.

## Hipótesis

- **H1 ✅** — Magic link end-to-end funcionó: email recibido, click, redirect a `/`, cookie `sb-goxdopciwvahrxdeirft-auth-token` seteada.
- **H2 ✅** — `auth.users` tiene la row de Fabio (verificado vía admin API REST con `SUPABASE_SECRET_KEY`).
- **H3 ✅** — Trigger `handle_new_user()` creó row en `public.profiles` con misma id, email copiado, defaults aplicados.
- **H4** — `/login` con UX nueva renderiza HTTP 200, sin errores typecheck, con markers visuales esperados (BrandLogo + Dr. Ferrero + helper Spam) presentes en HTML.

## Verificación DB end-to-end (E2)

### auth.users

```
Total users: 1
- cgc.fboschetti@gmail.com | id=f8ed0026-5767-4263-acc5-857e29663dc0
  created=2026-05-23T22:38:43.354578Z
  last_sign_in_at=2026-05-23T22:39:11.110288Z
```

### public.profiles (PostgREST con service key)

```json
{
  "id": "f8ed0026-5767-4263-acc5-857e29663dc0",
  "email": "cgc.fboschetti@gmail.com",
  "created_at": "2026-05-23T22:38:43.354207+00:00",
  "updated_at": "2026-05-23T22:38:43.354207+00:00",
  "dob_verified_at": null,
  "consent_terms_accepted_at": null,
  "consent_terms_version": null,
  "consent_disclaimer_acknowledged_at": null,
  "preferred_language": "es",
  "receive_email_notifications": true,
  "display_name": null
}
```

✅ Sprint 2.B H5 verificada con cuenta real (no fixture). El trigger funciona.

Los compliance fields (`dob_verified_at`, `consent_*`) quedan en NULL hasta que el flow `/eval/*` los popule (eso lo cierra Sprint 9.C cuando integremos el persist con DB).

## FASE 1 — Implementación UX

### Bloque A — BrandLogo reusable

Nuevo componente `components/brand/BrandLogo.tsx`:

- Moon icon de lucide (mismo del 404) + wordmark "SomnoSalud" en bold.
- Variants `size`: `sm` (24px), `md` (32px), `lg` (48px, default).
- Prop `withWordmark` para ocultarlo si solo se quiere el icon (ej. en /not-found ya tiene su Moon, no quiere wordmark al lado).
- Reutilizable en welcome / login / 404 / about / futuras pantallas.

**Decisión documentada:** versión "ship-today" sin asset profesional. Sprint futuro queda abierto para integrar logo final cuando un designer lo cree.

### Bloque B — Login page rediseñada

`app/login/page.tsx`:

- `<BrandLogo size="lg">` arriba del card, dentro de un `<Link href="/">` para clickeable.
- Card header con título "Iniciá sesión" centrado.
- **Card footer nuevo** con separator horizontal:
  - Icon Stethoscope + texto "Plataforma médica digital del **Dr. Pablo Ferrero** (M.N. 119.783) — Instituto Ferrero de Neurología y Sueño (IFN)."
  - Texto T&C / Privacidad existente.

### Bloque C — LoginForm UX upgrade

`app/login/LoginForm.tsx`:

1. **Loading state visible:** `<SubmitButton>` ahora muestra `<Loader2 spinner>` + texto "Enviando link…" cuando `pending = true`.
2. **Email validation inline:** patrón regex `EMAIL_PATTERN` real-time; mientras escribís, si está mal después de `onBlur`, aparece warning ámbar "Ese email no parece válido. Revisá el formato.".
3. **Submit disabled** cuando el email es inválido (además del `pending`).
4. **Success card upgrade:** reemplazo el bloque texto chico verde por una card grande:
   - Icon CheckCircle2 verde en círculo.
   - Title "¡Listo! Revisá tu email."
   - Email del usuario en bold (break-all para emails largos).
   - Helper sub-card destacado: "¿No te llegó? Puede demorar hasta 2 minutos. Revisá Spam / Correo no deseado".
   - Botón "Usar otro email" que recarga la página (vuelve al form).
5. **Helper text mejorado** abajo del form: icon Mail + "Si no llega en 2 minutos, revisá Spam...".

## FASE 2 — Verificación

### E1 — Typecheck

`pnpm --filter @somnosalud/webapp-somnosalud typecheck` → ✅ verde (sin errores).

### E2 — HTTP smoke

```
GET /login -> 200 in 0.129022s
```

`grep` de markers en el HTML renderizado:

| Marker | Ocurrencias |
|---|---|
| `SomnoSalud` | 16 |
| `Dr. Pablo Ferrero` | 5 |
| `M.N. 119.783` | 5 |
| `Iniciá sesión` | 4 |
| `Spam` | 1 |
| `carpeta de` | 1 |

### E3 — Visual manual (post-commit)

Fabio refresca la tab en el browser y confirma:
- Moon + "SomnoSalud" wordmark visible arriba del card.
- Footnote del card con Stethoscope + Dr. Ferrero + IFN.
- Submit button disabled mientras email inválido.
- Spinner visible durante submit real.
- Success card con CheckCircle2 + email confirmado + helper Spam.

## FASE 3 — Cierre

### Cambios consumados

| Archivo | Tipo | Líneas |
|---|---|---|
| `components/brand/BrandLogo.tsx` | NEW | ~55 |
| `app/login/page.tsx` | REWRITE | ~85 (era 59) |
| `app/login/LoginForm.tsx` | REWRITE | ~140 (era 75) |
| `docs/vault/sprints/sprint-9-b-login-ux/SPRINT-9-B-LOGIN-UX.md` | NEW | este doc |

### DEBT abierto post-sprint

- **DEBT-brand-logo-profesional** (low priority): el BrandLogo actual usa Moon icon + wordmark text. Cuando exista un asset profesional (designer Figma o SVG custom), reemplazar.
- **DEBT-resend-smtp-supabase** (medium): SMTP default Supabase tiene rate 4/h — fastidioso para testing. Activar Resend domain verification + apuntar Supabase SMTP a Resend.

### Próximo sprint candidato

- **Sprint 9.C-persist-eval** — Migrar `usePersistEval` a write-through DB (cuando hay sesión) + `/mis-resultados` + Server Action `markEvaluationCompleted` que persiste `results_snapshot`.

## Bloque J — Reporte

**Sprint 9.B-login-ux cerrado 2026-05-23.**

- **Scope alcanzado:** 1 componente nuevo (BrandLogo) + 2 rewrites + verificación DB con cuenta real + 4 mejoras UX en login form.
- **Líneas modificadas:** ~280 nuevas, 0 deleted.
- **Tests:** typecheck verde, smoke HTTP 200, grep markers verificados.
- **DB end-to-end:** confirmado `auth.users` + `public.profiles` populated correctamente vía trigger `handle_new_user`.
- **Dependencias added:** ninguna.
- **DEBT abierto nuevo:** 2 (logo profesional, resend SMTP).
- **Lessons captured:** ninguna nueva — Sprint corto sin fricción técnica.
