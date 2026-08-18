/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        white: {
          50:  "#ffffff",
          100: "#fcfcfc",
          200: "#f7f7f7",
          300: "#f0f0f0",
          400: "#e6e6e6",
          500: "#dddddd",
          600: "#cfcfcf",
          700: "#b8b8b8",
          800: "#9e9e9e",
          900: "#7a7a7a",
        },
      },
    }
  },
  plugins: [],
}