/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/customer/**/*.{js,ts,jsx,tsx}',
    './src/admin/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontWeight: {
        normal: '500',
        medium: '600',
        semibold: '700',
        bold: '800',
      },
    },
  },
  plugins: [],
};
