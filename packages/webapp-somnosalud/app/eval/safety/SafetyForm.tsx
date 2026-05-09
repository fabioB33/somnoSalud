'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { evaluateAllSafetyRules } from 'somnosalud-clinical-engine';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePersistEval } from '@/hooks/usePersistEval';

type PregnancyStatus = 'yes' | 'no' | 'not_applicable';
type ShiftType = 'night_fixed' | 'rotating' | 'on_call' | '';

/**
 * SafetyForm — Capa 4 de compliance gates (ADR-003).
 *
 * Captura los 10 campos de SafetyScreening del clinical-engine, invoca
 * evaluateAllSafetyRules(patient, screening, medications), y segun el
 * resultado:
 *
 * - severity 'block' (Decision D1 hard block): redirige a
 *   /eval/derivacion-especialista con detalle de la rule en
 *   sessionStorage para que la pantalla destino lo muestre.
 *
 * - severity 'restrict' (Decision D2 warning): muestra alert con
 *   detalle + checkbox "entiendo y quiero seguir" antes de habilitar
 *   submit final. Persiste acknowledgedRestrict en state para audit.
 *
 * - severity 'warn' o 'clear': persiste y avanza a /eval/isi.
 *
 * Datos de profile (DOB, sex, weight, height) se leen desde
 * sessionStorage — paciente NO tiene que re-ingresarlos.
 *
 * @see packages/clinical-engine/src/safety/rules.ts
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md
 */
