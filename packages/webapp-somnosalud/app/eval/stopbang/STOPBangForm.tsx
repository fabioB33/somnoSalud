'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

import {
  STOPBANG_MANUAL_ITEMS,
  STOPBANG_AUTO_ITEMS,
  calculateBMI,
} from 'somnosalud-clinical-engine';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calcularEdad } from '@/lib/calc-edad';
import { usePersistEval } from '@/hooks/usePersistEval';

type StopBangManual = {
  snoring: boolean | null;
  tired: boolean | null;
  observed: boolean | null;
  pressure: boolean | null;
  neckOver40cm: boolean | null;
};

/**
 * STOPBangForm — STOP-BANG screening de apnea (Chung et al. 2008).
 *
 * Estructura distinta a ISI/ESS:
 * - 5 items manuales boolean (Si/No), no escala numerica.
 * - 3 items auto-calculados desde state.profile (BMI > 35, edad > 50,
 *   sexo masculino) — se muestran visible read-only.
 *
 * NO usa <QuestionnaireForm> generico porque ese asume escala numerica.
 * Form custom con radio Si/No por item manual + cards info para auto.
 *
 * Persiste responses en sessionStorage state.stopBang.
 */
export function STOPBangForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const [responses, setResponses] = useState<StopBangManual>({
    snoring: null,
    tired: null,
    observed: null,
    pressure: null,
    neckOver40cm: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  // Restaurar datos previos.
  useEffect(() => {
    if (!hydrated) return;
    if (state.stopBang) {
      setResponses({
        snoring: state.stopBang.snoring,
        tired: state.stopBang.tired,
        observed: state.stopBang.observed,
        pressure: state.stopBang.pressure,
        neckOver40cm: state.stopBang.neckOver40cm,
      });
    }
  }, [hydrated, state.stopBang]);

  // Compliance gate: requiere profile para los auto-calculados.
  useEffect(() => {
    if (hydrated && !state.profile) {
      router.replace('/eval/profile');
    }
  }, [hydrated, state.profile, router]);

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }
  if (!state.profile) return null;

  // Auto-calculados desde profile.
  const bmi = calculateBMI(state.profile.weightKg, state.profile.heightCm);
  const edad = calcularEdad(state.profile.dateOfBirth);
  const autoValues = {
    bmiOver35: bmi.isSTOPBANGPositive, // IMC > 35 (definicion de STOP-BANG en clinical-engine)
    ageOver50: edad > 50,
    isMale: state.profile.biologicalSex === 'male',
  };

  const handleResponseChange = (
    field: keyof StopBangManual,
    value: boolean,
  ) => {
    setResponses((prev) => ({ ...prev, [field]: value }));
    setShowError(false);
  };

  const allAnswered =
    responses.snoring !== null &&
    responses.tired !== null &&
    responses.observed !== null &&
    responses.pressure !== null &&
    responses.neckOver40cm !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setShowError(true);
      return;
    }
    setSubmitting(true);
    update({
      stopBang: {
        snoring: responses.snoring as boolean,
        tired: responses.tired as boolean,
        observed: responses.observed as boolean,
        pressure: responses.pressure as boolean,
        neckOver40cm: responses.neckOver40cm as boolean,
      },
    });
    // Sprint 7.B implementara /eval/phq9. Por ahora redirige al placeholder.
    router.push('/eval/phq9');
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

      {/* 5 items manuales (boolean) */}
      <ol className="space-y-4">
        {STOPBANG_MANUAL_ITEMS.map((item, idx) => {
          const field = item.field as keyof StopBangManual;
          const value = responses[field];
          const itemId = `stopbang-${item.code}`;
          return (
            <li key={item.code} id={itemId}>
              <fieldset
                className={`rounded-lg border p-5 transition-colors ${
                  value !== null
                    ? 'border-border/60 bg-card/40'
                    : 'border-border/40 bg-card/20'
                }`}
              >
                <legend className="mb-4 px-2 text-sm font-medium leading-snug">
                  <span className="mr-2 font-mono text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded bg-primary/20 font-mono text-xs text-primary">
                    {item.code}
                  </span>
                  {item.text}
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: true, label: 'Sí' },
                    { val: false, label: 'No' },
                  ].map(({ val, label }) => {
                    const inputId = `${itemId}-${val ? 'yes' : 'no'}`;
                    const checked = value === val;
                    return (
                      <label
                        key={label}
                        htmlFor={inputId}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                          checked
                            ? 'border-primary bg-primary/10'
                            : 'border-border/40 hover:border-border/80 hover:bg-card/60'
                        }`}
                      >
                        <input
                          type="radio"
                          id={inputId}
                          name={itemId}
                          checked={checked}
                          onChange={() =>
                            handleResponseChange(field, val)
                          }
                          required
                          className="h-4 w-4 shrink-0 accent-primary"
                        />
                        <span className="font-medium">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      {/* 3 items auto-calculados (read-only) */}
      <section
        aria-label="Datos calculados desde tu perfil"
        className="rounded-lg border border-border/40 bg-card/20 p-5"
      >
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Datos calculados desde tu perfil
        </h2>
        <ul className="space-y-3">
          {STOPBANG_AUTO_ITEMS.map((item) => {
            const field = item.field as keyof typeof autoValues;
            const isYes = autoValues[field];
            return (
              <li
                key={item.code}
                className="flex items-center gap-3 text-sm"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted/40 font-mono text-xs text-muted-foreground">
                  {item.code}
                </span>
                <span className="flex-1">{item.text}</span>
                <span
                  className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
                    isYes
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted/30 text-muted-foreground'
                  }`}
                >
                  {isYes ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    <X size={14} aria-hidden="true" />
                  )}
                  {isYes ? 'Sí' : 'No'}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Estos valores se calculan desde los datos que ingresaste en el
          paso 1 (Datos personales). No los podés editar acá — si querés
          cambiar tu perfil,{' '}
          <a
            href="/eval/profile"
            className="underline-offset-4 hover:underline"
          >
            volvé al paso 1
          </a>
          .
        </p>
      </section>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href="/eval/ess">
            <ArrowLeft aria-hidden="true" />
            Volver
          </a>
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Continuar'}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
