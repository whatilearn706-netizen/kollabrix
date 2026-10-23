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
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#EA580C',
          600: '#C2410C',
          700: '#9A3412',
          800: '#7C2D12',
          900: '#431407',
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
        heading: [
          'Space Grotesk',
          'Inter',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        'elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'glow-sm': '0 0 15px -3px rgba(217, 119, 6, 0.20)',
        'glow-md': '0 0 30px -4px rgba(217, 119, 6, 0.30)',
        'card': '0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 0 0 1px rgba(229, 223, 213, 0.8)',
        'card-hover': '0 16px 36px -6px rgba(28, 25, 23, 0.12), 0 0 0 1px rgba(217, 119, 6, 0.4)',
      },
      backgroundImage: {
        'subtle-grid': 'radial-gradient(circle at 1px 1px, rgba(217, 119, 6, 0.08) 1px, transparent 0)',
        'hero-radial': 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(217, 119, 6, 0.14), transparent 70%)',
      },
    },
  },
  plugins: [],
};
export default config;
