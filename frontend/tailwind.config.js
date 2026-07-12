/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2775CA',
          soft: 'rgb(var(--brand-soft) / <alpha-value>)',
          dark: '#1E5EA8',
        },
        // deep navy full-bleed band — goes near-black in dark mode
        navy: {
          DEFAULT: 'rgb(var(--navy) / <alpha-value>)',
          soft: 'rgb(var(--navy-soft) / <alpha-value>)',
        },
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        hairline: 'rgb(var(--hairline) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
      },
      borderRadius: {
        card: '10px',
        control: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
