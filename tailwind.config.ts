import type { Config } from "tailwindcss";

const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

const config: Config = {
  mode: "jit",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable dark mode using the 'class' strategy
  theme: {
    extend: {
      colors: {
        trueGray: colors.neutral, // Customize trueGray to neutral
        'light-blue': '#90E0EF', // Define the custom light blue color
      },
      borderRadius: {
        'xl': '1rem', // Custom border radius for rounded edges
      },
      boxShadow: {
        'custom-lg': '0 4px 12px rgba(0, 0, 0, 0.1)', // Custom shadow
      },
    },
    fontFamily: {
      sans: ["Inter", ...defaultTheme.fontFamily.sans], // Custom font
      stock: [defaultTheme.fontFamily.sans], // Fallback to default sans-serif font
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

export default config;
