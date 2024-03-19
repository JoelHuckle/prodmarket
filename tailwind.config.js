/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: "300px",
      },
      colors: {
        primary: "#F8FAFC",
        "secondary-100": "#94A2B8",
        "secondary-200": "#1E293B",
        "accent-100": "#3C82F6",
        "accent-200": "#3477E0",
        "dark-100": "#020817",
        "dark-200": "#081A42",
        background: "#020817",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
    },
    plugins: [],
  },
};
