import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0b0f",
        surface: "#13131a",
        border: "#23232c",
        muted: "#7c7c8a",
        accent: "#7c5cff",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
