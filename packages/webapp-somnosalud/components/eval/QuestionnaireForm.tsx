'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Item de un cuestionario escalar. Acepta dos shapes del clinical-engine:
 * - ESS-like: solo {number, text}; la escala se pasa global como `scale` prop.
 * - ISI-like: {number, text, options: string[]} donde cada item tiene su
 *   propia lista de labels (5 niveles con wording distinto por item).
 *
 * Si el item tiene `options`, esos labels sobreescriben la `scale` global
 * (los `value` siguen siendo 0..options.length-1).
 */
export interface QuestionItem {
  number: number;
  text: string;
  options?: readonly string[];
}

/**
 * Opcion de la escala (radio button). Mismo shape que ESS_OPTIONS del
 * clinical-engine.
 */
export interface ScaleOption {
  value: number;
  label: string;
}

/**
 * QuestionnaireForm — componente generico para cuestionarios escalares.
 *
 * Sprint 8.5 UX polish:
 * - Pills horizontales (en lugar de stack vertical) para reducir scroll.
 * - Number badge prominente con tick cuando esta respondido.
 * - Sticky progress bar interna al form (visible siempre).
 * - Smooth scroll opcional al siguiente item al responder (autoScroll prop).
 * - Highlight del item actual + faded de items no tocados.
 * - Responsive: pills wrap a flex-wrap en mobile si no caben.
 *
 * Soporta:
 * - ISI (7 items, escala 0-4, 5 niveles con wording por item)
 * - ESS (8 items, escala 0-3, 4 niveles uniformes)
 * - PHQ-9, GAD-7 (escala 0-3, 4 niveles)
 * - DASS-21 (21 items, escala 0-3 + itemSeparators "Parte 1/2/3 de 3")
 *
 * Accesibilidad WCAG 2.1 A:
 * - Cada item es un <fieldset> con <legend>.
 * - Inputs <input type="radio"> con name unico por item.
 * - Tab navigation entre items + entre opciones del mismo item.
 * - Touch targets >= 44px en mobile.
 *
 * @see docs/vault/sprints/sprint-8-5-ux-cuestionario/
 */
