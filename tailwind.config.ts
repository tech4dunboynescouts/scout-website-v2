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
        navy: {
          dark: "#0D2044",
          mid: "#1A3A6B",
          light: "#2A5298",
        },
        orange: {
          main: "#E8640A",
          hover: "#FF7D1F",
        },
        background: "#F4F6FA",
        textDark: "#0D1B35",
        textMuted: "#5A6A8A",
      },
      fontFamily: {
        display: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
        body: ["var(--font-roboto)", "Roboto", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
