module.exports = {
  // Include root HTML and public assets so Tailwind doesn't purge classes
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './public/**/*.{html,js,json}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}