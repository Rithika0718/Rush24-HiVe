import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        dark: {
          bg: '#0B0F19',        // Datadog-like slate black
          panel: '#151D30',     // Observability panel gray
          border: '#22304E',    // Dark steel border
          hover: '#1B263E',     // Panel hover state
        },
        status: {
          healthy: '#10B981',   // Emerald
          warning: '#F59E0B',   // Amber
          critical: '#EF4444',  // Rose
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config
