/**
 * Sprint 9.F (2026-06-19) — Tests del wrapper Resend.
 *
 * Cubre el comportamiento sin SDK real (mock). Los 2 paths importantes:
 *  - `getResendClient` retorna null sin API key (no rompe la app).
 *  - `sendWelcomeEmail` / `sendResultsEmail` retornan `no-client` cuando
 *    no hay key y `no-from` cuando no hay sender.
 *
 * El smoke E2E real (mandar un email a Gmail y verificar que llega) queda
 * para Sprint 9.G cuando se conecte al flow real.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Resend wrapper — sin API key', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('getResendClient retorna null sin RESEND_API_KEY', async () => {
    const { getResendClient } = await import('@/lib/email/resend-client');
    expect(getResendClient()).toBeNull();
  });

  it('getFromAddress retorna null sin RESEND_FROM_EMAIL', async () => {
    const { getFromAddress } = await import('@/lib/email/resend-client');
    expect(getFromAddress()).toBeNull();
  });

  it('sendWelcomeEmail retorna reason no-client sin API key', async () => {
    const { sendWelcomeEmail } = await import('@/lib/email/send');
    const result = await sendWelcomeEmail({
      to: 'test@example.com',
      patientFirstName: 'Test',
      loginUrl: 'https://app.somnosalud.com.ar',
    });
    expect(result).toEqual({ ok: false, reason: 'no-client' });
  });

  it('sendResultsEmail retorna reason no-client sin API key', async () => {
    const { sendResultsEmail } = await import('@/lib/email/send');
    const result = await sendResultsEmail({
      to: 'test@example.com',
      patientFirstName: 'Test',
      evaluationDate: '2026-06-19',
      resultsUrl: 'https://app.somnosalud.com.ar/mis-resultados/abc',
    });
    expect(result).toEqual({ ok: false, reason: 'no-client' });
  });
});

describe('Resend wrapper — con API key pero sin RESEND_FROM_EMAIL', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test_dummy';
    delete process.env.RESEND_FROM_EMAIL;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('sendWelcomeEmail retorna reason no-from sin RESEND_FROM_EMAIL', async () => {
    const { sendWelcomeEmail } = await import('@/lib/email/send');
    const result = await sendWelcomeEmail({
      to: 'test@example.com',
      loginUrl: 'https://app.somnosalud.com.ar',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('no-from');
    }
  });

  it('sendResultsEmail retorna reason no-from sin RESEND_FROM_EMAIL', async () => {
    const { sendResultsEmail } = await import('@/lib/email/send');
    const result = await sendResultsEmail({
      to: 'test@example.com',
      patientFirstName: 'Test',
      evaluationDate: '2026-06-19',
      resultsUrl: 'https://app.somnosalud.com.ar/mis-resultados/abc',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('no-from');
    }
  });
});

describe('Templates rendering — no rompen el bundle', () => {
  it('renderWelcome produce HTML válido sin nombre', async () => {
    const { renderWelcome } = await import('@/lib/email/templates/welcome');
    const html = renderWelcome({
      loginUrl: 'https://app.somnosalud.com.ar',
    });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Hola,');
    expect(html).toContain('app.somnosalud.com.ar');
    expect(html).toContain('M.N. 119.783');
  });

  it('renderWelcome usa el nombre cuando se pasa', async () => {
    const { renderWelcome } = await import('@/lib/email/templates/welcome');
    const html = renderWelcome({
      patientFirstName: 'Maria',
      loginUrl: 'https://app.somnosalud.com.ar',
    });
    expect(html).toContain('Hola Maria,');
  });

  it('renderWelcome escapa HTML del nombre para evitar XSS', async () => {
    const { renderWelcome } = await import('@/lib/email/templates/welcome');
    const html = renderWelcome({
      patientFirstName: '<script>alert(1)</script>',
      loginUrl: 'javascript:alert(1)',
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('renderResultsSummary produce HTML válido', async () => {
    const { renderResultsSummary } = await import(
      '@/lib/email/templates/results-summary'
    );
    const html = renderResultsSummary({
      patientFirstName: 'Maria',
      evaluationDate: '19 de Junio de 2026',
      resultsUrl: 'https://app.somnosalud.com.ar/mis-resultados/abc',
    });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Maria');
    expect(html).toContain('19 de Junio de 2026');
    expect(html).toContain('orientativos');
  });
});
