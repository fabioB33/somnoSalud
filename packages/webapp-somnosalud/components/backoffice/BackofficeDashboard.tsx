'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { linkPatientByEmail, type LinkedPatient } from '@/app/backoffice/actions';

interface BackofficeDashboardProps {
  patients: LinkedPatient[];
}

/**
 * Sprint 12 (2026-06-19) — Dashboard backoffice clinician.
 *
 * Lista pacientes linkeados + permite agregar uno nuevo por email.
 * Cada paciente linkea a `/backoffice/patient/[id]` con detalle de
 * evaluations + insights.
 */
export function BackofficeDashboard({ patients }: BackofficeDashboardProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSubmitLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await linkPatientByEmail(emailInput, notesInput || undefined);
      if (result.ok) {
        setSuccess(`Paciente vinculado correctamente.`);
        setEmailInput('');
        setNotesInput('');
        setShowAddForm(false);
        router.refresh();
      } else {
        const messages: Record<string, string> = {
          'no-session': 'Tu sesión expiró. Volvé a entrar.',
          'not-clinician': 'No tenés permisos clínicos en esta cuenta.',
          'patient-not-found':
            'Ese paciente no está registrado todavía. Pedile que se registre en SomnoSalud primero.',
          'already-linked': 'Ya tenés a ese paciente vinculado.',
          'db-error': `Error de base de datos: ${result.error ?? 'desconocido'}`,
        };
        setError(messages[result.reason] ?? 'Error desconocido.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Mis pacientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length === 0
              ? 'No tenés pacientes vinculados todavía.'
              : `${patients.length} ${patients.length === 1 ? 'paciente vinculado' : 'pacientes vinculados'}.`}
          </p>
        </div>
        <Button onClick={() => setShowAddForm((s) => !s)}>
          <UserPlus className="h-4 w-4 mr-2" />
          {showAddForm ? 'Cerrar' : 'Agregar paciente'}
        </Button>
      </div>

      {/* Form agregar */}
      {showAddForm ? (
        <Card className="p-6 border-indigo-200 bg-indigo-50/30">
          <form onSubmit={onSubmitLink} className="space-y-4">
            <div>
              <Label htmlFor="email">Email del paciente</Label>
              <Input
                id="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="paciente@email.com"
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">
                El paciente tiene que estar registrado en SomnoSalud.
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notas internas (opcional)</Label>
              <Input
                id="notes"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Ej: Consulta seguimiento mensual"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">
                {success}
              </p>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Vinculando…' : 'Vincular paciente'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {/* Lista de pacientes */}
      {patients.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h2 className="text-lg font-medium mb-2">Sin pacientes vinculados</h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Cuando vincules un paciente vas a poder ver sus evaluaciones y su
            progreso desde acá.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Vincular primer paciente
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <Link
              key={p.patientUserId}
              href={`/backoffice/patient/${p.patientUserId}`}
              className="block"
            >
              <Card className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {p.patientDisplayName ?? p.patientEmail ?? p.patientUserId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.patientEmail} ·{' '}
                      {p.evaluationsCount} {p.evaluationsCount === 1 ? 'evaluación' : 'evaluaciones'}
                      {p.lastEvaluationAt
                        ? ` · última ${new Date(p.lastEvaluationAt).toLocaleDateString('es-AR')}`
                        : ' · sin evaluaciones'}
                    </p>
                    {p.notes ? (
                      <p className="text-xs text-muted-foreground italic mt-1 truncate">
                        {p.notes}
                      </p>
                    ) : null}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
