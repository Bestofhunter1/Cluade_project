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
        primary: {
          bg: '#0D1117',
          card: '#161B22',
          text: '#E6EDF3',
          textMuted: '#8B949E',
          border: '#30363D',
          accent: '#58A6FF',
          accentHover: '#79B8FF',
          success: '#3FB950',
          warning: '#D29922',
          danger: '#F85149',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}