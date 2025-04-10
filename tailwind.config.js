module.exports = {
  content: ["./*.html", "./views/**/*.ejs", "./public/css/**/*.css", "./public/js/**/*.js"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["light"],  // Choose a theme (you can change it)
  },
};
