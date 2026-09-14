/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14171F',
          800: '#1D2130',
          600: '#333850',
          400: '#5B6180',
        },
        paper: '#F6F5F1',
        line: '#DEDCD3',
        signal: {
          DEFAULT: '#2A4CE0',
          600: '#2340C4',
          50: '#EAEEFC',
        },
        ember: {
          DEFAULT: '#E2712B',
          50: '#FCEEE3',
        },
        ok: '#1E8A5F',
        warn: '#C4441E',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
        control: '8px',
      },
      boxShadow: {
        elevate: '0 12px 24px -12px rgba(20, 23, 31, 0.25)',
      },
    },
  },
  plugins: [],
};
