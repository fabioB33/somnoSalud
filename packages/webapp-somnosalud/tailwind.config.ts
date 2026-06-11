import type { Config } from 'tailwindcss';

/**
 * SomnoSalud Design Tokens v2.0 (UX polish 2026-06-11).
 *
 * Paleta extendida con dual-accent (purple cool + gold warm) + elevations
 * canónicas + easing curves + glass utilities + tipografía pareada.
 *
 * Origen del polish: feedback Pablo Ferrero (Director médico) sobre la
 * UX/UI plana del scaffold. Diseñado con principios:
 *   - Profundidad: glass morphism sutil + mesh background.
 *   - Jerarquía emocional: dual-accent (cool = info clínica, warm = CTA / insight).
 *   - Tipografía: Fraunces display serif para H1/H2 + Inter sans para body.
 *   - Motion: easing curves canónicas para Framer Motion.
 *
 * Si en algún momento existe `@somnosalud/shared-ui`, estos tokens migran allá.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // ─── Paleta SomnoSalud v2.0 ──────────────────────────────────────
        somno: {
          // Fondos: gradient base (v1) + 2 capas mesh
          'bg-from': '#0f0f1e',          // más profundo que v1 #1a1a2e
          'bg-to': '#171830',
          'bg-deep': '#0a0a18',           // capa más profunda para CTA inverted
          // Cool accent: purpura (info clínica, primary actions, badges)
          accent: '#818cf8',
          'accent-hover': '#6366f1',
          'accent-soft': '#a5b4fc',
          'accent-glow': 'rgba(129, 140, 248, 0.18)',  // para shadows/glows
          // Warm accent NUEVO: gold (insights, score reveal, CTA cálidas)
          warm: '#e7c989',                // golden lifestyle, anti-clinical alarm
          'warm-hover': '#d4b46e',
          'warm-soft': '#f3dfb6',
          'warm-glow': 'rgba(231, 201, 137, 0.20)',
          // Estados tints (con alpha, para fondos suaves de badges/cards)
          'tint-info': 'rgba(129, 140, 248, 0.10)',
          'tint-warn': 'rgba(231, 201, 137, 0.12)',
          'tint-success': 'rgba(110, 200, 154, 0.10)',
          'tint-danger': 'rgba(244, 114, 114, 0.10)',
        },
        // ─── Tokens shadcn/ui (HSL via globals.css) ──────────────────────
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ─── Tipografía pareada (Inter body + Fraunces display) ──────────
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },

      // ─── Elevations canónicas (shadow scale para profundidad) ────────
      boxShadow: {
        // Layered shadows estilo Refactoring UI — combinan blur + offset
        'somno-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.30)',
        'somno-md':
          '0 4px 6px -1px rgba(0, 0, 0, 0.30), 0 2px 4px -2px rgba(0, 0, 0, 0.20)',
        'somno-lg':
          '0 10px 15px -3px rgba(0, 0, 0, 0.40), 0 4px 6px -4px rgba(0, 0, 0, 0.30)',
        'somno-xl':
          '0 20px 25px -5px rgba(0, 0, 0, 0.50), 0 8px 10px -6px rgba(0, 0, 0, 0.40)',
        // Glows accent (para CTA + score reveal)
        'glow-accent': '0 0 32px rgba(129, 140, 248, 0.35)',
        'glow-warm': '0 0 32px rgba(231, 201, 137, 0.40)',
        // Inner highlights (top edge de glass cards)
        'inset-top': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },

      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },

      // ─── Background images: gradient + mesh ──────────────────────────
      backgroundImage: {
        'somno-gradient':
          'linear-gradient(135deg, #0f0f1e 0%, #171830 100%)',
        // Mesh gradient: 3 radial-gradients superpuestos (no animados, sutiles)
        'somno-mesh':
          'radial-gradient(at 20% 0%, rgba(129, 140, 248, 0.13) 0%, transparent 50%), ' +
          'radial-gradient(at 80% 100%, rgba(231, 201, 137, 0.08) 0%, transparent 55%), ' +
          'radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.06) 0%, transparent 65%)',
        // Hero spotlight
        'somno-spotlight':
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(129, 140, 248, 0.20) 0%, transparent 70%)',
      },

      // ─── Animations + easing curves para Framer Motion ───────────────
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // Mesh slow drift (background ambient)
        'mesh-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(10px, -10px) scale(1.05)' },
        },
        // Score reveal stagger
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        // Pulse glow for CTA hint
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 24px rgba(129, 140, 248, 0.30)',
          },
          '50%': {
            boxShadow: '0 0 36px rgba(129, 140, 248, 0.50)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'mesh-drift': 'mesh-drift 12s ease-in-out infinite',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },

      // ─── Transition timing functions canónicas ───────────────────────
      transitionTimingFunction: {
        'somno-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'somno-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
