/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE', 300: '#A5B4FC', 400: '#818CF8',
                    500: '#6366F1', 600: '#4F46E5', 700: '#4338CA', 800: '#3730A3', 900: '#312E81',
                },
                accent: { 500: '#06B6D4', 600: '#0891B2' },
                success: { 500: '#22C55E', 600: '#16A34A' },
                warning: { 500: '#F59E0B', 600: '#D97706' },
                danger: { 500: '#EF4444', 600: '#DC2626' },
            },
            fontFamily: { sans: ['Inter', 'sans-serif'] },
        },
    },
    plugins: [],
};
