import { AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * DisclaimerBanner — banner obligatorio que aparece en TODAS las pantallas /eval/*.
 *
 * Sprint UX polish 2026-06-11: rediseño visual con dual-accent (gold para
 * default, destructive para reinforced). Compliance del texto NO se modifica
 * (regla compliance-anmat — texto canónico aprobado por Pablo).
 *
 * Compliance gate Capa 2 de ADR-003 (Ley 26.529 art. 5 + Disposicion
 * ANMAT 18/2017): el paciente debe tener visible en TODA pantalla que la
 * evaluacion es orientativa + identidad del director medico responsable.
 *
 * Variants:
 * - 'default' (Capa 2): banner warm gold sutil en pantallas del flow.
 * - 'reinforced' (Capa 5): banner destructive con texto extra para
 *   /eval/results — paciente esta a punto de leer recomendaciones
 *   y necesita el disclaimer mas visible.
 *
 * Texto canonico aprobado en docs/vault/clinical/COMPLIANCE-ARGENTINA.md.
 * NO modificar sin signoff Pablo Ferrero (regla del agent compliance-anmat).
 *
 * Component es Server Component default (no necesita state ni handlers).
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md
 */
export function DisclaimerBanner({
  variant = 'default',
}: {
  variant?: 'default' | 'reinforced';
}) {
  if (variant === 'reinforced') {
    return (
      <aside
        role="alert"
        aria-label="Aviso médico obligatorio reforzado"
        className="border-y border-destructive/40 bg-destructive/[0.12] px-4 py-5 text-sm backdrop-blur-sm print:border-foreground/40 print:bg-transparent print:backdrop-blur-none"
      >
        <div className="container flex items-start gap-3">
          <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/15 print:border-foreground/40 print:bg-transparent">
            <ShieldAlert
              className="size-5 text-destructive print:text-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="leading-relaxed text-foreground/85">
            <p className="mb-2 font-semibold text-destructive print:text-foreground">
              IMPORTANTE — leé antes de implementar nada.
            </p>
            <p className="mb-2">
              Esta evaluación es <strong className="text-foreground">orientativa</strong>{' '}
              y NO emite diagnóstico médico. Las recomendaciones que vas a
              leer son <strong className="text-foreground">educativas</strong>{' '}
              y deben ser{' '}
              <strong className="text-foreground">
                validadas por un profesional de la salud
              </strong>{' '}
              antes de implementarlas. Algunos suplementos o cambios de
              hábitos pueden interactuar con tu medicación o condiciones
              médicas.
            </p>
            <p>
              Director médico responsable:{' '}
              <strong className="text-foreground">
                Dr. Pablo Ferrero — M.N. 119.783
              </strong>{' '}
              · Instituto Ferrero de Neurología y Sueño (IFN), Buenos Aires,
              Argentina.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      role="alert"
      aria-label="Aviso médico obligatorio"
      className="border-b border-somno-warm/25 bg-somno-tint-warn px-4 py-3 text-sm backdrop-blur-sm print:hidden"
    >
      <div className="container flex items-start gap-3">
        <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-somno-warm/30 bg-somno-warm/10">
          <AlertTriangle
            className="size-3.5 text-somno-warm"
            aria-hidden="true"
          />
        </div>
        <p className="leading-relaxed text-foreground/85">
          <strong className="text-somno-warm-soft">Importante:</strong> Esta
          evaluación es <strong className="text-foreground">orientativa</strong>{' '}
          y NO reemplaza la consulta médica. Las recomendaciones deben ser
          validadas por un profesional de la salud antes de implementarlas.
          Director médico responsable:{' '}
          <strong className="text-foreground">
            Dr. Pablo Ferrero — M.N. 119.783
          </strong>
          .
        </p>
      </div>
    </aside>
  );
}
