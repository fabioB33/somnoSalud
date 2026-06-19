import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

import {
  loadPatientDetail,
  requireClinicianOrRedirect,
} from '@/app/backoffice/actions';
import { Card } from '@/components/ui/card';

/**
 * Sprint 12 (2026-06-19) — Detalle de paciente (backoffice clinician).
 *
 * Solo accesible si user.role === 'clinician'/'admin' Y existe link activo
 * con este paciente. RLS de clinician_links + evaluations valida ambos.
 */
export default async function PatientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireClinicianOrRedirect();
  const detail = await loadPatientDetail(params.id);

  if (!detail) {
    notFound();
  }

  const { profile, evaluations } = detail;
  const displayName = profile.displayName ?? profile.email ?? profile.id.slice(0, 8);

  return (
    <main className="min-h-dvh">
      <div className="container max-w-3xl py-8 md:py-12 space-y-6">
        <Link
          href="/backoffice"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a mis pacientes
        </Link>

        <div>
          <h1 className="text-3xl md:text-4xl font-serif">{displayName}</h1>
          {profile.email ? (
            <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
          ) : null}
        </div>

        <section>
          <h2 className="text-lg font-medium mb-3">
            Evaluaciones ({evaluations.length})
          </h2>

          {evaluations.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Este paciente todavía no completó ninguna evaluación.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {evaluations.map((e) => (
                <Card key={e.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {e.completedAt
                          ? new Date(e.completedAt).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })
                          : `Creada ${new Date(e.createdAt).toLocaleDateString('es-AR')}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estado: {translateStatus(e.status)}
                      </p>
                    </div>
                  </div>
                  {/* Resumen del snapshot si está disponible */}
                  {e.resultsSnapshot ? <ResultsSummary snapshot={e.resultsSnapshot} /> : null}
                </Card>
              ))}
            </div>
          )}
        </section>

        <Card className="p-4 bg-muted/30 text-xs text-muted-foreground">
          <p>
            <strong>Compliance:</strong> Tu acceso a estas evaluaciones está
            registrado en el audit log (Ley 25.326). El paciente puede revocar
            la vinculación en cualquier momento.
          </p>
        </Card>
      </div>
    </main>
  );
}

function translateStatus(s: string): string {
  if (s === 'completed') return 'Completada';
  if (s === 'in_progress') return 'En progreso';
  if (s === 'abandoned') return 'Abandonada';
  return s;
}

interface SnapshotShape {
  complete?: boolean;
  isi?: { score?: number; severity?: string };
  phq9?: { score?: number; severity?: string };
  gad7?: { score?: number; severity?: string };
  stopBang?: { score?: number; risk?: string };
  risk?: { level?: string };
}

function ResultsSummary({ snapshot }: { snapshot: unknown }) {
  const s = snapshot as SnapshotShape | null;
  if (!s || !s.complete) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      {s.isi?.score !== undefined ? (
        <div>
          <p className="text-muted-foreground">ISI</p>
          <p className="font-medium">
            {s.isi.score} ({s.isi.severity})
          </p>
        </div>
      ) : null}
      {s.phq9?.score !== undefined ? (
        <div>
          <p className="text-muted-foreground">PHQ-9</p>
          <p className="font-medium">
            {s.phq9.score} ({s.phq9.severity})
          </p>
        </div>
      ) : null}
      {s.gad7?.score !== undefined ? (
        <div>
          <p className="text-muted-foreground">GAD-7</p>
          <p className="font-medium">
            {s.gad7.score} ({s.gad7.severity})
          </p>
        </div>
      ) : null}
      {s.stopBang?.score !== undefined ? (
        <div>
          <p className="text-muted-foreground">STOP-BANG</p>
          <p className="font-medium">
            {s.stopBang.score} ({s.stopBang.risk})
          </p>
        </div>
      ) : null}
    </div>
  );
}
