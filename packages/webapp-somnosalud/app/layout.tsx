import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
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
    <html lang="es-AR" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
