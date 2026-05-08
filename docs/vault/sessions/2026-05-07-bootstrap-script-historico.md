---
title: "Sesión 2026-05-07 — SETUP.sh bootstrap (archivado por foot-gun)"
date: 2026-05-07
tags: [session, bootstrap, archive, historico, foot-gun, somnosalud]
participants: [pampa-labs-cowork-original, jorge]
duration: "ejecutado una vez 2026-05-07"
related:
  - "[[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]]"
  - "[[../../../CLAUDE]]"
archived_by: fabio + cowork
archived_at: 2026-05-08
archived_reason: "foot-gun (rm -rf .git ejecutable) + remote desactualizado (PaulFerrero/somnosalud) + ya cumplio su unica funcion (bootstrap)"
---

# Sesión 2026-05-07 — SETUP.sh bootstrap (archivado por foot-gun)

> Este archivo preserva el script `SETUP.sh` que vivía en el raíz del repo. Fue ejecutado una sola vez el 2026-05-07 para bootstrappear el monorepo + first commit. Después quedó en el raíz como archivo muerto, **con dos problemas críticos** que motivaron su archivo durante Sprint 1:
>
> 1. **`rm -rf .git`** en línea 18 — si alguien lo re-ejecutaba, destruía la historia git completa.
> 2. **Remote desactualizado** en líneas 59-60 — apunta a `https://github.com/PaulFerrero/somnosalud.git` cuando el remote canónico es `git@github.com:itsomnosalud/Somnosalud.git`. Esto lo formalizó el commit `cc6bd5e` para los docs pero el script no fue actualizado.
>
> **Decisión Sprint 1 (2026-05-08):** archivar acá como referencia histórica + eliminar del raíz. El bootstrap ya está hecho — no se va a re-ejecutar nunca.

---

## Cómo se reemplaza esta funcionalidad hoy

Si en el futuro hay que clonar/bootstrappear de nuevo (poco probable), el flujo correcto es:

```bash
# Clonar
git clone git@github.com:itsomnosalud/Somnosalud.git ~/Projects/Somnosalud
cd ~/Projects/Somnosalud

# Instalar deps
pnpm install --frozen-lockfile

# Verificar CI local
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

No hace falta script. El [[../MASTER-PLAN]] tiene el roadmap operativo de aquí en adelante.

---

## Contenido original del `SETUP.sh` (preservado para auditoría)

```bash
#!/bin/bash
# ===================================================================
# SomnoSalud Platform — bootstrap final
# ===================================================================
# Run desde Terminal Mac:
#   cd ~/Pampa-Labs-Core/somnosalud-platform
#   chmod +x SETUP.sh
#   ./SETUP.sh
# ===================================================================
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

echo "🚀 SomnoSalud Platform — bootstrap"
echo "Working dir: $ROOT"

# 1. Limpiar .git previo si existe (puede tener locks)
[ -d .git ] && rm -rf .git

# 2. git init + config
git init -b main
git config user.name "Pampa Labs Cowork"
git config user.email "info@pampalabs.com"

# 3. First commit
git add -A
git commit -m "chore: bootstrap monorepo somnosalud-platform

Estructura inicial completa con source TypeScript del clinical-engine
importado desde Drive (Claude/somnosalud-clinical-engine):

- pnpm workspaces + turborepo + TypeScript 5 estricto
- 5 packages: clinical-engine, psg-parser, webapp-somnosalud,
  webapp-conversor-psg, shared-ui
- README raíz + COMPLIANCE.md (Ley 25.326 + 26.529 + ANMAT)
- GitHub Actions CI: lint + typecheck + test + build
- docs/architecture/overview.md (diagrama mermaid)
- docs/architecture/ANALISIS-EXHAUSTIVO-SOMNOSALUD-2026-05-07.md
  (analisis tecnico completo + plan de migracion)

clinical-engine source TS:
- src/scoring/ (7 instrumentos: ISI, ESS, STOP-BANG, PHQ-9, GAD-7, DASS-21, BMI)
- src/safety/ (SAFE-010 a SAFE-040)
- src/engine/ (13 modulos: phenotype, recommendations, risk-integrator,
  precision, ema, parasomnias, circadian-disorders, rls, sahos-treatment,
  sleep-stages, narcolepsy, sleep-hygiene)
- src/lab/ (parameters + genetics)
- src/references.ts (DOI/PMID centralizados)
- tests/scoring.test.ts (55+ tests Vitest)

Legacy preservado:
- packages/clinical-engine/legacy-bundle/somnosalud-engine.js (190 KB IIFE)
- packages/webapp-conversor-psg/legacy-v0/index.html (94 KB monolitico)

Co-Authored-By: Dr. Pablo Ferrero <pabloferrero@ifn.com.ar>
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"

# 4. Configurar remote
git remote add origin https://github.com/PaulFerrero/somnosalud.git 2>/dev/null || \
  git remote set-url origin https://github.com/PaulFerrero/somnosalud.git

echo ""
echo "✅ Bootstrap LISTO"
echo ""
echo "Próximos pasos manuales:"
echo "  1. Verificar:    git log --oneline && git status"
echo "  2. Push:         git push -u origin main"
echo "     (Pablo te debe haber invitado como collaborator)"
echo "  3. Test local:   pnpm install && cd packages/clinical-engine && pnpm test"
echo ""
```

---

## Lecciones aplicables a futuros scripts de bootstrap

1. **Nunca `rm -rf .git`** sin confirmación interactiva. Si el script tiene que ser idempotente, usar `git init -b main` que es no-op si ya existe.
2. **Remote canónico en variable de entorno**, no hardcoded. Cambia con el tiempo.
3. **Scripts de bootstrap se borran al terminar** o se mueven a `docs/vault/sessions/` con fecha. No se dejan en raíz tentando a re-ejecutar.
4. **`set -e` + comandos destructivos = trampa**. La primera línea destructiva detiene el script si falla, pero si pasa, el daño ya está hecho.

---

*Archivado 2026-05-08 mañana durante [[../sprints/sprint-1-cleanup-os-heredado/SPRINT-1-CLEANUP-OS-HEREDADO]].*
