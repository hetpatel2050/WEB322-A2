/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.html", "./public/**/*.js"], // Ensure Tailwind scans your HTML files
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["dim"], // Choose a theme (you can change it)
  },
};
