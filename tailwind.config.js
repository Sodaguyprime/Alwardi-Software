/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#F2C200',
        goldDark: '#E0B000',
        ink: '#1f2937',
        graybar: '#595959'
      }
    }
  },
  plugins: []
}