export function QuestionnaireForm({
  instrumentName,
  items,
  scale,
  initialResponses,
  onSubmit,
  onResponseChange,
  submitLabel = 'Continuar',
  cancelHref,
  itemSeparators,
  autoScroll = true,
}: {
  instrumentName: string;
  items: readonly QuestionItem[];
  scale: readonly ScaleOption[];
  initialResponses?: number[];
  onSubmit: (responses: number[]) => void | Promise<void>;
  /**
   * Callback opcional que se dispara en cada cambio de respuesta.
   * Uso: deteccion live (ej: PHQ-9 item 9 ideacion suicida → recurso emergencia).
   */
  onResponseChange?: (itemIdx: number, value: number) => void;
  submitLabel?: string;
  cancelHref?: string;
  /**
   * Mapa opcional de itemIdx → headerText. Si presente, se renderiza
   * un separator <h2> ANTES de ese item. Uso: DASS-21 con "Parte 1/2/3 de 3".
   */
  itemSeparators?: ReadonlyMap<number, string>;
  /**
   * Si true (default), al responder un item se hace smooth-scroll al
   * siguiente. Tests E2E pueden desactivarlo con autoScroll={false}
   * para evitar flakiness.
   */
  autoScroll?: boolean;
}) {
  const [responses, setResponses] = useState<(number | null)[]>(() =>
    initialResponses && initialResponses.length === items.length
      ? [...initialResponses]
      : Array(items.length).fill(null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

  // Restaurar responses si initialResponses cambia post-mount (ej: hidratacion sessionStorage).
  useEffect(() => {
    if (initialResponses && initialResponses.length === items.length) {
      setResponses([...initialResponses]);
    }
  }, [initialResponses, items.length]);

  const handleResponseChange = (itemIdx: number, value: number) => {
    setResponses((prev) => {
      const next = [...prev];
      next[itemIdx] = value;
      return next;
    });
    setShowError(false);
    // Notificar al consumer (ej: PHQ9Form para deteccion live item 9).
    onResponseChange?.(itemIdx, value);

    // Smooth scroll al siguiente item (si todavia hay) tras un breve delay
    // para que el usuario vea la confirmacion del check.
    if (autoScroll && itemIdx < items.length - 1) {
      setTimeout(() => {
        itemRefs.current[itemIdx + 1]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  };

  const answeredCount = responses.filter((r) => r !== null).length;
  const allAnswered = answeredCount === items.length;
  const progressPercent = Math.round((answeredCount / items.length) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setShowError(true);
      const firstIncomplete = responses.findIndex((r) => r === null);
      if (firstIncomplete >= 0) {
        itemRefs.current[firstIncomplete]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(responses as number[]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Progress sticky interno al form — visible mientras avanzas. */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-muted-foreground">
            {answeredCount} de {items.length} respondidas
          </span>
          <span className="font-mono text-somno-accent">
            {progressPercent}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Progreso del cuestionario: ${answeredCount} de ${items.length}`}
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={items.length}
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40"
        >
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {showError && (
        <Alert variant="destructive">
          <AlertDescription>
            Por favor respondé todas las preguntas antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      <ol className="space-y-4">
        {items.map((item, itemIdx) => {
          const itemId = `${instrumentName}-item-${itemIdx}`;
          const isAnswered = responses[itemIdx] !== null;
          // Si el item trae options propias (ISI-like), las usamos. Si no,
          // usamos la scale global (ESS-like, PHQ-9, GAD-7, DASS-21).
          const itemScale: readonly ScaleOption[] = item.options
            ? item.options.map((label, idx) => ({ value: idx, label }))
            : scale;
          const separator = itemSeparators?.get(itemIdx);
          return (
            <li
              key={item.number}
              id={itemId}
              ref={(el) => {
                itemRefs.current[itemIdx] = el;
              }}
            >
              {separator && (
                <h2 className="mb-3 mt-6 border-b border-border/40 pb-2 text-sm font-semibold uppercase tracking-wider text-somno-accent">
                  {separator}
                </h2>
              )}
              <fieldset
                className={`rounded-lg border p-4 transition-all ${
                  isAnswered
                    ? 'border-border/60 bg-card/40'
                    : 'border-border/40 bg-card/20'
                }`}
              >
                <legend className="px-2">
                  <div className="flex items-start gap-3">
                    {/* Number badge: tick verde si respondido, num grande si no. */}
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        isAnswered
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border/60 bg-card text-muted-foreground'
                      }`}
                    >
                      {isAnswered ? (
                        <Check size={16} aria-hidden="true" />
                      ) : (
                        item.number
                      )}
                    </span>
                    <span className="pt-1 text-sm font-medium leading-snug text-foreground/95">
                      {item.text}
                    </span>
                  </div>
                </legend>

                {/* Pills horizontales con responsive wrap. */}
                <div
                  className="mt-4 grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(auto-fit, minmax(${
                      itemScale.length <= 4 ? '140px' : '110px'
                    }, 1fr))`,
                  }}
                >
                  {itemScale.map((option) => {
                    const inputId = `${itemId}-opt-${option.value}`;
                    const checked = responses[itemIdx] === option.value;
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={`group relative flex min-h-[68px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 px-3 py-2 text-center text-xs leading-tight transition-all hover:scale-[1.02] ${
                          checked
                            ? 'border-primary bg-primary/15 shadow-sm ring-2 ring-primary/30'
                            : 'border-border/40 bg-card/30 hover:border-border/80 hover:bg-card/60'
                        }`}
                      >
                        <input
                          type="radio"
                          id={inputId}
                          name={itemId}
                          value={option.value}
                          checked={checked}
                          onChange={() =>
                            handleResponseChange(itemIdx, option.value)
                          }
                          required
                          className="sr-only"
                        />
                        <span
                          className={`font-mono text-base font-bold ${
                            checked
                              ? 'text-primary'
                              : 'text-muted-foreground group-hover:text-foreground'
                          }`}
                        >
                          {option.value}
                        </span>
                        <span className="text-foreground/85">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
        {cancelHref && (
          <Button type="button" variant="outline" size="lg" asChild>
            <a href={cancelHref}>
              <ArrowLeft aria-hidden="true" />
              Volver
            </a>
          </Button>
        )}
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : submitLabel}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
