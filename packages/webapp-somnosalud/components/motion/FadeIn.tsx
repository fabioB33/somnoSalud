'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  /** Delay en segundos antes de iniciar. Default 0. */
  delay?: number;
  /** Direction de la entrada. Default 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distancia px de translate inicial. Default 12. */
  distance?: number;
  /** Duración en segundos. Default 0.5. */
  duration?: number;
  className?: string;
  /** Si true, anima solo cuando entra al viewport. Default false (on mount). */
  whenInView?: boolean;
}

/**
 * Primitivo de animación fade-in + translate suave.
 *
 * Respeta `prefers-reduced-motion` via `useReducedMotion` — los users con
 * sensibilidad ven el contenido sin animación (snap directo al estado final).
 *
 * Usa easing canónica `cubic-bezier(0.16, 1, 0.3, 1)` (somno-out).
 *
 * Ejemplos:
 *   <FadeIn>...</FadeIn>                     // fade-up básico
 *   <FadeIn delay={0.15}>...</FadeIn>        // stagger manual
 *   <FadeIn direction="left">...</FadeIn>    // slide from right
 *   <FadeIn whenInView>...</FadeIn>          // anima al scroll
 */
export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  distance = 12,
  duration = 0.5,
  className,
  whenInView = false,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  const initialOffset =
    direction === 'none'
      ? { x: 0, y: 0 }
      : direction === 'up'
      ? { x: 0, y: distance }
      : direction === 'down'
      ? { x: 0, y: -distance }
      : direction === 'left'
      ? { x: distance, y: 0 }
      : { x: -distance, y: 0 };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...initialOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const motionProps = whenInView
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '0px 0px -10% 0px' },
      }
    : {
        initial: 'hidden',
        animate: 'visible',
      };

  return (
    <motion.div className={className} variants={variants} {...motionProps}>
      {children}
    </motion.div>
  );
}
