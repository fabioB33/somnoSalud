'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, MoonStar, Sparkles, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { joinWaitlist, leaveWaitlist, type WaitlistEntry } from '@/app/premium/actions';

interface PremiumLandingProps {
  entry: WaitlistEntry | null;
  userEmail: string;
}

const FEATURES_FREE = [
  'Evaluación clínica completa (ISI/ESS/STOP-BANG/PHQ-9/GAD-7/DASS-21)',
  'Resultados orientativos + plan diario derivado del motor',
  'Diario nocturno + streaks + insights longitudinales',
  'Histórico personal sin límite de tiempo',
];

const FEATURES_PREMIUM = [
  'Conversor PSG: subí estudios de polisomnografía y recibí lectura automática + Engine Hipóxico Azarbarzin 2019',
  'Insights avanzados con IA: el motor te dice qué cambió en tus últimos 30 días',
  'Plan personalizado con sugerencias semanales (no solo diarias)',
  'Acceso a tu doctor del sueño (Dr. Pablo Ferrero M.N. 119.783) vía consulta agendable',
  'Exportar PDF profesional para llevar al médico',
  'Acompañamiento mensual por email con tu progreso',
];

export function PremiumLanding({ entry, userEmail }: PremiumLandingProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [localEntry, setLocalEntry] = useState<WaitlistEntry | null>(entry);

  const onJoin = () => {
    setError(null);
    startTransition(async () => {
      const result = await joinWaitlist({ source: 'webapp_premium_page' });
      if (result.ok) {
        setLocalEntry(result.entry);
      } else {
        setError(
          result.reason === 'no-session'
            ? 'Tu sesión expiró. Volvé a entrar.'
            : `No pudimos anotarte: ${result.error ?? 'error desconocido'}`,
        );
      }
    });
  };

  const onLeave = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveWaitlist();
      if (result.ok) {
        setLocalEntry(null);
      } else {
        setError(`No pudimos sacarte de la lista: ${result.error ?? 'error desconocido'}`);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">
          <Sparkles className="h-3 w-3" />
          Próximamente
        </div>
        <h1 className="text-4xl md:text-5xl font-serif">SomnoSalud Premium</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Vas a poder tener acceso completo al motor clínico del Dr. Ferrero,
          subir tus estudios polisomnográficos y agendar consultas. Estamos
          terminando de definir pricing y el modelo de acompañamiento.
        </p>
      </div>

      {/* Waitlist state */}
      {localEntry ? (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-start gap-4">
            <Check className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-medium text-green-900 mb-1">
                Ya estás en la lista de espera
              </h2>
              <p className="text-sm text-green-800">
                Te vamos a avisar a <strong>{localEntry.email}</strong> cuando
                lancemos Premium. Anotado el{' '}
                {new Date(localEntry.interestedAt).toLocaleDateString('es-AR')}.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onLeave}
                disabled={isPending}
                className="mt-3"
              >
                {isPending ? 'Procesando…' : 'Sacarme de la lista'}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-indigo-200 bg-indigo-50">
          <div className="flex items-start gap-4">
            <Star className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-medium text-indigo-900 mb-1">
                Anotate en la lista de espera
              </h2>
              <p className="text-sm text-indigo-800 mb-3">
                Te vamos a avisar a <strong>{userEmail}</strong> cuando esté
                listo, con acceso prioritario y precio de fundadores.
              </p>
              <Button onClick={onJoin} disabled={isPending}>
                {isPending ? 'Anotando…' : 'Anotarme en la lista'}
              </Button>
              {error ? (
                <p className="text-sm text-red-700 mt-3">{error}</p>
              ) : null}
            </div>
          </div>
        </Card>
      )}

      {/* Features comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <MoonStar className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-medium">Plan actual (gratis)</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Lo que tenés ahora sin pagar nada.
          </p>
          <ul className="space-y-2">
            {FEATURES_FREE.map((f) => (
              <li key={f} className="text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Premium */}
        <Card className="p-6 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-medium text-amber-900">Premium (próximo)</h3>
          </div>
          <p className="text-xs text-amber-800 mb-4">
            Lo que vas a poder tener cuando lancemos.
          </p>
          <ul className="space-y-2">
            {FEATURES_PREMIUM.map((f) => (
              <li key={f} className="text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-4 bg-muted/30 text-xs text-muted-foreground">
        <p>
          <strong>Sobre tus datos:</strong> tu email solo lo usamos para
          avisarte cuando Premium esté listo. Podés sacarte de la lista en
          cualquier momento. No compartimos tu información con terceros.
        </p>
      </Card>

      <div className="text-center">
        <Button variant="outline" onClick={() => router.push('/hoy')}>
          Volver a mi plan diario
        </Button>
      </div>
    </div>
  );
}
