/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        card: '#18181b', 
        border: '#27272a',
        primary: '#fafafa',
        muted: '#a1a1aa'
      }
    },
  },
  plugins: [],
}