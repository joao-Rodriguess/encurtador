/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        surface: '#12121a',
        surfaceHover: '#1a1a24',
        accent: '#6366f1',
        accentHover: '#4f46e5',
        textMain: '#e2e8f0',
        textMuted: '#94a3b8',
        borderC: '#2e2e38',
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
