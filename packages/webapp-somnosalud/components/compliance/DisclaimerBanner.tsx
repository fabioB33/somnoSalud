import { AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * DisclaimerBanner — banner obligatorio que aparece en TODAS las pantallas /eval/*.
 *
 * Compliance gate Capa 2 de ADR-003 (Ley 26.529 art. 5 + Disposicion
 * ANMAT 18/2017): el paciente debe tener visible en TODA pantalla que la
 * evaluacion es orientativa + identidad del director medico responsable.
 *
 * Variants:
 * - 'default' (Capa 2): banner amarillo en pantallas del flow.
 * - 'reinforced' (Capa 5): banner rojo con texto extra para
 *   /eval/results — paciente esta a punto de leer recomendaciones
 *   y necesita el disclaimer mas visible.
 *
 * Texto canonico aprobado en docs/vault/clinical/COMPLIANCE-ARGENTINA.md.
 * NO modificar sin signoff Pablo Ferrero (regla del agent compliance-anmat).
 *
 * Component es Server Component default (no necesita state ni handlers).
 * Renderiza identico en SSR y client — sin hydration mismatch.
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
        className="border-y border-destructive/50 bg-destructive/15 px-4 py-4 text-sm print:bg-transparent print:border-foreground/40"
      >
        <div className="container flex items-start gap-3">
          <ShieldAlert
            className="mt-0.5 shrink-0 text-destructive print:text-foreground"
            size={20}
            aria-hidden="true"
          />
          <div className="leading-relaxed text-foreground/90">
            <p className="mb-2">
              <strong className="text-destructive-foreground">
                ⚠️ IMPORTANTE — leé antes de implementar nada.
              </strong>
            </p>
            <p className="mb-2">
              Esta evaluación es <strong>orientativa</strong> y NO emite
              diagnóstico médico. Las recomendaciones que vas a leer son{' '}
              <strong>educativas</strong> y deben ser{' '}
              <strong>validadas por un profesional de la salud</strong>{' '}
              antes de implementarlas. Algunos suplementos o cambios de
              hábitos pueden interactuar con tu medicación o condiciones
              médicas.
            </p>
            <p>
              Director médico responsable:{' '}
              <strong>Dr. Pablo Ferrero — M.N. 119.783</strong> · Instituto
              Ferrero de Neurología y Sueño (IFN), Buenos Aires, Argentina.
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
      className="border-b border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm print:hidden"
    >
      <div className="container flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 shrink-0 text-yellow-400"
          size={18}
          aria-hidden="true"
        />
        <p className="leading-relaxed text-foreground/90">
          <strong className="text-yellow-200">Importante:</strong> Esta
          evaluación es <strong>orientativa</strong> y NO reemplaza la consulta
          médica. Las recomendaciones deben ser validadas por un profesional
          de la salud antes de implementarlas. Director médico responsable:{' '}
          <strong>Dr. Pablo Ferrero — M.N. 119.783</strong>.
        </p>
      </div>
    </aside>
  );
}
