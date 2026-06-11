'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface StaggerProps {
  children: ReactNode;
  /** Delay entre hijos consecutivos en segundos. Default 0.08. */
  delayChildren?: number;
  /** Delay inicial antes del primer hijo. Default 0. */
  initialDelay?: number;
  className?: string;
  as?: 'div' | 'ul' | 'section' | 'article';
}

interface StaggerItemProps {
  children: ReactNode;
  /** Direction de la entrada. Default 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distancia px del translate inicial. Default 16. */
  distance?: number;
  className?: string;
}

/**
 * Container que orquesta animación stagger en sus hijos `<StaggerItem>`.
 *
 * Sprint UX polish 2026-06-11: separamos `StaggerItem` como export distinto
 * (no propiedad de Stagger) para que React Server Components serialice
 * correctamente el client reference (fix de bug `Could not find module
 * #Stagger#Item` en prerender de Next 14).
 *
 * Cada Item entra con fade + translate, con delay incremental controlado
 * por `delayChildren`. Respeta `prefers-reduced-motion`.
 *
 * Ejemplo:
 *   <Stagger delayChildren={0.1}>
 *     <StaggerItem>Card A</StaggerItem>
 *     <StaggerItem>Card B</StaggerItem>
 *     <StaggerItem>Card C</StaggerItem>
 *   </Stagger>
 *
 * Compat backwards: `Stagger.Item` también funciona (alias de StaggerItem)
 * porque algunos pages ya lo usan así.
 */
export function Stagger({
  children,
  delayChildren = 0.08,
  initialDelay = 0,
  className,
  as = 'div',
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: shouldReduceMotion ? 0 : initialDelay,
        staggerChildren: shouldReduceMotion ? 0 : delayChildren,
      },
    },
  };

  const Component =
    as === 'ul'
      ? motion.ul
      : as === 'section'
      ? motion.section
      : as === 'article'
      ? motion.article
      : motion.div;

  return (
    <Component
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  direction = 'up',
  distance = 16,
  className,
}: StaggerItemProps) {
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

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...initialOffset,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

