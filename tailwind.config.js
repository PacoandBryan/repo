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
          light: '#F5EBE6',
          dark: '#2C1810',
        },
        secondary: {
          DEFAULT: '#FECEC5',
          light: '#FDF8F6',
          dark: '#FAA094',
        },
        accent: {
          DEFAULT: '#2F6D9E',
          light: '#E8F1F8',
          dark: '#1D4B6E',
        },
        success: {
          DEFAULT: '#4CAF50',
          light: '#E8F5E9',
        },
        warning: {
          DEFAULT: '#FFC107',
          light: '#FFF8E1',
        },
        error: {
          DEFAULT: '#EF5350',
          light: '#FFEBEE',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        bounce: 'bounce 1s infinite',
        'slide-left': 'slide-left 0.3s ease-in-out',
        'slide-right': 'slide-right 0.3s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(0, 0, 0, 0.05)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};