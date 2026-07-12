/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2775CA',
          soft: '#E6F1FB',
          dark: '#1E5EA8',
        },
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        hairline: '#E7E9EE',
        ink: '#1A1D23',
        muted: '#6B7280',
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
