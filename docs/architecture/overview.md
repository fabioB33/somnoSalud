# Arquitectura SomnoSalud Platform

## Diagrama de alto nivel

```mermaid
graph TB
    subgraph "Frontend"
        WS[webapp-somnosalud<br/>Next.js 14]
        WC[webapp-conversor-psg<br/>Vite + React]
    end

    subgraph "Logic"
        CE[clinical-engine<br/>TypeScript]
        PP[psg-parser<br/>TypeScript]
    end

    subgraph "Backend"
        SB[(Supabase<br/>PostgreSQL + Auth + Storage)]
    end

    subgraph "Services"
        ST[Stripe<br/>Pagos]
        SE[Sentry<br/>Errors]
        RE[Resend<br/>Email]
        PH[PostHog<br/>Analytics]
    end

    WS --> CE
    WS --> PP
    WS --> SB
    WC --> PP
    WC --> CE

    WS --> ST
    WS --> SE
    WS --> RE
    WS --> PH
```

## Principios

1. **Logic separada de UI** — `clinical-engine` y `psg-parser` no dependen de framework visual.
2. **TypeScript estricto** en todo el monorepo.
3. **Compliance médico desde día 1** — disclaimer + T&C + consentimiento auditable.
4. **Tests obligatorios** para todo módulo del clinical-engine antes de merge.
5. **Referencias científicas verificables** (DOI/PMID) para cada recomendación clínica.
