/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899', // Màu hồng đậm đặc trưng cho mỹ phẩm
          600: '#db2777',
          900: '#831843',
        }
      }
    },
  },
  plugins: [],
}
