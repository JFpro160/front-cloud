/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}', // Incluye todos los archivos en la carpeta "app"
    './components/**/*.{js,jsx,ts,tsx}', // Incluye los componentes si están separados
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
