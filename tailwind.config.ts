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
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "#DC2626", // Brand Red
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1a1a1a", // Rich Black
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#B91C1C", // Darker Red for hover states
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        cream: "#fafafa",
        navy: "#1a2744",
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
