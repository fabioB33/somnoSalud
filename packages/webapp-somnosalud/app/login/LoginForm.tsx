'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { LoginActionResult, signInWithOtp } from './actions';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
          Enviando link…
        </>
      ) : (
        'Enviame el link'
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState<LoginActionResult | null, FormData>(
    signInWithOtp,
    null,
  );
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);

  const trimmedEmail = email.trim();
  const isValidEmail = EMAIL_PATTERN.test(trimmedEmail);
  const showEmailHint = touched && trimmedEmail.length > 0 && !isValidEmail;

  // SUCCESS STATE — card grande con icon Mail
  if (state?.ok) {
    return (
      <div
        className="rounded-lg border border-green-500/30 bg-green-500/10 p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-full bg-green-500/20">
          <CheckCircle2
            className="size-7 text-green-400"
            aria-hidden="true"
          />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          ¡Listo! Revisá tu email.
        </h2>
        <p className="mb-1 text-sm text-muted-foreground">
          Te enviamos un link de acceso a:
        </p>
        <p className="mb-4 break-all text-sm font-medium text-foreground">
          {state.email}
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Hacé click en el botón del email para entrar. El link es válido por
          <strong className="text-foreground"> 1 hora</strong>.
        </p>
        <p className="rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          <strong className="text-foreground">¿No te llegó?</strong> Puede
          demorar hasta 2 minutos. Si no aparece, revisá la carpeta de{' '}
          <strong className="text-foreground">Spam / Correo no deseado</strong>.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 text-xs font-medium text-somno-accent underline hover:text-somno-accent/80"
        >
          Usar otro email
        </button>
      </div>
    );
  }

  // FORM STATE
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu.email@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-describedby={
            showEmailHint
              ? 'email-hint'
              : state?.ok === false
                ? 'login-error'
                : 'email-help'
          }
          aria-invalid={showEmailHint || state?.ok === false}
        />
        {showEmailHint && (
          <p id="email-hint" className="text-xs text-amber-500">
            Ese email no parece válido. Revisá el formato.
          </p>
        )}
      </div>

      {state?.ok === false && (
        <p
          id="login-error"
          className="text-sm text-red-500"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <SubmitButton disabled={!isValidEmail} />

      <p
        id="email-help"
        className="flex items-start gap-2 text-xs text-muted-foreground"
      >
        <Mail
          className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <span>
          Si no llega en 2 minutos, revisá la carpeta de{' '}
          <strong className="text-foreground">Spam</strong>. No usamos
          contraseñas — el link te autentica con un click.
        </span>
      </p>
    </form>
  );
}
