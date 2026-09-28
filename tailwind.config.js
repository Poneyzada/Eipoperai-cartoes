/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0d0d11',
        'surface-elevated': '#16161c',
        border: '#28241e',
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          metallic: '#d4af37',
          deep: '#996515',
        },
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d4af37 0%, #f59e0b 50%, #996515 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)',
        'black-gold': 'linear-gradient(180deg, #0d0d10 0%, #17140e 100%)',
      }
    },
  },
  plugins: [],
}
