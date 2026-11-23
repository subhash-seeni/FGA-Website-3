import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#0E0F11",
          900: "#090A0B",
          800: "#0E0F11",
          700: "#131518",
        },
        limestone: {
          DEFAULT: "#F4F2EE",
          50: "#FAF9F6",
          100: "#F4F2EE",
          200: "#EAE7E1",
          300: "#DDD8CF",
          900: "#2B2925",
        },
        copper: {
          DEFAULT: "#C27D4B",
          light: "#D89564",
          dark: "#A36335",
          muted: "rgba(194, 125, 75, 0.2)",
          hairline: "rgba(194, 125, 75, 0.2)",
        },
        slateSurface: {
          DEFAULT: "#17191D",
          hover: "#1F2228",
        },
      },
      borderColor: {
        "dark-hairline": "rgba(194, 125, 75, 0.2)",
        "light-hairline": "rgba(14, 15, 17, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wideSub: "0.18em",
        widestBadge: "0.25em",
      },
    },
  },
  plugins: [],
} satisfies Config;
