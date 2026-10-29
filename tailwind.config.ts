import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: "#F5F1E8",
        paper: "#FBF9F4",
        ink: "#17221A",
        moss: { DEFAULT: "#2F5E25", deep: "#1C3B16", light: "#4E9A3E" },
        line: "#E3DDCF",
        stone: { muted: "#5E6656", soft: "#656D5F" },
        beak: { DEFAULT: "#E2432B", deep: "#A8301F", soft: "#FCE9E4" },
        tealbird: { DEFAULT: "#2E9F9C", deep: "#1E7884", light: "#57C6B8" },
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
      },
    },
  },
  plugins: [],
};
export default config;
