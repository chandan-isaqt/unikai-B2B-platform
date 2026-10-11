/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        unikai: {
          navy: '#0a2540',
          blue: '#0f4c81',
          sky: '#0284c7',
          gold: '#f59e0b',
          red: '#dc2626',
          green: '#059669',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
