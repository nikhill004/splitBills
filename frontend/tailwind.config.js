/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#000000',
          card: '#111111',
          border: '#333333',
          text: '#ffffff',
          muted: '#888888'
        }
      }
    },
  },
  plugins: [],
}