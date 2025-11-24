/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Midnight Forge theme
        primary: '#a855f7',
        background: '#09090b',
        surface: '#27272a',
        border: '#3f3f46',
        'text-primary': '#fafafa',
        muted: '#a1a1aa',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
}
