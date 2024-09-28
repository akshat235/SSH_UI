/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6497b1',
        secondary: '#c7d5e0', 
        gray: {
          300: '#d1d5db', 
        },
        white: '#ffffff',  
      },
    },
  },
  plugins: [],
}

