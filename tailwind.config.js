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
        primary: '#FF7A00', // Vibrant Orange
        primaryHover: '#D84315', // Burnt Orange
        secondary: '#1A1A1A', // Dark Grey (Sections)
        accent: '#D84315', // Burnt Orange Red
        deepBlack: '#0B0B0B', // Main background
        darkGrey: '#1A1A1A', // Sections
        cardGrey: '#222222', // Cards
        softGrey: '#B5B5B5', // Text
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
