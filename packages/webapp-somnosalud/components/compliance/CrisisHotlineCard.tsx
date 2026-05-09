import { Phone } from 'lucide-react';

/**
 * CrisisHotlineCard — recurso de emergencia 24/7 para ideacion suicida.
 *
 * Compliance gate (Decision E3 ADR-003):
 * - Visible siempre en footer de PHQ9Form (no condicional al submit).
 * - Visible tambien en otras pantallas que toquen salud mental
 *   (DerivacionContent del Sprint 7.A ya lo replica).
 *
 * Numero canonico Argentina (Salud Mental gratuita 24/7): 0800-999-0091.
 *
 * Server Component (sin estado).
 *
 * @see docs/vault/clinical/COMPLIANCE-ARGENTINA.md
 * @see packages/webapp-somnosalud/.claude/agents/compliance-anmat.md
 */
export function CrisisHotlineCard({
  variant = 'default',
}: {
  /** 'default' = card mediana | 'reinforced' = card mas prominente con borde rojo (uso: PHQ-9 item 9 marcado >= 1) */
  variant?: 'default' | 'reinforced';
}) {
  const isReinforced = variant === 'reinforced';
  return (
    <section
      role="region"
      aria-label="Recurso de emergencia"
      className={`rounded-lg border p-5 ${
        isReinforced
          ? 'border-destructive/60 bg-destructive/15 ring-2 ring-destructive/30'
          : 'border-yellow-500/40 bg-yellow-500/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <Phone
          className={`mt-0.5 shrink-0 ${
            isReinforced ? 'text-destructive' : 'text-yellow-400'
          }`}
          size={20}
          aria-hidden="true"
        />
        <div className="text-sm leading-relaxed">
          <h3
            className={`mb-2 font-semibold ${
              isReinforced ? 'text-destructive-foreground' : 'text-yellow-200'
            }`}
          >
            {isReinforced
              ? '⚠️ Si estás en crisis, pedí ayuda ahora'
              : 'Si necesitás ayuda urgente'}
          </h3>
          <p className="text-foreground/90">
            {isReinforced ? (
              <>
                Detectamos que marcaste pensamientos de hacerte daño. Esto es
                importante. Hablá <strong>ahora</strong> con un profesional.
                No estás solo/a.
              </>
            ) : (
              <>
                Si tenés pensamientos de hacerte daño o pensás en el
                suicidio, llamá ahora.
              </>
            )}
          </p>
          <p className="mt-3 text-base">
            <strong className="text-foreground">
              📞 0800-999-0091
            </strong>{' '}
            <span className="text-muted-foreground">
              — Línea de Salud Mental gratuita 24/7 (Argentina)
            </span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            También podés acercarte al servicio de emergencia más cercano o
            llamar al <strong>911</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
