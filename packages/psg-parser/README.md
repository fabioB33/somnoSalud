# `@somnosalud/psg-parser`

Parser modular de PDFs polisomnográficos. Reusable desde cualquier app del monorepo (SomnoSalud puede invocarlo cuando un paciente sube su PSG).

> **Status (2026-05-07):** package skeleton. La lógica vive todavía en `webapp-conversor-psg/legacy-v0/index.html`. Migración a TypeScript modular planificada para Fase 2.

## Pipeline

```
[PDF] → extractText (pdf.js) → detectFormat (regex)
     → parseByFormat (router) → parser específico (~50-200 regex)
     → toCSV / toJSON / toFHIR
```

## Licencia

Proprietary — SomnoSalud Team.
