# Legacy v0 — Archivado (2026-05-26, Sprint 19.C)

Este directorio contiene el código **histórico** del Conversor PSG previo a la
migración modular completada en Sprints 15-19.

> [!warning] NO usar este HTML como entrada al producto
> El archivado vive acá solo por referencia y para comparación clínica
> contra el nuevo frontend Vite+React. El producto activo es
> `packages/webapp-conversor-psg/src/` (Vite app).

## Qué es esto

`index.html` (94 KB, 1.887 LOC) es la implementación monolítica original del
Conversor PSG → CSV:

- 7 parsers PSG inline (Philips Sleepware G3, Alice NightOne, BrainWave,
  ResMed Diagnóstico, ResMed Tratamiento, BMC Tratamiento, BMC Poligrafía).
- Engine Hipóxico Azarbarzin 2019 inline.
- UI dropzone + processAll + downloadZip + tabs methodology.
- pdf.js + JSZip cargados via CDN.

Toda esa lógica fue migrada en Sprints 15-19 a packages tipados:

| Sprint | Migrado | Ahora vive en |
|--------|---------|---------------|
| 15 | Philips Sleepware G3 + utils | `packages/psg-parser/src/parsers/` |
| 16 | BrainWave + NightOne + ResMed Diag + auto-detect + router | idem |
| 17 | ResMed Trat + BMC Trat + BMC Poligrafo | idem |
| 18 | Engine Hipóxico (DOI Azarbarzin centralizado) | `packages/psg-parser/src/engine/hypoxic.ts` |
| 19 | Frontend Vite+React MVP | `packages/webapp-conversor-psg/src/` |
| 19.B | Engine UI + ZIP + Methodology tabs | idem |
| 19.C | **Este archivado** | acá |

## Cómo abrirlo (smoke comparativo)

Si necesitás verificar paridad del nuevo conversor contra el legacy:

```bash
cd packages/webapp-conversor-psg/legacy-v0/_archived
python3 -m http.server 8765
# Luego abrí http://localhost:8765/
```

Procesá el mismo PDF en ambos:
1. **Legacy:** `http://localhost:8765/` → drag&drop → CSV.
2. **Nuevo:** `pnpm --filter @somnosalud/webapp-conversor-psg dev` → `http://localhost:5173/` → drag&drop → CSV.

Compará los dos CSVs línea por línea. Si hay discrepancia, abrir
`docs/vault/sprints/sprint-19-d-hotfix-paridad/` con detalle.

## Cómo recuperar versión previa

El historial git completo se preservó con `git mv` (Sprint 19.C):

```bash
git log --follow packages/webapp-conversor-psg/legacy-v0/_archived/index.html
```

Para revertir el archivado (si Pablo descubre algo crítico):

```bash
git mv packages/webapp-conversor-psg/legacy-v0/_archived/index.html \
       packages/webapp-conversor-psg/legacy-v0/index.html
```

## Referencias

- Sprint 15 origen del refactor: `docs/vault/sprints/sprint-15-psg-parser-bootstrap/`
- DEBT cerrado: `docs/vault/debt/DEBT-conversor-psg-migration-roadmap.md`
- Sprint 19.C archivado: `docs/vault/sprints/sprint-19-c-archivar-legacy/`