export function SafetyForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const [pregnancyStatus, setPregnancyStatus] = useState<PregnancyStatus>(
    'not_applicable',
  );
  const [pregnancyWeeks, setPregnancyWeeks] = useState<string>('');
  const [medicationsText, setMedicationsText] = useState('');
  const [anticoagulantFlag, setAnticoagulantFlag] = useState(false);
  const [conditionsText, setConditionsText] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [shiftWork, setShiftWork] = useState(false);
  const [shiftType, setShiftType] = useState<ShiftType>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado de warning para Decision D2 (severity 'restrict').
  const [restrictWarning, setRestrictWarning] = useState<string | null>(null);
  const [acknowledgedRestrict, setAcknowledgedRestrict] = useState(false);

  // Restaurar datos previos.
  useEffect(() => {
    if (!hydrated) return;
    if (state.safety) {
      setPregnancyStatus(state.safety.pregnancyStatus);
      setPregnancyWeeks(
        state.safety.pregnancyWeeks ? String(state.safety.pregnancyWeeks) : '',
      );
      setMedicationsText(state.safety.currentMedications.join(', '));
      setAnticoagulantFlag(state.safety.anticoagulantFlag);
      setConditionsText(state.safety.medicalConditions.join(', '));
      setAllergiesText(state.safety.allergies.join(', '));
      setShiftWork(state.safety.shiftWork);
      if (state.safety.shiftType) setShiftType(state.safety.shiftType);
      if (state.safety.acknowledgedRestrict) setAcknowledgedRestrict(true);
    }
  }, [hydrated, state.safety]);

  // Compliance gate: si no hay profile, mandar a /eval/profile.
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

  if (!state.profile) {
    return null; // El effect ya redirigió.
  }

  const isPregnant = pregnancyStatus === 'yes';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (shiftWork && !shiftType) {
      setError('Indicá el tipo de turno si trabajás en turnos rotativos.');
      return;
    }

    setSubmitting(true);

    // Parsear listas separadas por coma.
    const medications = medicationsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const conditions = conditionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const screening = {
      pregnancyStatus,
      isPregnant,
      pregnancyWeeks:
        isPregnant && pregnancyWeeks ? Number(pregnancyWeeks) : undefined,
      currentMedications: medications,
      anticoagulantFlag,
      medicalConditions: conditions,
      allergies,
      shiftWork,
      shiftType: shiftWork && shiftType ? shiftType : undefined,
    };

    // Invocar clinical-engine.
    const evaluation = evaluateAllSafetyRules(
      state.profile!,
      screening,
      medications,
    );

    // Decision D1 — hard block.
    if (evaluation.anyBlocking) {
      // Pasamos la evaluacion via sessionStorage para que la pantalla
      // destino la lea (evita pasar todo via URL).
      try {
        window.sessionStorage.setItem(
          'somno_blocking_evaluation_v1',
          JSON.stringify(evaluation),
        );
      } catch {
        /* silent fail */
      }
      router.push('/eval/derivacion-especialista');
      return;
    }

    // Decision D2 — restrict warning.
    if (evaluation.anyRestricting && !acknowledgedRestrict) {
      const triggeredRestrict = evaluation.rules.filter(
        (r) => r.triggered && r.severity === 'restrict',
      );
      const summary = triggeredRestrict
        .map((r) => `${r.ruleCode}: ${r.message}`)
        .join('\n');
      setRestrictWarning(summary);
      setSubmitting(false);
      return;
    }

    // Severity clear/warn — persistir y avanzar.
    update({
      safety: {
        ...screening,
        acknowledgedRestrict: evaluation.anyRestricting
          ? true
          : undefined,
      },
    });
    router.push('/eval/isi');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-lg border border-border/60 bg-card/40 p-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {restrictWarning && (
        <Alert variant="warning">
          <AlertTitle>Atención — restricciones detectadas</AlertTitle>
          <AlertDescription>
            <p className="mb-3 whitespace-pre-line">{restrictWarning}</p>
            <p className="mb-3">
              Algunas recomendaciones quedarán excluidas o modificadas por
              estas condiciones. Podés continuar pero te sugerimos validar
              cualquier acción con tu médico antes de implementarla.
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={acknowledgedRestrict}
                onCheckedChange={(v) => setAcknowledgedRestrict(v === true)}
              />
              <span className="text-sm leading-snug">
                Entiendo las restricciones y quiero continuar.
              </span>
            </label>
          </AlertDescription>
        </Alert>
      )}

      {/* Embarazo */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">¿Estás embarazada?</legend>
        <div className="space-y-2">
          {(
            [
              ['no', 'No'],
              ['yes', 'Sí'],
              ['not_applicable', 'No aplica / Prefiero no decir'],
            ] as const
          ).map(([value, label]) => {
            const id = `pregnancy-${value}`;
            return (
              <label
                key={value}
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border/40 px-3 py-2 text-sm hover:border-border/80"
              >
                <input
                  type="radio"
                  id={id}
                  name="pregnancy"
                  value={value}
                  checked={pregnancyStatus === value}
                  onChange={() => setPregnancyStatus(value)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                {label}
              </label>
            );
          })}
        </div>
        {isPregnant && (
          <div className="space-y-1 pl-2">
            <Label htmlFor="pregnancy-weeks">Semanas de gestación</Label>
            <Input
              id="pregnancy-weeks"
              type="number"
              min="0"
              max="42"
              step="1"
              value={pregnancyWeeks}
              onChange={(e) => setPregnancyWeeks(e.target.value)}
              placeholder="ej: 24"
              className="max-w-32"
            />
          </div>
        )}
      </fieldset>

      {/* Medicacion actual */}
      <div className="space-y-2">
        <Label htmlFor="medications">Medicación actual</Label>
        <Input
          id="medications"
          type="text"
          value={medicationsText}
          onChange={(e) => setMedicationsText(e.target.value)}
          placeholder="ej: warfarina, metformina (separadas por coma)"
          aria-describedby="medications-help"
        />
        <p id="medications-help" className="text-xs text-muted-foreground">
          Listá los medicamentos que tomás regularmente, separados por coma.
          Si no tomás ninguno, dejalo vacío.
        </p>
      </div>

      {/* Anticoagulantes */}
      <label
        htmlFor="anticoag"
        className="flex cursor-pointer items-start gap-3 rounded-md border border-border/40 px-3 py-3 text-sm hover:border-border/80"
      >
        <Checkbox
          id="anticoag"
          checked={anticoagulantFlag}
          onCheckedChange={(v) => setAnticoagulantFlag(v === true)}
        />
        <span>
          <span className="font-medium">¿Tomás anticoagulantes?</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            (warfarina, acenocumarol, apixaban, rivaroxaban, dabigatran,
            heparina, etc.)
          </span>
        </span>
      </label>

      {/* Condiciones medicas */}
      <div className="space-y-2">
        <Label htmlFor="conditions">Condiciones médicas relevantes</Label>
        <Input
          id="conditions"
          type="text"
          value={conditionsText}
          onChange={(e) => setConditionsText(e.target.value)}
          placeholder="ej: hipertensión, diabetes (separadas por coma)"
        />
      </div>

      {/* Alergias */}
      <div className="space-y-2">
        <Label htmlFor="allergies">Alergias conocidas</Label>
        <Input
          id="allergies"
          type="text"
          value={allergiesText}
          onChange={(e) => setAllergiesText(e.target.value)}
          placeholder="ej: penicilina, valeriana (separadas por coma)"
        />
      </div>

      {/* Trabajo en turnos */}
      <fieldset className="space-y-3">
        <label
          htmlFor="shift-work"
          className="flex cursor-pointer items-center gap-3 rounded-md border border-border/40 px-3 py-2 text-sm hover:border-border/80"
        >
          <Checkbox
            id="shift-work"
            checked={shiftWork}
            onCheckedChange={(v) => setShiftWork(v === true)}
          />
          ¿Trabajás en turnos rotativos o nocturnos?
        </label>
        {shiftWork && (
          <div className="space-y-2 pl-2">
            <Label htmlFor="shift-type">Tipo de turno</Label>
            <select
              id="shift-type"
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value as ShiftType)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
            >
              <option value="">Seleccioná...</option>
              <option value="night_fixed">Nocturno fijo</option>
              <option value="rotating">Rotativo</option>
              <option value="on_call">Guardia / on-call</option>
            </select>
          </div>
        )}
      </fieldset>

      {/* Botones */}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href="/eval/profile">
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
