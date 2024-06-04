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
        alto: {
          "50": "#f6f6f6",
          "100": "#ebebe9",
          "200": "#dfdfdd",
          "300": "#bbbbb6",
          "400": "#9e9d99",
          "500": "#8b8a84",
          "600": "#7e7d78",
          "700": "#6a6964",
          "800": "#585754",
          "900": "#494845",
          "950": "#262524",
        },
        everglade: {
          "50": "#f3faf3",
          "100": "#e3f5e4",
          "200": "#c9e9cc",
          "300": "#9ed7a4",
          "400": "#6cbc74",
          "500": "#47a051",
          "600": "#36833e",
          "700": "#2d6834",
          "800": "#28532d",
          "900": "#1d3a21",
          "950": "#0e2512",
        },
        sky: {
          "50": "#eafeff",
          "100": "#cbfbff",
          "200": "#9ef6ff",
          "300": "#5becff",
          "400": "#38deff",
          "500": "#00bae5",
          "600": "#0094c0",
          "700": "#03759b",
          "800": "#0d5e7d",
          "900": "#104e69",
          "950": "#033349",
        },
      },
    },
  },
  plugins: [],
};
export default config;
