/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,jsx}', // looks for Tailwind classes in all React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
