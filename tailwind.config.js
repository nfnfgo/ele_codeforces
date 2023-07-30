/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      'primary': '#0ea5e9',
      'secondary': '#7dd3fc',
      'fgcolor': '#f8fafc',
      'fgcolor-dark': '#1e293b',
      'bgcolor': '#e2e8f0',
      'bgcolor-dark': '#020617',
      'white': '#f8fafc',
      'red': '#dc2626',
      'red-light': '#f87171',
      'black': '#020617',
    },
    extend: {},
  },
  plugins: [],
}

