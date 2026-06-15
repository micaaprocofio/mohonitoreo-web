/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#14b8a6',
          tealDark: '#0f766e',
          slate: '#1e293b',
          slateDark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
