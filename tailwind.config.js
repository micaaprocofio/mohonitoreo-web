/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Accent / primary brand color
          accent: '#0f766e',
          accentLight: 'rgba(15,118,110,0.10)',

          // Status colors
          ok: '#2f8f5b',
          okLight: 'rgba(47,143,91,0.10)',
          warning: '#b8791f',
          warningLight: 'rgba(184,121,31,0.12)',
          danger: '#c0413a',
          dangerLight: 'rgba(192,65,58,0.10)',

          // Data colors
          warm: '#c2703f',  // temperature

          // Ink / neutral
          ink: '#17191e',
          muted: '#8a8f99',
          subtle: '#565a63',
          placeholder: '#a4a9b2',

          // Surfaces
          bg: '#e8e9ec',
          surface: '#ffffff',
          surfaceMid: '#fafbfc',
          border: '#e6e7ea',
          borderStrong: '#d8dade',

          // Table/section
          rowHover: '#f6f7f8',
          headerBg: '#f4f5f6',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 12px 40px -16px rgba(20,22,28,0.22)',
        panel: '0 10px 30px -16px rgba(20,22,28,0.18)',
      },
      borderRadius: {
        card: '14px',
        xl: '16px',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        pulse: 'pulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
