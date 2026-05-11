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
        aura: {
          pink: "#D4537E",
          "pink-light": "#F4C0D1",
          "pink-bg": "#FEF0F5",
          purple: "#7C3AED",
          "purple-light": "#EDE9FE",
          "purple-bg": "#FAF5FF",
        },
        "aura-text": {
          primary: "#1A1A2E",
          secondary: "#6B7280",
        },
        "aura-surface": "#FAF5FF",
        "aura-page": "#FDFCFF",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        aura: "0 2px 8px rgba(212,83,126,0.08)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
export default config;
