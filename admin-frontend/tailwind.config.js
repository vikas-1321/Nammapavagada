/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          light: '#2d6a4f',
          DEFAULT: '#1b4332',
          dark: '#081c15',
        },
        terracotta: {
          light: '#e07a5f',
          DEFAULT: '#c85a32',
          dark: '#9d3d19',
        },
        sand: {
          light: '#fdfbf7',
          DEFAULT: '#f4ede2',
          dark: '#e6dac8',
        },
        slate: {
          950: '#0a0f1d',
        }
      },
    },
  },
  plugins: [],
}
