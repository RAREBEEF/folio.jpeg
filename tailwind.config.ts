import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 1.5s linear infinite",
        "loading-dot-1": "loadingDot1 0.6s 0s linear infinite",
        "loading-dot-2": "loadingDot1 0.6s 0.2s linear infinite",
        "loading-dot-3": "loadingDot1 0.6s 0.4s linear infinite",
      },
      keyframes: {
        loadingDot1: {
          "0%": { transform: "translateY(0%)" },
          "25%": { transform: "translateY(-25%)" },
          "50%": { transform: "translateY(0%)" },
          "75%": { transform: "translateY(25%)" },
        },
      },
      screens: {
        min: { max: "350px" },
        xs: {
          max: "550px",
        },
        sm: {
          max: "800px",
        },
        md: {
          max: "1024px",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        shark: {
          "50": "#f6f6f6",
          "100": "#e7e7e7",
          "200": "#d1d1d1",
          "300": "#b0b0b0",
          "400": "#888888",
          "500": "#6d6d6d",
          "600": "#5d5d5d",
          "700": "#4f4f4f",
          "800": "#454545",
          "900": "#3d3d3d",
          "950": "#1f1f1f",
        },
        woodsmoke: {
          "50": "#f5f6fa",
          "100": "#ebedf3",
          "200": "#d2d7e5",
          "300": "#aab3cf",
          "400": "#7c8bb4",
          "500": "#5c6c9b",
          "600": "#485581",
          "700": "#3b4569",
          "800": "#343b58",
          "900": "#2f354b",
          "950": "#0a0b10",
        },
        "east-bay": {
          "50": "#f4f7fa",
          "100": "#e6ecf3",
          "200": "#d3ddea",
          "300": "#b5c7db",
          "400": "#92aac8",
          "500": "#7891b9",
          "600": "#657bab",
          "700": "#5a6b9b",
          "800": "#495479",
          "900": "#414b67",
          "950": "#2b3040",
        },
        "ebony-clay": {
          "50": "#f4f7fa",
          "100": "#e5ebf4",
          "200": "#d1ddec",
          "300": "#b2c6de",
          "400": "#8da9cd",
          "500": "#728ebf",
          "600": "#5f78b1",
          "700": "#5467a1",
          "800": "#485585",
          "900": "#3e486a",
          "950": "#2d3349",
        },

        mirage: {
          "50": "#f4f6fb",
          "100": "#e7edf7",
          "200": "#cbd9ec",
          "300": "#9dbadc",
          "400": "#6895c8",
          "500": "#4577b2",
          "600": "#335d96",
          "700": "#2a4c7a",
          "800": "#264166",
          "900": "#243956",
          "950": "#141e2f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
