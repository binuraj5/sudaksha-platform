/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:          '#0d1b3e',
        navy:         '#0f2456',
        royal:        '#1565c0',
        'mid-blue':   '#1976d2',
        bright:       '#2196f3',
        orange:       '#f5a023',
        'orange-lt':  '#ffb84d',
        sky:          '#64b5f6',
        'sky-pale':   '#e8f2ff',
        dark:         '#1a1a2e',
        muted:        '#5a7fa8',
        'lt-muted':   '#90b4d4',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'Inter', 'Arial', 'Verdana', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'Arial', 'Verdana', 'sans-serif'],
        body:    ['var(--font-inter)', 'Inter', 'Arial', 'Verdana', 'sans-serif'],
        mono:    ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        marquee:      'marquee 30s linear infinite',
        float:        'float 6s ease-in-out infinite',
        'spin-slow':  'spin 20s linear infinite',
        fadeUp:       'fadeUp 0.6s ease-out forwards',
        barGrow:      'barGrow 1s ease-out forwards',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        barGrow: {
          from: { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          to:   { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },
    },
  },
  plugins: [],
}
