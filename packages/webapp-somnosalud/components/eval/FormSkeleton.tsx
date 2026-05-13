import { Skeleton } from '@/components/ui/skeleton';

/**
 * FormSkeleton — placeholder mientras se hidrata sessionStorage en los
 * forms del flow de evaluacion.
 *
 * Reemplaza el patron repetido `<p>Cargando datos...</p>` en 12 forms
 * de /eval/*. Visualmente coherente con la estructura de cada form
 * (header + 2-3 fields + action button).
 *
 * Server Component (sin estado).
 */
export function FormSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando datos del formulario"
      className="space-y-4 rounded-lg border border-border/60 bg-card/40 p-6"
    >
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-2/3" />
      <div className="pt-2">
        <Skeleton className="h-11 w-40" />
      </div>
      <span className="sr-only">Cargando datos del formulario...</span>
    </div>
  );
}
