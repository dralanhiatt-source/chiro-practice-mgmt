/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#0D9488', 600: '#0D9488', 700: '#0f766e', 400: '#2dd4bf' },
      },
    },
  },
  plugins: [],
}
