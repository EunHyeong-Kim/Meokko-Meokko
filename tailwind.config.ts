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
        primary: "#FF6B6B",
        secondary: "#FFD600",
        background: "var(--background)",
        foreground: "var(--foreground)",
        bapsim: "#FF6B6B",
        cheating: "#FFD600",
        stress: "#EF4444",
        hot: "#F97316",
        fresh: "#4ADE80",
        sugar: "#F472B6",
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
