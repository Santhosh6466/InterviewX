/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'sm': '2px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
      colors: {
        theme: {
          main: 'var(--theme-main)',
          card: 'var(--theme-card)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-muted)',
          border: 'var(--theme-border)',
          hover: 'var(--theme-hover)',
          primary: 'var(--theme-inverted)',
          'primary-text': 'var(--theme-inverted-text)',
          sidebar: 'var(--theme-sidebar)',
        }
      }
    },
  },
  plugins: [],
}
