/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: "#FFCC00", // EU flag yellow
      },
      // Other theme extensions might be here
    },
  },
  plugins: [
    // Your plugins might be here
  ],
} 