/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10172A',      // deep navy-charcoal, headers/nav
        canvas: '#F7F8FA',   // cool off-white background
        amber: '#F5B942',    // primary accent
        teal: '#2DD4BF',     // reserved for match-score indicators
        slate: {
          650: '#4B5768',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
