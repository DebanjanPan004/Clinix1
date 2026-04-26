/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F45B8C',
        deepPink: '#E6487A',
        rosePink: '#FF7FA5',
        background: '#FAD4DD',
        card: '#FFFFFF',
        container: '#F8F8F8',
        textPrimary: '#333333',
        textSecondary: '#666666',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(244, 91, 140, 0.15)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease forwards',
      },
    },
  },
  plugins: [],
}

