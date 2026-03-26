/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: "#0b5cab",
          ink: "#0b1f33",
          gray: "#6b7280",
          line: "#e5e7eb",
          bg: "#f7f9fc"
        }
      }
    }
  },
  plugins: []
};

