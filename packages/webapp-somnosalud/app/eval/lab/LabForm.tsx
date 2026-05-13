'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';

import { LAB_PARAMETERS } from 'somnosalud-clinical-engine';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormSkeleton } from '@/components/eval/FormSkeleton';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * LabForm — 7 inputs numericos opcionales con boton skip prominente.
 *
 * Comportamiento:
 * - Cada input es opcional (puede dejarse vacio).
 * - Si paciente ingresa al menos 1 valor: persiste objeto Record<code, number>
 *   con SOLO los codes que tienen valor numerico valido.
 * - Si todos vacios + click "Continuar": persiste lab=undefined (skip implicito).
 * - Boton "Saltar este paso" prominente: explicit skip, persiste undefined.
 */
export function LabForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  // Inicializar estado con string vacio por code.
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.keys(LAB_PARAMETERS).forEach((code) => {
      initial[code] = '';
    });
    return initial;
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (state.lab) {
      setValues((prev) => {
        const next = { ...prev };
        Object.entries(state.lab!).forEach(([code, val]) => {
          next[code] = String(val);
        });
        return next;
      });
    }
  }, [hydrated, state.lab]);

  if (!hydrated) {
    return (
      <FormSkeleton />
    );
  }

  const buildLabPayload = (): Record<string, number> | null => {
    const payload: Record<string, number> = {};
    let anyValid = false;
    for (const [code, raw] of Object.entries(values)) {
      if (raw.trim() === '') continue;
      const num = Number(raw);
      if (!Number.isFinite(num) || num < 0) {
        setError(
          `El valor de "${LAB_PARAMETERS[code]?.name ?? code}" no es valido.`,
        );
        return null;
      }
      payload[code] = num;
      anyValid = true;
    }
    return anyValid ? payload : null;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = buildLabPayload();
    if (error) return;
    setSubmitting(true);
    update({ lab: payload ?? undefined });
    router.push('/eval/genetics');
  };

  const handleSkip = () => {
    update({ lab: undefined });
    router.push('/eval/genetics');
  };

  return (
    <form
      onSubmit={handleContinue}
      noValidate
      className="space-y-6 rounded-lg border border-border/60 bg-card/40 p-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {Object.values(LAB_PARAMETERS).map((param) => {
          const id = `lab-${param.code}`;
          const optimalRange =
            param.ranges.optimal &&
            (param.ranges.optimal.optimalMin || param.ranges.optimal.optimalMax)
              ? `${param.ranges.optimal.optimalMin ?? '?'}-${param.ranges.optimal.optimalMax ?? '?'}`
              : `${param.ranges.normal.min ?? '?'}-${param.ranges.normal.max ?? '?'}`;
          return (
            <div key={param.code} className="space-y-1.5">
              <Label htmlFor={id}>
                {param.name}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({param.unit}, rango: {optimalRange})
                </span>
              </Label>
              <Input
                id={id}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={values[param.code] ?? ''}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [param.code]: e.target.value,
                  }))
                }
                placeholder="Dejar vacío si no tenés"
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href="/eval/sleep">
            <ArrowLeft aria-hidden="true" />
            Volver
          </a>
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Continuar'}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={handleSkip}
          className="sm:ml-auto"
        >
          <SkipForward aria-hidden="true" />
          Saltar este paso
        </Button>
      </div>
    </form>
  );
}
