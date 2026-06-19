'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { saveDiaryEntry } from '@/app/diario/actions';

type EarlyAwakening = 'never' | 'sometimes' | 'frequently' | 'always';

/**
 * Sprint 11 (2026-06-19) — Form de diario nocturno (cliente).
 *
 * UX:
 * - 6 campos minimal: latencia, awakenings, horas dormido, horas en cama,
 *   early awakening freq, calidad subjetiva 1-10.
 * - Default to "anoche" (forDate = today - 1).
 * - Submit con useTransition para UX no-bloqueante.
 * - Post-save redirige a /progreso.
 */
export function DiaryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Default "anoche" = ayer
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const defaultDate = yesterday.toISOString().slice(0, 10);

  const [forDate, setForDate] = useState(defaultDate);
  const [sleepLatencyMinutes, setSleepLatencyMinutes] = useState('15');
  const [nightAwakenings, setNightAwakenings] = useState('1');
  const [totalSleepHours, setTotalSleepHours] = useState('7');
  const [timeInBedHours, setTimeInBedHours] = useState('8');
  const [earlyAwakening, setEarlyAwakening] = useState<EarlyAwakening>('sometimes');
  const [subjectiveQuality, setSubjectiveQuality] = useState('7');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveDiaryEntry({
        forDate,
        sleepLatencyMinutes: Number(sleepLatencyMinutes),
        nightAwakenings: Number(nightAwakenings),
        totalSleepHours: Number(totalSleepHours),
        timeInBedHours: Number(timeInBedHours),
        earlyAwakening,
        subjectiveQuality: Number(subjectiveQuality),
      });

      if (result.ok) {
        router.push('/progreso');
      } else {
        setError(
          result.reason === 'no-session'
            ? 'Tu sesión expiró. Volvé a entrar.'
            : `No pudimos guardar: ${result.error ?? 'error desconocido'}`,
        );
      }
    });
  };

  return (
    <Card className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-serif mb-2">Registrá una noche</h1>
        <p className="text-sm text-muted-foreground">
          Información rápida sobre cómo dormiste. Cuanto más constante seas en
          registrar, mejor podemos mostrarte tu tendencia.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label htmlFor="forDate">Fecha de la noche</Label>
          <Input
            id="forDate"
            type="date"
            value={forDate}
            onChange={(e) => setForDate(e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalSleepHours">Horas que dormiste</Label>
            <Input
              id="totalSleepHours"
              type="number"
              step="0.25"
              min="0"
              max="14"
              value={totalSleepHours}
              onChange={(e) => setTotalSleepHours(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="timeInBedHours">Horas en la cama</Label>
            <Input
              id="timeInBedHours"
              type="number"
              step="0.25"
              min="0"
              max="14"
              value={timeInBedHours}
              onChange={(e) => setTimeInBedHours(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sleepLatencyMinutes">
              Minutos en dormirte
            </Label>
            <Input
              id="sleepLatencyMinutes"
              type="number"
              min="0"
              max="240"
              value={sleepLatencyMinutes}
              onChange={(e) => setSleepLatencyMinutes(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="nightAwakenings">
              Despertares durante la noche
            </Label>
            <Input
              id="nightAwakenings"
              type="number"
              min="0"
              max="20"
              value={nightAwakenings}
              onChange={(e) => setNightAwakenings(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="earlyAwakening">¿Te despertaste antes de querer?</Label>
          <select
            id="earlyAwakening"
            value={earlyAwakening}
            onChange={(e) => setEarlyAwakening(e.target.value as EarlyAwakening)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          >
            <option value="never">Nunca</option>
            <option value="sometimes">A veces</option>
            <option value="frequently">Frecuentemente</option>
            <option value="always">Siempre</option>
          </select>
        </div>

        <div>
          <Label htmlFor="subjectiveQuality">
            Tu sensación general (1 mal — 10 excelente)
          </Label>
          <Input
            id="subjectiveQuality"
            type="number"
            min="1"
            max="10"
            value={subjectiveQuality}
            onChange={(e) => setSubjectiveQuality(e.target.value)}
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando…' : 'Guardar noche'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/hoy')}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
