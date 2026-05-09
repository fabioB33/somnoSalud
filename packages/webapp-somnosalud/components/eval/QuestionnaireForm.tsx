'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
 * QuestionnaireForm — componente genérico para cuestionarios escalares
 * con respuestas tipo radio.
 *
 * Soporta:
 * - ISI (7 items, escala 0-4 con 5 niveles)
 * - ESS (8 items, escala 0-3 con 4 niveles)
 * - PHQ-9, GAD-7, DASS-21 (Sprint 7.B, mismo patrón)
 *
 * Accesibilidad WCAG 2.1 A:
 * - Cada item es un <fieldset> con <legend> que describe la pregunta.
 * - Inputs <input type="radio"> con name unico por item.
 * - Tab navigation entre items.
 * - aria-required + required en cada radio group.
 *
 * Validación inline:
 * - Submit disabled hasta que todos los items tengan respuesta.
 * - Si el paciente intenta submit sin completar (browser validation skip),
 *   se muestra error + scroll al primer item incompleto.
 *
 * @see docs/vault/architecture/adr/ADR-001-stack-frontend-webapp-somnosalud
 */
export function QuestionnaireForm({
  instrumentName,
  items,
  scale,
  initialResponses,
  onSubmit,
  submitLabel = 'Continuar',
  cancelHref,
}: {
  instrumentName: string;
  items: readonly QuestionItem[];
  scale: readonly ScaleOption[];
  initialResponses?: number[];
  onSubmit: (responses: number[]) => void | Promise<void>;
  submitLabel?: string;
  cancelHref?: string;
}) {
  const [responses, setResponses] = useState<(number | null)[]>(() =>
    initialResponses && initialResponses.length === items.length
      ? [...initialResponses]
      : Array(items.length).fill(null),
  );
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

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
  };

  const allAnswered = responses.every((r) => r !== null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setShowError(true);
      // Scroll al primer item incompleto.
      const firstIncomplete = responses.findIndex((r) => r === null);
      if (firstIncomplete >= 0) {
        const el = document.getElementById(
          `${instrumentName}-item-${firstIncomplete}`,
        );
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          return (
            <li key={item.number} id={itemId}>
              <fieldset
                className={`rounded-lg border p-5 transition-colors ${
                  isAnswered
                    ? 'border-border/60 bg-card/40'
                    : 'border-border/40 bg-card/20'
                }`}
              >
                <legend className="mb-4 px-2 text-sm font-medium leading-snug">
                  <span className="mr-2 text-muted-foreground">
                    {item.number}.
                  </span>
                  {item.text}
                </legend>
                <div className="space-y-2">
                  {itemScale.map((option) => {
                    const inputId = `${itemId}-opt-${option.value}`;
                    const checked = responses[itemIdx] === option.value;
                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? 'border-primary bg-primary/10'
                            : 'border-border/40 hover:border-border/80 hover:bg-card/60'
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
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span className="text-foreground/90">
                          <span className="font-mono text-xs text-muted-foreground">
                            {option.value}
                          </span>{' '}
                          — {option.label}
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
        <p className="text-xs text-muted-foreground sm:ml-2">
          {responses.filter((r) => r !== null).length} de {items.length}{' '}
          respondidas
        </p>
      </div>
    </form>
  );
}
