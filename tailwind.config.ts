import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/react/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4a7c59",
          dark: "#3d6449",
          light: "#6b9b7a",
        },
        secondary: {
          DEFAULT: "#8b6f47",
          light: "#a58763",
        },
        accent: "#d97706",
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f5f5f4",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
