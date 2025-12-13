/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      padding: {
        DEFAULT: '15px',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '960px',
      xl: '1280px',
    },
    extend: {
      fontFamily: {
        bangers: [`var(--font-bangers)`, 'sans-serif'],
        quicksand: [`var(--font-quicksand)`, 'sans-serif'],
        robotoCondensed: [`var(--font-robotoCondensed)`, 'sans-serif'],
      },
      colors: {
        primary: '#E10600', // Fire Red
        primaryHover: '#B00000', // Lava Red
        secondary: '#FF6A00', // Flame Orange
        accent: '#FF8C1A', // Ember Orange
        jetBlack: '#0B0B0B', // Main background
        charcoalBlack: '#151515', // Navbar
        softBlack: '#1F1F1F', // Cards
        ashWhite: '#F5F5F5', // Text
        smokeGray: '#9CA3AF', // Muted text
        cardBorder: '#2A2A2A', // Card Border
        white: '#FFFFFF',
      },
      backgroundImage: {
        pattern: "none", // Removing the old light pattern
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
