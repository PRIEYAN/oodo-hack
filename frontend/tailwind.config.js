/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2775CA', // USDC blue
          soft: '#E6F1FB',
          dark: '#1E5EA8',
        },
        // deep navy full-bleed band (fintech-trustworthy)
        navy: {
          DEFAULT: '#0A1E3F',
          soft: '#0E2A54',
        },
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        hairline: '#E4E7EC',
        ink: '#0B1220',
        muted: '#6B7280',
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
