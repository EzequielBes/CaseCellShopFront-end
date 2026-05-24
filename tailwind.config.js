/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creamy: {
          50: '#FDFBF7',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#E5E5E5',
          400: '#D4C4B7',
          500: '#A68A64',
          600: '#8E7356',
          700: '#755F47',
          800: '#5C4A38',
          900: '#433629',
        },
        charcoal: '#333333',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}

