import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090B10',
        foreground: '#F1F5F9',
        charcoal: {
          950: '#06070B',
          900: '#0B0D13',
          850: '#11141E',
          800: '#171B29',
          750: '#1F2436',
          700: '#2A3149',
          600: '#3C4564',
          500: '#64748B',
        },
        midnight: {
          950: '#07090E',
          900: '#0B0E17',
          850: '#101420',
          800: '#161C2C',
          750: '#1E253A',
          700: '#252F4A',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'sans-serif',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.15)',
        'glow-md': '0 0 30px -4px rgba(99, 102, 241, 0.25)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-hover': '0 16px 36px -6px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(99, 102, 241, 0.35)',
      },
      backgroundImage: {
        'subtle-grid': 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
        'hero-radial': 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99, 102, 241, 0.14), transparent 70%)',
      },
    },
  },
  plugins: [],
};
export default config;
