import type { Config } from "tailwindcss"

// Tailwind v4 — most config now lives in CSS @theme
// This file kept for tooling compatibility
const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
}

export default config
