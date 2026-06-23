import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bffc",
          400: "#819cf8",
          500: "#6175f3",
          600: "#4f56e7",
          700: "#4143cc",
          800: "#3537a4",
          900: "#2f3282",
          950: "#1c1d4d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
