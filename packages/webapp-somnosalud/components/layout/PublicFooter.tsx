import Link from 'next/link';

/**
 * PublicFooter — footer compartido de las paginas publicas (welcome,
 * about, privacidad, terms, disclaimer, 404).
 *
 * NO se usa en /eval/* porque esas pantallas tienen su propio
 * disclaimer reforzado en el layout y agregar mas links seria
 * distractor.
 *
 * Server Component (sin estado).
 */
export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border/40 py-8 print:hidden">
      <div className="container">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center text-xs text-muted-foreground sm:text-left">
            <p>
              <strong className="text-foreground/90">SomnoSalud</strong> ·
              Plataforma médica digital · Buenos Aires, Argentina
            </p>
            <p className="mt-1">
              Director médico responsable:{' '}
              <strong className="text-foreground/90">
                Dr. Pablo Ferrero — M.N. 119.783
              </strong>
            </p>
            <p className="mt-1 text-muted-foreground/80">
              Instituto Ferrero de Neurología y Sueño (IFN)
            </p>
          </div>
          <nav
            aria-label="Links públicos"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
          >
            <Link
              href="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sobre SomnoSalud
            </Link>
            <Link
              href="/privacidad"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Términos
            </Link>
            <Link
              href="/disclaimer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Disclaimer médico
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
