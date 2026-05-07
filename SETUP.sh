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
