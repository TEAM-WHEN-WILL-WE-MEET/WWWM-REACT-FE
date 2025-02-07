/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
content: ["./src/**/*.{js,jsx,ts,tsx}"],
important: "#__next",
  theme: {
    extend: {
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
      }, 
     },
  },
  plugins: [],
}

