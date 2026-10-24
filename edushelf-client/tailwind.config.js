/** @type {import('tailwindcss').Config} */
// EduShelf design tokens — light, clean, student-friendly theme.
// NOTE: the old dark-theme class names (navy, gray-*) are kept but re-pointed to
// light-theme values, so every page re-themes from this one file.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',                 // primary text
        // Surfaces (names kept from the old theme)
        navy: '#F5F7FB',                // page background / input background
        'navy-light': '#EEF2F9',
        'navy-card': '#FFFFFF',         // cards
        'navy-border': '#E3E8F2',       // borders
        // Brand (indigo)
        brand: {
          50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC',
          400: '#818CF8', 500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3',
        },
        // Text greys, inverted so old "light-on-dark" classes read correctly on white
        gray: {
          50: '#F8FAFC', 100: '#F1F5F9', 200: '#1E293B', 300: '#334155',
          400: '#475569', 500: '#64748B', 600: '#94A3B8', 700: '#CBD5E1',
          800: '#E2E8F0', 900: '#F1F5F9',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 6px 20px rgba(15,23,42,0.06)',
        lift: '0 12px 30px rgba(15,23,42,0.12)',
        brand: '0 8px 20px rgba(79,70,229,0.28)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}
