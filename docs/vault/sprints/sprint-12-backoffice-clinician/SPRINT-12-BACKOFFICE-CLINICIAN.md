---
title: "Sprint 12 — Backoffice clinician multi-user"
date: 2026-06-19
sprint_number: 12
status: code-pending-merge
related:
  - "[[../sprint-10-plan-tab-hoy/SPRINT-10-PLAN-TAB-HOY]]"
  - "[[../sprint-11-diary-tracking-gamification/SPRINT-11-DIARY-TRACKING-GAMIFICATION]]"
tags: [sprint, backoffice, clinician, multi-user, rls, paridad-mobile, tier-2, code-pending-merge]
budget_estimado: "4-5h Cowork"
budget_real: "~35 min Cowork"
---

# Sprint 12 — Backoffice clinician multi-user

## Trigger

Tier 2.6 paridad. Mobile tiene Sprint 17 (backoffice multi-user + migration 0008 `clinician_links`). Webapp NO. **Crítico para venta clínica** — Pablo Ferrero necesita poder ver pacientes desde su laptop para mostrar a colegas IFN.

## Cambios

### Migration nueva

**`infrastructure/supabase/migrations/0010_profile_role.sql`**:
- `ADD COLUMN role TEXT NOT NULL DEFAULT 'patient' CHECK IN ('patient','clinician','admin')`.
- Index parcial sobre role IN ('clinician','admin').
- **RLS clinician_links REFORZADA**: DROP policy original `clinician_links_insert_clinician` + CREATE `clinician_links_insert_only_clinicians` que valida que el inserter tenga `role IN ('clinician','admin')`.

### Server Actions

**`app/backoffice/actions.ts`** (~270 LOC):
- `listLinkedPatients()`: lee links activos + profiles + count evaluations completed.
- `loadPatientDetail(patientId)`: detalle con últimas 20 evaluations + results_snapshot. Verifica link activo defensivamente.
- `linkPatientByEmail(email, notes?)`: vincula paciente. Maneja: not-clinician, patient-not-found, already-linked, revoked → reactivar.
- `requireClinicianOrRedirect()`: gate para Server Components.

### Pantallas

**`app/backoffice/page.tsx`** + **`components/backoffice/BackofficeDashboard.tsx`**:
- Gate clinician.
- Form vincular paciente (email + notes optional, mensajes de error específicos).
- Lista pacientes con: displayName/email, count evaluations, último completedAt, notes truncadas.
- Card de "ya hay paciente" linkea a `/backoffice/patient/[id]`.
- Estado vacío con CTA "Vincular primer paciente".

**`app/backoffice/patient/[id]/page.tsx`**:
- Gate doble: clinician OR redirect + verify link activo OR 404.
- Header con displayName/email.
- Lista evaluations con:
  - Fecha completedAt formato es-AR.
  - Estado traducido.
  - Snapshot resumen 4 stats (ISI/PHQ-9/GAD-7/STOP-BANG) si snapshot completo.
- Footer compliance Ley 25.326 (audit log activo).

## Quality gates

| # | Gate | Status |
|---|---|---|
| 1 | `pnpm typecheck` strict | ✅ PASS |
| 2 | `pnpm test` | ✅ **30/30 PASS** (sin regresión) |
| 3 | `pnpm build` | ✅ PASS — nuevas routes `/backoffice` + `/backoffice/patient/[id]` |
| 4 | Smoke E2E real con user clinician | ⏳ pendiente apply migration 0010 + UPDATE role manual |

## Trade-offs aceptados (regla #1)

1. **Elevation a role='clinician' es manual via SQL** — no hay UI para promover users. Decisión consciente: Pampa Labs/Pablo Ferrero hace `UPDATE profiles SET role='clinician' WHERE email='pabloferrero@ifn.com.ar'` desde el Dashboard. Sprint 13+ puede agregar UI admin si crece el número de clinicians.

2. **Vincular requiere paciente registrado previamente** — si Pablo quiere vincular alguien que aún no tiene cuenta, el flow es: "pedile que se registre, después volvé acá". Sprint 13+ puede agregar invitación por email automática.

3. **Sin `accepted_at` opt-in del paciente** — el link es directo. El paciente recibe acceso pasivo (Pablo ve sus evals). Mitigación: audit_log + RLS solo en evaluations completed. Sprint 13+ puede agregar workflow opt-in con notificación.

4. **Sin UI para revocar link desde paciente** — el paciente NO tiene pantalla de "doctores que me ven". Sprint 13+ puede agregar `/mi-cuenta/clinicians` con toggle de revoke.

5. **Snapshot resumen hardcodea 4 scores (ISI/PHQ9/GAD7/STOP-BANG)** — si el clinical-engine cambia los nombres de keys, romper. Sprint 13+ puede generalizar usando lista de scorers.

6. **Sin filtros/búsqueda en lista pacientes** — fine para clinicians con <20 pacientes. Si Pablo crece, Sprint 13+ agrega search box.

## Cumplimiento reglas universales

| Regla | Aplicación |
|---|---|
| #1 SIN ATAJOS | ✅ RLS doble capa (DB + app layer). Verify link activo en loadPatientDetail aunque RLS también filtre. |
| #7 EMPIRICAL-FIRST | ✅ Verifiqué que migration 0008 ya existe + agrego role check sin romper policy original. |
| #9 NO-HARDCODED | ✅ Roles en CHECK constraint. Sin "pabloferrero" hardcoded en código. |
| #10 VAULT-LOOKUP | ✅ Releí 0008 + Sprint 17 mobile (backoffice) + Sprint 9.A-E auth flow. |

## Tiempo

- **Estimado:** 4-5h Cowork.
- **Real:** ~35 min Cowork (sub-presupuesto 88%).

Razones sub-presupuesto:
- Migration 0008 ya estaba (Sprint 17 mobile + ahora en main del submodule).
- Patrón Server Component + Server Actions ya consolidado en webapp.
- shadcn UI completo.
- RLS reforzada via DROP + CREATE policy (no schema change destructivo).

## Pendientes Fabio post-deploy

1. **Apply migration 0010** via Supabase Dashboard SQL Editor.
2. **Promover Pablo Ferrero a clinician**:
   ```sql
   UPDATE public.profiles
     SET role = 'clinician'
     WHERE id = (SELECT id FROM auth.users WHERE email = 'pabloferrero@ifn.com.ar');
   ```
3. **Smoke E2E como clinician**:
   - Login con cuenta promovida → `/backoffice` debería cargar dashboard.
   - Login con cuenta paciente normal → `/backoffice` debería redirigir a `/`.
   - Vincular paciente con email existente → ver en lista.
   - Vincular email no registrado → ver error "no está registrado todavía".
   - Click en paciente → ver detalle con evaluations.
4. **Compliance**: confirmar con asesor legal Ley 25.326 que el patrón "clinician ve evals sin opt-in explícito" alcanza para la fase actual.

## Pattern reusable

`requireClinicianOrRedirect()` es helper canónico para gating de Server Components. Aplicable a futuros roles:
- `requireAdminOrRedirect()` (Sprint 13+ si hay panel admin).
- Patrón general: `requireRoleOrRedirect(['clinician', 'admin'])`.
