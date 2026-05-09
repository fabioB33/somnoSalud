/**
 * ProgressBar — barra de progreso para flow de evaluacion.
 *
 * Server Component (sin estado). Renderiza "Paso N de M" + barra visual
 * con `role="progressbar"` + aria attrs (accesibilidad WCAG 2.1 A).
 *
 * @see docs/vault/concepts/CONVENCIONES-FRONTEND-WEBAPP.md §5
 */
export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label?: string;
}) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wider">
          {label ?? `Paso ${current} de ${total}`}
        </span>
        <span aria-hidden="true">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label ?? `Progreso: paso ${current} de ${total}`}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40"
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
