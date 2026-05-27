import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Surface & Structure ───────────────────────────────────────
        canvas: 'var(--canvas)',
        panel: 'var(--panel)',
        surface: 'var(--surface)',
        white: 'var(--white)',

        // ── Borders & Lines ───────────────────────────────────────────
        line: 'var(--line)',
        lineLight: 'var(--line-light)',
        lineSoft: 'var(--line-soft)',

        // ── Ink (Text) ────────────────────────────────────────────────
        ink: 'var(--ink)',
        inkBase: 'var(--ink-base)',
        inkDark: 'var(--ink-dark)',
        muted: 'var(--muted)',

        // ── Brand Green ───────────────────────────────────────────────
        moss: 'var(--moss)',
        mossSoft: 'var(--moss-soft)',
        mossPale: 'var(--moss-pale)',
        wheat: 'var(--wheat)',
        greenLight: 'var(--green-light)',
        greenLightHover: 'var(--green-light-hover)',
        greenLightActive: 'var(--green-light-active)',
        greenNormal: 'var(--green-normal)',
        greenNormalHover: 'var(--green-normal-hover)',
        greenNormalActive: 'var(--green-normal-active)',
        greenDark: 'var(--green-dark)',
        greenDarkHover: 'var(--green-dark-hover)',
        greenDarkActive: 'var(--green-dark-active)',
        greenDarker: 'var(--green-darker)',

        // ── Accent Greens ─────────────────────────────────────────────
        greenMuted: 'var(--green-muted)',
        greenPale: 'var(--green-pale)',

        // ── Brand Yellow ──────────────────────────────────────────────
        yellowLight: 'var(--yellow-light)',
        yellowLightHover: 'var(--yellow-light-hover)',
        yellowLightActive: 'var(--yellow-light-active)',
        yellowNormal: 'var(--yellow-normal)',
        yellowNormalHover: 'var(--yellow-normal-hover)',
        yellowNormalActive: 'var(--yellow-normal-active)',
        yellowDark: 'var(--yellow-dark)',
        yellowDarkHover: 'var(--yellow-dark-hover)',
        yellowDarkActive: 'var(--yellow-dark-active)',
        yellowDarker: 'var(--yellow-darker)',

        // ── Semantic / Status ─────────────────────────────────────────
        warning: 'var(--warning)',

        // ── Neutral UI ────────────────────────────────────────────────
        iconNeutral: 'var(--icon-neutral)',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 80px rgba(28, 48, 18, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
