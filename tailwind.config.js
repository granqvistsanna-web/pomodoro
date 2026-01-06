/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Semantic colors mapped to CSS variables
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          muted: 'var(--color-accent-muted)',
          glow: 'var(--color-accent-glow)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          muted: 'var(--color-success-muted)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          overlay: 'var(--color-surface-overlay)',
        },
        theme: {
          bg: 'var(--color-bg)',
          text: 'var(--color-text)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-muted': 'var(--color-text-muted)',
          'text-on-accent': 'var(--color-text-on-accent)',
          border: 'var(--color-border)',
          'border-strong': 'var(--color-border-strong)',
          disabled: 'var(--color-disabled)',
          'hover-bg': 'var(--color-hover-bg)',
          'btn-secondary': 'var(--color-button-secondary-bg)',
          'toggle-bg': 'var(--color-toggle-bg)',
          'toggle-knob': 'var(--color-toggle-knob)',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
        'theme-toggle': 'var(--shadow-toggle)',
      },
    },
  },
  plugins: [],
}
