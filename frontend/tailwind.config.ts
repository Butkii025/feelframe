import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        surface: "#121B2E",
        "surface-raised": "#182238",
        border: "#22304A",
        teal: "#14B8A6",
        "teal-dim": "#0E7C70",
        coral: "#E2654A",
        "coral-dim": "#A5482F",
        slate: "#8B93A7",
        ink: "#E8ECF3",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
