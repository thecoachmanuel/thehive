/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        cocoa: 'rgb(var(--color-cocoa) / <alpha-value>)',
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        peach: 'rgb(var(--color-peach) / <alpha-value>)',
        caramel: 'rgb(var(--color-caramel) / <alpha-value>)',
        blush: 'rgb(var(--color-blush) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)'
      },
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto'],
        body: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto']
      }
    }
  },
  plugins: []
}
