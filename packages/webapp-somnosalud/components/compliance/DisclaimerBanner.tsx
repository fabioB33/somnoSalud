import { AlertTriangle } from 'lucide-react';

/**
 * DisclaimerBanner — banner obligatorio que aparece en TODAS las pantallas /eval/*.
 *
 * Compliance gate Capa 2 de ADR-003 (Ley 26.529 art. 5 + Disposicion
 * ANMAT 18/2017): el paciente debe tener visible en TODA pantalla que la
 * evaluacion es orientativa + identidad del director medico responsable.
 *
 * Texto canonico aprobado en docs/vault/clinical/COMPLIANCE-ARGENTINA.md.
 * NO modificar sin signoff Pablo Ferrero (regla del agent compliance-anmat).
 *
 * Component es Server Component default (no necesita state ni handlers).
 * Renderiza identico en SSR y client — sin hydration mismatch.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 2)
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md
 */
export function DisclaimerBanner() {
  return (
    <aside
      role="alert"
      aria-label="Aviso médico obligatorio"
      className="border-b border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm"
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
