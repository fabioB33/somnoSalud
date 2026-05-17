'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FormSkeleton } from '@/components/eval/FormSkeleton';
import { usePersistEval } from '@/hooks/usePersistEval';

type FreqOption = 'never' | 'sometimes' | 'frequently' | 'always';
type TreatmentPref = 'natural_only' | 'open_to_supplements' | 'open_to_all';

const FREQ_LABELS: Record<FreqOption, string> = {
  never: 'Nunca',
  sometimes: 'A veces',
  frequently: 'Frecuentemente',
  always: 'Siempre',
};

const TREATMENT_LABELS: Record<TreatmentPref, string> = {
  natural_only: 'Solo abordajes naturales / comportamentales',
  open_to_supplements: 'Abierto a suplementos (ej. melatonina)',
  open_to_all: 'Abierto a todo (incluida medicación, con receta)',
};

const selectClass =
  'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function SleepForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  // Campos base (Sprint 7.B)
  const [latency, setLatency] = useState('');
  const [totalAsleep, setTotalAsleep] = useState('');
  const [timeInBed, setTimeInBed] = useState('');
  const [awakenings, setAwakenings] = useState('');
  const [quality, setQuality] = useState('7');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');

  // Sprint 9 — campos "Más detalles" opcionales
  const [earlyAwakeningFreq, setEarlyAwakeningFreq] = useState<FreqOption | ''>('');
  const [earlyAwakeningMin, setEarlyAwakeningMin] = useState('');
  const [caffeineCupsDay, setCaffeineCupsDay] = useState('');
  const [caffeineLastHour, setCaffeineLastHour] = useState('');
  const [screenBeforeBed, setScreenBeforeBed] = useState<FreqOption | ''>('');
  const [treatmentPreference, setTreatmentPreference] = useState<TreatmentPref | ''>('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (state.sleep) {
      setLatency(String(state.sleep.sleepLatencyMin));
      setTotalAsleep(String(state.sleep.totalHoursAsleep));
      setTimeInBed(String(state.sleep.timeInBedHours));
      setAwakenings(String(state.sleep.awakeningsPerNight));
      setQuality(String(state.sleep.qualitySubjective));
      setBedtime(state.sleep.bedtimeTypical);
      setWakeTime(state.sleep.wakeTimeTypical);
      // Sprint 9 — repoblar opcionales si existen.
      if (state.sleep.earlyAwakeningFreq) setEarlyAwakeningFreq(state.sleep.earlyAwakeningFreq);
      if (state.sleep.earlyAwakeningMin !== undefined)
        setEarlyAwakeningMin(String(state.sleep.earlyAwakeningMin));
      if (state.sleep.caffeineCupsDay !== undefined)
        setCaffeineCupsDay(String(state.sleep.caffeineCupsDay));
      if (state.sleep.caffeineLastHour !== undefined)
        setCaffeineLastHour(String(state.sleep.caffeineLastHour));
      if (state.sleep.screenBeforeBed) setScreenBeforeBed(state.sleep.screenBeforeBed);
      if (state.sleep.treatmentPreference) setTreatmentPreference(state.sleep.treatmentPreference);
    }
  }, [hydrated, state.sleep]);

  if (!hydrated) {
    return <FormSkeleton />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const lat = Number(latency);
    const asleep = Number(totalAsleep);
    const bed = Number(timeInBed);
    const wakes = Number(awakenings);
    const q = Number(quality);

    if (!Number.isFinite(lat) || lat < 0 || lat > 180) {
      setError('La latencia debe estar entre 0 y 180 minutos.');
      return;
    }
    if (!Number.isFinite(asleep) || asleep < 0 || asleep > 16) {
      setError('Las horas dormidas deben estar entre 0 y 16.');
      return;
    }
    if (!Number.isFinite(bed) || bed < 0 || bed > 16) {
      setError('Las horas en cama deben estar entre 0 y 16.');
      return;
    }
    if (bed < asleep) {
      setError('Las horas en cama no pueden ser menores a las horas dormidas.');
      return;
    }
    if (!Number.isFinite(wakes) || wakes < 0 || wakes > 20) {
      setError('Los despertares deben estar entre 0 y 20.');
      return;
    }
    if (!Number.isFinite(q) || q < 1 || q > 10) {
      setError('La calidad debe estar entre 1 y 10.');
      return;
    }
    if (!bedtime || !wakeTime) {
      setError('Indicá tus horarios típicos de dormir y despertar.');
      return;
    }

    // Sprint 9 — validaciones blandas de campos opcionales.
    let emaMinValue: number | undefined;
    if (earlyAwakeningFreq && earlyAwakeningFreq !== 'never' && earlyAwakeningMin) {
      const n = Number(earlyAwakeningMin);
      if (!Number.isFinite(n) || n < 0 || n > 180) {
        setError('Los minutos de despertar precoz deben estar entre 0 y 180.');
        return;
      }
      emaMinValue = n;
    }

    let caffeineCupsValue: number | undefined;
    if (caffeineCupsDay) {
      const n = Number(caffeineCupsDay);
      if (!Number.isFinite(n) || n < 0 || n > 20) {
        setError('Las tazas de café/día deben estar entre 0 y 20.');
        return;
      }
      caffeineCupsValue = n;
    }

    let caffeineLastHourValue: number | undefined;
    if (caffeineLastHour) {
      const n = Number(caffeineLastHour);
      if (!Number.isFinite(n) || n < 0 || n > 23) {
        setError('La hora de la última taza debe estar entre 0 y 23.');
        return;
      }
      caffeineLastHourValue = n;
    }

    setSubmitting(true);
    update({
      sleep: {
        sleepLatencyMin: lat,
        totalHoursAsleep: asleep,
        timeInBedHours: bed,
        awakeningsPerNight: wakes,
        qualitySubjective: q,
        bedtimeTypical: bedtime,
        wakeTimeTypical: wakeTime,
        ...(earlyAwakeningFreq && { earlyAwakeningFreq }),
        ...(emaMinValue !== undefined && { earlyAwakeningMin: emaMinValue }),
        ...(caffeineCupsValue !== undefined && { caffeineCupsDay: caffeineCupsValue }),
        ...(caffeineLastHourValue !== undefined && { caffeineLastHour: caffeineLastHourValue }),
        ...(screenBeforeBed && { screenBeforeBed }),
        ...(treatmentPreference && { treatmentPreference }),
      },
    });
    router.push('/eval/lab');
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

      <div className="space-y-2">
        <Label htmlFor="latency">Latencia de sueño (minutos)</Label>
        <Input
          id="latency"
          type="number"
          inputMode="numeric"
          min="0"
          max="180"
          step="1"
          value={latency}
          onChange={(e) => setLatency(e.target.value)}
          placeholder="ej: 20"
          required
          aria-describedby="latency-help"
        />
        <p id="latency-help" className="text-xs text-muted-foreground">
          ¿Cuántos minutos tardás típicamente en dormirte una vez que apagás la luz?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="total-asleep">Horas dormidas (típicas)</Label>
          <Input
            id="total-asleep"
            type="number"
            inputMode="decimal"
            min="0"
            max="16"
            step="0.5"
            value={totalAsleep}
            onChange={(e) => setTotalAsleep(e.target.value)}
            placeholder="ej: 6.5"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time-in-bed">Horas en cama (típicas)</Label>
          <Input
            id="time-in-bed"
            type="number"
            inputMode="decimal"
            min="0"
            max="16"
            step="0.5"
            value={timeInBed}
            onChange={(e) => setTimeInBed(e.target.value)}
            placeholder="ej: 8"
            required
            aria-describedby="bed-help"
          />
          <p id="bed-help" className="text-xs text-muted-foreground">
            Incluye tiempo para dormirse y despertares
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="awakenings">Despertares por noche</Label>
        <Input
          id="awakenings"
          type="number"
          inputMode="numeric"
          min="0"
          max="20"
          step="1"
          value={awakenings}
          onChange={(e) => setAwakenings(e.target.value)}
          placeholder="ej: 2"
          required
          aria-describedby="awakenings-help"
        />
        <p id="awakenings-help" className="text-xs text-muted-foreground">
          ¿Cuántas veces te despertás durante la noche en promedio?
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quality">
          Calidad subjetiva del sueño (1 = muy mal · 10 = excelente)
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="quality"
            type="range"
            min="1"
            max="10"
            step="1"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="h-2 flex-1 cursor-pointer accent-primary"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={Number(quality)}
          />
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-primary bg-primary/10 font-mono text-sm font-semibold text-primary">
            {quality}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bedtime">Hora típica de acostarse</Label>
          <Input
            id="bedtime"
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wake-time">Hora típica de despertarse</Label>
          <Input
            id="wake-time"
            type="time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Sprint 9 — sección colapsable con campos extra opcionales. */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="more-details" className="border-border/60">
          <AccordionTrigger className="text-base font-medium">
            Más detalles (opcional) — mejoran la calidad del análisis
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2">
              <p className="text-sm text-muted-foreground">
                Estos campos son opcionales pero ayudan a personalizar tus
                recomendaciones (detección de despertar precoz, higiene del sueño
                y prioridades de tratamiento).
              </p>

              <fieldset className="space-y-3 rounded-md border border-border/40 p-4">
                <legend className="px-1 text-sm font-semibold text-foreground">
                  Despertar precoz
                </legend>
                <div className="space-y-2">
                  <Label htmlFor="ema-freq">¿Te despertás antes de la hora deseada?</Label>
                  <select
                    id="ema-freq"
                    className={selectClass}
                    value={earlyAwakeningFreq}
                    onChange={(e) => setEarlyAwakeningFreq(e.target.value as FreqOption | '')}
                  >
                    <option value="">— Sin respuesta —</option>
                    {(Object.keys(FREQ_LABELS) as FreqOption[]).map((k) => (
                      <option key={k} value={k}>
                        {FREQ_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
                {earlyAwakeningFreq && earlyAwakeningFreq !== 'never' && (
                  <div className="space-y-2">
                    <Label htmlFor="ema-min">
                      ¿Cuántos minutos antes te despertás (en promedio)?
                    </Label>
                    <Input
                      id="ema-min"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="180"
                      step="5"
                      value={earlyAwakeningMin}
                      onChange={(e) => setEarlyAwakeningMin(e.target.value)}
                      placeholder="ej: 45"
                      aria-describedby="ema-min-help"
                    />
                    <p id="ema-min-help" className="text-xs text-muted-foreground">
                      ≥ 30 min es clínicamente relevante para detectar fenotipo EMA.
                    </p>
                  </div>
                )}
              </fieldset>

              <fieldset className="space-y-3 rounded-md border border-border/40 p-4">
                <legend className="px-1 text-sm font-semibold text-foreground">
                  Cafeína
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="caffeine-cups">Tazas de café/mate/té por día</Label>
                    <Input
                      id="caffeine-cups"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="20"
                      step="1"
                      value={caffeineCupsDay}
                      onChange={(e) => setCaffeineCupsDay(e.target.value)}
                      placeholder="ej: 3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caffeine-last">Hora de la última taza (24h)</Label>
                    <Input
                      id="caffeine-last"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="23"
                      step="1"
                      value={caffeineLastHour}
                      onChange={(e) => setCaffeineLastHour(e.target.value)}
                      placeholder="ej: 18"
                      aria-describedby="caffeine-last-help"
                    />
                    <p id="caffeine-last-help" className="text-xs text-muted-foreground">
                      Hora en formato 0-23 (ej: 18 = 6 PM).
                    </p>
                  </div>
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-md border border-border/40 p-4">
                <legend className="px-1 text-sm font-semibold text-foreground">
                  Pantallas antes de dormir
                </legend>
                <div className="space-y-2">
                  <Label htmlFor="screen">
                    ¿Usás celular / TV / pantallas en la hora previa a acostarte?
                  </Label>
                  <select
                    id="screen"
                    className={selectClass}
                    value={screenBeforeBed}
                    onChange={(e) => setScreenBeforeBed(e.target.value as FreqOption | '')}
                  >
                    <option value="">— Sin respuesta —</option>
                    {(Object.keys(FREQ_LABELS) as FreqOption[]).map((k) => (
                      <option key={k} value={k}>
                        {FREQ_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-md border border-border/40 p-4">
                <legend className="px-1 text-sm font-semibold text-foreground">
                  Preferencia de tratamiento
                </legend>
                <div className="space-y-2">
                  <Label htmlFor="treatment">
                    Si tu profesional sugiere tratamiento, ¿qué preferís?
                  </Label>
                  <select
                    id="treatment"
                    className={selectClass}
                    value={treatmentPreference}
                    onChange={(e) =>
                      setTreatmentPreference(e.target.value as TreatmentPref | '')
                    }
                  >
                    <option value="">— Sin preferencia —</option>
                    {(Object.keys(TREATMENT_LABELS) as TreatmentPref[]).map((k) => (
                      <option key={k} value={k}>
                        {TREATMENT_LABELS[k]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Solo afecta cómo priorizamos las recomendaciones — la decisión
                    final siempre es con tu médico.
                  </p>
                </div>
              </fieldset>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center">
        <Button type="button" variant="outline" size="lg" asChild>
          <a href="/eval/dass21">
            <ArrowLeft aria-hidden="true" />
            Volver
          </a>
        </Button>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Continuar a Lab (opcional)'}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
