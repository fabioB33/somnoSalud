'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePersistEval } from '@/hooks/usePersistEval';

/**
 * SleepForm — diario de sueno con 7 campos heterogeneos.
 *
 * Validaciones:
 * - Latencia 0-180 min.
 * - Horas dormidas 0-16.
 * - Horas en cama 0-16 (debe ser >= horas dormidas).
 * - Despertares 0-20.
 * - Calidad 1-10.
 * - Hora acostarse / despertarse: HH:MM (input type="time").
 *
 * Persiste state.sleep -> redirige a /eval/lab.
 */
export function SleepForm() {
  const router = useRouter();
  const { state, hydrated, update } = usePersistEval();

  const [latency, setLatency] = useState('');
  const [totalAsleep, setTotalAsleep] = useState('');
  const [timeInBed, setTimeInBed] = useState('');
  const [awakenings, setAwakenings] = useState('');
  const [quality, setQuality] = useState('7');
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
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
    }
  }, [hydrated, state.sleep]);

  if (!hydrated) {
    return (
      <div className="rounded-lg border border-border/60 bg-card/40 p-6">
        <p className="text-sm text-muted-foreground">Cargando datos...</p>
      </div>
    );
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
      setError(
        'Las horas en cama no pueden ser menores a las horas dormidas.',
      );
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
          ¿Cuántos minutos tardás típicamente en dormirte una vez que apagás
          la luz?
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
