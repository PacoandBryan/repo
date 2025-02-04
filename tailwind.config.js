/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Comfortaa', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#483434',
          light: '#CFF6EE',
        },
        secondary: {
          DEFAULT: '#FECEC5',
          dark: '#B8AB80',
        },
        accent: '#2F6D9E',
      },
    },
  },
  plugins: [],
};