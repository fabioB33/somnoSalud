'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calcularEdad, EDAD_MINIMA_EVALUACION } from '@/lib/calc-edad';
import { usePersistEval } from '@/hooks/usePersistEval';

type BiologicalSex = 'male' | 'female' | 'prefer_not_to_say';

/**
 * ProfileForm — Client Component que captura datos personales y aplica
 * verificacion edad <18.
 *
 * Compliance gate Capa 3 de ADR-003 + SAFE-010 del clinical-engine:
 * - Calcula edad desde DOB usando lib/calc-edad.ts (UTC, edge cases manejados).
 * - Si edad <18 -> redirige a /eval/menor-no-permitido (NO permite continuar).
 * - Si edad >=18 -> persiste en sessionStorage y avanza al siguiente paso
 *   (que sera /eval/safety en Sprint 7).
 *
 * Persistencia: hook usePersistEval -> sessionStorage somno_eval_v1.
 * Carga inicial: si el paciente refresheo la pagina, restaura datos previos.
 *
 * Validaciones inline:
 * - DOB requerido + no fecha futura.
 * - Sexo biologico requerido.
 * - Peso entre 30-300 kg.
 * - Altura entre 100-250 cm.
 *
 * @see docs/vault/architecture/adr/ADR-003-compliance-gates-en-codigo.md (Capa 3)
 * @see packages/clinical-engine/src/safety/rules.ts (SAFE-010)
 */
export function ProfileForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<BiologicalSex | ''>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Restaurar datos previos post-mount (sessionStorage).
  useEffect(() => {
    if (!hydrated) return;
    if (state.profile) {
      setDob(state.profile.dateOfBirth);
      setSex(state.profile.biologicalSex);
      setWeight(String(state.profile.weightKg));
      setHeight(String(state.profile.heightCm));
    }
  }, [hydrated, state.profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validacion DOB.
    if (!dob) {
      setError('Por favor ingresá tu fecha de nacimiento.');
      return;
    }
    const edad = calcularEdad(dob);
    if (Number.isNaN(edad)) {
      setError('La fecha ingresada no es válida. Verificá el formato.');
      return;
    }

    // Validacion sexo.
    if (!sex) {
      setError('Por favor seleccioná tu sexo biológico.');
      return;
    }

    // Validacion peso/altura.
    const w = Number(weight);
    const h = Number(height);
    if (!Number.isFinite(w) || w < 30 || w > 300) {
      setError('El peso debe estar entre 30 y 300 kg.');
      return;
    }
    if (!Number.isFinite(h) || h < 100 || h > 250) {
      setError('La altura debe estar entre 100 y 250 cm.');
      return;
    }

    setSubmitting(true);

    // ⚠️ Compliance gate Capa 3: SAFE-010 enforcement.
    // Si edad <18, redirigir a pantalla de derivacion (NO continuar).
    if (edad < EDAD_MINIMA_EVALUACION) {
      router.push('/eval/menor-no-permitido');
      return;
    }

    // Persistir en sessionStorage + avanzar.
    update({
      profile: {
        dateOfBirth: dob,
        biologicalSex: sex,
        weightKg: w,
        heightCm: h,
      },
    });

    // Sprint 7+ implementara /eval/safety. Por ahora redirigimos al placeholder
    // que en Sprint 7 sera la siguiente pantalla.
    router.push('/eval/safety');
  };

  // Mientras hidrata sessionStorage, mostrar form sin errores (placeholder UX).
  if (!hydrated) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-border/60 bg-card/40 p-6"
      noValidate
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="dob">Fecha de nacimiento</Label>
        <Input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          required
          aria-describedby="dob-help"
        />
        <p id="dob-help" className="text-xs text-muted-foreground">
          Necesario para calcular tu edad y aplicar reglas de seguridad
          clínica. Las personas menores de 18 años no pueden completar la
          evaluación auto-administrada.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sex">Sexo biológico</Label>
        <select
          id="sex"
          value={sex}
          onChange={(e) => setSex(e.target.value as BiologicalSex | '')}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          aria-describedby="sex-help"
        >
          <option value="">Seleccioná...</option>
          <option value="male">Masculino</option>
          <option value="female">Femenino</option>
          <option value="prefer_not_to_say">Prefiero no decir</option>
        </select>
        <p id="sex-help" className="text-xs text-muted-foreground">
          El sexo biológico es relevante para algunos algoritmos de
          evaluación (ej: STOP-BANG para riesgo de apnea).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            min="30"
            max="300"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Altura (cm)</Label>
          <Input
            id="height"
            type="number"
            inputMode="numeric"
            min="100"
            max="250"
            step="1"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Continuar'}
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push('/')}
        >
          Cancelar y volver
        </Button>
      </div>
    </form>
  );
}
