# `@somnosalud/psg-parser`

Parser modular TypeScript de PDFs polisomnográficos. Reusable desde cualquier app del monorepo (SomnoSalud webapp puede invocarlo cuando un paciente sube su PSG para auto-poblar datos clínicos).

## Status

**Sprint 15 (2026-05-14):** bootstrap + parser piloto Philips Sleepware G3 + tests vitest con fixtures sintéticos. 15/15 tests passing.

| Equipo | Parser | Tests | Sprint |
|--------|--------|-------|--------|
| Philips Sleepware G3 | ✅ | ✅ 15 | 15 |
| BrainWave (PSG) | ⏳ | ⏳ | 16 |
| Philips Alice NightOne | ⏳ | ⏳ | 16 |
| ResMed Diagnóstico | ⏳ | ⏳ | 16 |
| ResMed Tratamiento | ⏳ | ⏳ | 17 |
| BMC Tratamiento | ⏳ | ⏳ | 17 |
| BMC Poligrafía | ⏳ | ⏳ | 17 |
| Engine Hipóxico | ⏳ | ⏳ | 18 |
| Frontend Vite+React | ⏳ | ⏳ | 19 |

El legacy `packages/webapp-conversor-psg/legacy-v0/index.html` (1.887 LOC) sigue funcionando standalone mientras esta migración completa los Sprints 16-19. Ver [[DEBT-conversor-psg-migration-roadmap]] en el Vault.

## Pipeline objetivo

```
[PDF] → pdf.js extractText → detectFormat (regex)
     → parseByFormat (router) → parser específico
     → ParserResult<PSGRecord> { data, missing[] }
     → toCSV / toJSON / toFHIR (Sprint 19+)
```

## Uso

```ts
import { parsePhilipsSleepwareG3 } from '@somnosalud/psg-parser';

const rawText = await extractTextFromPdf(file); // pdf.js
const { data, missing } = parsePhilipsSleepwareG3(rawText);

console.log(data.paciente_apellido);                   // "PEREZ"
console.log(data.iah_global_por_hora);                 // 5.2
console.log(data.rdi_indice_trastornos_respiratorios); // 6.0
console.log(missing);                                  // [] o lista de campos no encontrados
```

## Convenciones

- **Shape de output 1:1 con el legacy:** los nombres de los campos del `PSGRecord` y las regex de cada parser son idénticas a `legacy-v0/index.html`. Esto facilita verificación empírica con PDFs reales: cualquier diferencia entre legacy y nuevo es bug.
- **Todos los campos del `PSGRecord` opcionales:** diferentes equipos llenan diferentes subsets.
- **Cero datos de pacientes reales en `tests/fixtures/`:** strings sintéticos. Reemplazo por PDFs reales anonimizados pendiente Sprint 18-19.

## Scripts

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run
pnpm test:watch  # vitest (watch mode)
pnpm build       # tsc -> dist/
```

## Licencia

Proprietary — SomnoSalud Team.
