'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';

interface ScoreRevealProps {
  /** Score final (entero). El componente anima de 0 a este valor. */
  value: number;
  /** Score máximo posible (e.g. 28 para ISI). Usado para opcional /max suffix. */
  max?: number;
  /** Si true, muestra "X/max" en lugar de solo el number. Default false. */
  showMax?: boolean;
  /** Duración en segundos. Default 1.4. */
  duration?: number;
  /** Variant visual del number. */
  variant?: 'accent' | 'warm' | 'foreground';
  className?: string;
}

/**
 * Score reveal animado — el number cuenta de 0 al value final con spring smooth.
 *
 * Usa Fraunces display + tamaño grande para impacto emocional. Variants:
 * - accent (purpura cool): info clínica, scores neutros.
 * - warm (gold): insights, scores favorables.
 * - foreground: total neutro.
 *
 * Respeta prefers-reduced-motion: muestra el value final directo sin animar.
 *
 * Ejemplo:
 *   <ScoreReveal value={isiResult.totalScore} max={28} showMax variant="accent" />
 */
export function ScoreReveal({
  value,
  max,
  showMax = false,
  duration = 1.4,
  variant = 'accent',
  className,
}: ScoreRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: shouldReduceMotion ? 0 : duration * 1000,
    bounce: 0.15,
  });
  const display = useTransform(spring, (latest) => Math.round(latest).toString());

  useEffect(() => {
    if (shouldReduceMotion) {
      motionValue.set(value);
      return;
    }
    // Pequeño delay para que el observer note el rendering inicial.
    const timeout = setTimeout(() => motionValue.set(value), 100);
    return () => clearTimeout(timeout);
  }, [value, shouldReduceMotion, motionValue]);

  const variantClass =
    variant === 'warm'
      ? 'text-somno-warm drop-shadow-[0_0_24px_rgba(231,201,137,0.35)]'
      : variant === 'foreground'
      ? 'text-foreground'
      : 'text-somno-accent drop-shadow-[0_0_24px_rgba(129,140,248,0.40)]';

  return (
    <div className={cn('inline-flex items-baseline gap-2', className)}>
      <motion.span
        className={cn(
          'font-display font-normal leading-none tabular-nums',
          'text-7xl md:text-8xl',
          variantClass,
        )}
        aria-label={
          showMax && max != null
            ? `Resultado: ${value} sobre ${max}`
            : `Resultado: ${value}`
        }
      >
        {display}
      </motion.span>
      {showMax && max != null && (
        <span className="font-display text-3xl text-muted-foreground/70 md:text-4xl">
          / {max}
        </span>
      )}
    </div>
  );
}
