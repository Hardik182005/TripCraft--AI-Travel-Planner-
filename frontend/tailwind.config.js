/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#0E1117",
        card: "#1C1F26",
        lightCard: "#F5F5F5",
        accent: {
          blue: "#4F8CFF",
          purple: "#7B61FF",
        }
      },
      fontFamily: {
        heading: ["'Playfair Display'", "serif"],
        body: ["Inter", "sans-serif"],
      }
    },
  },
  plugins: [],
}
