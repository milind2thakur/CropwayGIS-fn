import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        panel: 'var(--panel)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        moss: 'var(--moss)',
        mossSoft: 'var(--moss-soft)',
        mossPale: 'var(--moss-pale)',
        wheat: 'var(--wheat)',
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
