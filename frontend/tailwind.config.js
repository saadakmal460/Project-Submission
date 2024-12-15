/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Add Poppins font
      },
      colors: {
        // Add any custom colors here if needed
        "custom-green": '#068D9D', // Example of a custom blue
        "hover-green" : 'rgb(6 103 114)'
      },
    },
  },
  plugins: [],
}
