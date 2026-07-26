import type { Config } from "tailwindcss";

// Wise Design System tokens — Dekat Warung
// Source of truth: design.md §2
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        lime: {
          DEFAULT: "#9fe870", // Brand Primary CTA
          hover: "#cdffad", // Hover/Pressed
          pale: "#e2f6d5", // Soft green badge bg
        },
        // Ink scale
        ink: {
          DEFAULT: "#0e0f0c", // Near-black headlines / body / dark cards
          deep: "#163300", // Forest — text on positive surfaces
        },
        // Canvas
        canvas: {
          soft: "#e8ebe6", // Sage page background
          pure: "#ffffff", // White card
        },
        // Text
        body: "#454745",
        mute: "#868685",
        // States
        positive: {
          DEFAULT: "#2ead4b",
          deep: "#054d28",
        },
        warning: "#ffd11a",
        negative: "#d03238",
      },
      borderRadius: {
        // Canonical 24px pill geometry for cards + primary CTAs
        pill: "24px",
      },
      fontFamily: {
        sans: ["Inter", "Wise Sans", "system-ui", "sans-serif"],
      },
      fontWeight: {
        black: "900",
      },
    },
  },
  plugins: [],
};

export default config;
