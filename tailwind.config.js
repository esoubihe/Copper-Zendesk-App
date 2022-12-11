/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./assets/*.html"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
