import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

import { PublicHeader } from '@/components/layout/PublicHeader';
import { Toaster } from '@/components/ui/sonner';

/**
 * Tipografía pareada SomnoSalud v2.0 (Sprint UX polish 2026-06-11).
 *
 * - Inter (sans serif) → body, UI, forms.
 * - Fraunces (serif display) → H1 de hero, score numbers grandes,
 *   pull-quotes editoriales. Se aplica con className `font-display`.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
});

export const metadata: Metadata = {
  title: 'SomnoSalud — Evaluación de trastornos del sueño',
  description:
    'Plataforma médica digital para evaluación, diagnóstico orientativo y seguimiento de trastornos del sueño. Director médico: Dr. Pablo Ferrero (M.N. 119.783).',
  authors: [{ name: 'SomnoSalud Team' }],
  // robots: noindex hasta validación clínica externa + compliance pre-launch público.
  // Sprint 9+ revierte cuando esté listo para indexar.
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <PublicHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
