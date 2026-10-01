/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-cream': '#F7F3EA',
        'forest-green': '#1F3A2E',
        'forest-green-dark': '#14271F',
        'forest-green-light': '#2D5242',
        'terracotta': '#C65D3A',
        'terracotta-dark': '#A84C2C',
        'terracotta-light': '#D97653',
        'earth-brown': '#7A5135',
        'earth-brown-light': '#946645',
        'soft-sand': '#E8DDCC',
        'soft-sand-dark': '#D8C7B0',
        'dark-text': '#1C1C1C',
        'muted-text': '#5A564F',
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        serif: [
          'Newsreader',
          'Georgia',
          'serif'
        ],
        kannada: [
          '"Noto Sans Kannada"',
          'system-ui',
          'sans-serif'
        ]
      },
      borderRadius: {
        'none': '0px',
        'sm': '0.25rem',
        DEFAULT: '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(31, 58, 46, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(31, 58, 46, 0.1), 0 1px 2px -1px rgba(31, 58, 46, 0.1)',
        md: '0 4px 6px -1px rgba(31, 58, 46, 0.08), 0 2px 4px -2px rgba(31, 58, 46, 0.06)',
        lg: '0 10px 15px -3px rgba(31, 58, 46, 0.08), 0 4px 6px -4px rgba(31, 58, 46, 0.04)',
        xl: '0 20px 25px -5px rgba(31, 58, 46, 0.08), 0 8px 10px -6px rgba(31, 58, 46, 0.04)',
        none: 'none',
      },
    },
  },
  plugins: [],
}
