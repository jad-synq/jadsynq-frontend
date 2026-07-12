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
        ink: {
          DEFAULT: "#142720",
          soft: "#2b4238",
        },
        paper: {
          DEFAULT: "#F2F7F1",
          raised: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#0E7C4A",
          deep: "#0A5C37",
        },
        gold: {
          DEFAULT: "#E8A73B",
          deep: "#B87F1F",
        },
        signal: "#C9432F",
        line: "#D7E2D6",
        muted: "#5B6E64",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "Georgia", "serif"],
        sans: ["var(--font-manrope)", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
