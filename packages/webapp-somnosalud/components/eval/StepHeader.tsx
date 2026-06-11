import { cn } from '@/lib/utils';

interface StepHeaderProps {
  /** Número de paso visible. e.g. 1, 2, 3... */
  step: number;
  /** Total de pasos (default 12). */
  total?: number;
  /** Título del paso (h1). */
  title: string;
  /** Subtítulo opcional (descripción del paso). */
  description?: string;
  /** Override del eyebrow label. Default "Paso X de Y". */
  eyebrow?: string;
  className?: string;
}

/**
 * Header consistente para todos los pasos del flow /eval/*.
 *
 * Sprint UX polish 2026-06-11: estandariza chrome del header con
 * progress indicator visual + font-display H1 + jerarquía clara.
 *
 * Compliance preservada: no toca el DisclaimerBanner (Capa 2 ADR-003,
 * está en el layout segmentation).
 */
export function StepHeader({
  step,
  total = 12,
  title,
  description,
  eyebrow,
  className,
}: StepHeaderProps) {
  const progress = Math.min(100, Math.round((step / total) * 100));

  return (
    <header className={cn('mb-8', className)}>
      <div className="mb-3 flex items-center gap-3">
        <span className="badge-tint-info inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider">
          {eyebrow ?? `Paso ${step} de ${total}`}
        </span>
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de la evaluación: ${progress}%`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-somno-accent to-somno-accent-soft transition-[width] duration-700 ease-somno-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
          {progress}%
        </span>
      </div>

      <h1 className="font-display text-4xl font-normal leading-[1.1] tracking-tight md:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </header>
  );
}
