import { cn } from '@/lib/utils';

/**
 * Skeleton — placeholder de loading state.
 *
 * Sprint 8.7: reemplaza los `<p>Cargando datos...</p>` repetidos en
 * todos los forms /eval/* con un placeholder visual coherente.
 *
 * Server Component (sin estado). Usa Tailwind `animate-pulse` que se
 * desactiva automaticamente con `prefers-reduced-motion: reduce`
 * (regla CSS global en globals.css).
 *
 * Uso tipico:
 * ```tsx
 * if (!hydrated) {
 *   return (
 *     <div className="space-y-3">
 *       <Skeleton className="h-10 w-full" />
 *       <Skeleton className="h-10 w-3/4" />
 *     </div>
 *   );
 * }
 * ```
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn('animate-pulse rounded-md bg-muted/40', className)}
      {...props}
    />
  );
}
