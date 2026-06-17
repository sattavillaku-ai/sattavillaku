import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#1a2744", // Navy
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#c9a84c", // Gold
          foreground: "#1a2744",
        },
        accent: {
          DEFAULT: "#8b1a1a", // Crimson
          foreground: "#ffffff",
        },
        cream: "#faf8f3",
      },
      fontFamily: {
        serif: ["var(--font-noto-serif-tamil)", "serif"],
        sans: ["var(--font-noto-sans-tamil)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
