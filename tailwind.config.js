/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Kedebideri", "sans-serif"],
      display: ["Kedebideri", "sans-serif"],
    },
    extend: {
      colors: {
        // The core dark background and text colors.
        // This replaces standard grays with the deep blue/purple tint from the image.
        // Use 950/900 for main backgrounds, 800/700 for UI cards/modals,
        // 400/300 for secondary text, and 50/100 for primary text.
        'base': {
          50: '#f5f7fa', // Very light text
          100: '#ebeef5',
          200: '#cfd7e6',
          300: '#aebcd4',
          400: '#8c9dbf',
          500: '#7183a6',
          600: '#58678c',
          700: '#455070', // Borders, lighter UI elements
          800: '#2c334a', // App interface cards/sidebars
          900: '#1a1d2e', // Main app background
          950: '#0d0f1a', // Deepest background (hero section)
        },

        // Accent Color 1: The vibrant pink from the start of the gradient.
        // Used for the "Join waitlist" button and gradient text.
        'accent-pink': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6', // Core pink color
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724',
        },

        // Accent Color 2: The bright violet from the end of the gradient.
        // Used in combination with pink for the brand feel.
        'accent-violet': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa', // Core violet color
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        // Functional Colors (pulled from the app interface screenshot)
        // For links, success states, errors, etc.
        'func-blue': { // "Team", "Linear" links
          DEFAULT: '#3b82f6',
          500: '#3b82f6',
        },
        'func-green': { // Success icons
          DEFAULT: '#22c55e',
          500: '#22c55e',
        },
        'func-red': { // "Urgent" tags
          DEFAULT: '#ef4444',
          500: '#ef4444',
        },
      }
    },
  },
  plugins: [],
}