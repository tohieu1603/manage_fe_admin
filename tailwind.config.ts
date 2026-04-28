import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EFF5FF", 100: "#DBE8FE", 200: "#BED6FE", 300: "#91BBFD",
          400: "#5D95FA", 500: "#3B75F6", 600: "#2556EB", 700: "#1D43D8",
          800: "#1E39AF", 900: "#1E358A",
        },
        ink: {
          25: "#FBFCFE", 50: "#F6F8FC", 100: "#EFF2F8", 150: "#E6EAF2",
          200: "#D9DEEA", 300: "#B7C0D4", 400: "#8A97B3", 500: "#5B6A8A",
          600: "#384766", 700: "#1E2940", 800: "#121A2B", 900: "#0B1220",
        },
        ok:     { 50: "#ECFDF5", 100: "#D1FAE5", 500: "#10B981", 600: "#059669", 700: "#047857" },
        warn:   { 50: "#FFFBEB", 100: "#FEF3C7", 500: "#F59E0B", 600: "#D97706", 700: "#B45309" },
        danger: { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C" },
        violet: { 50: "#F5F3FF", 100: "#EDE9FE", 500: "#8B5CF6", 600: "#7C3AED" },
      },
      fontFamily: {
        sans: ['Inter', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'ring-focus': '0 0 0 3px rgba(59, 117, 246, 0.18)',
      },
    },
  },
  plugins: [],
};
export default config;
