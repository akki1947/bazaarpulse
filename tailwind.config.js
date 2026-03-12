/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono:    ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans:    ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        terminal: {
          bg:      '#080c10',
          surface: '#0d1117',
          raised:  '#161b22',
          border:  '#21262d',
          border2: '#30363d',
          dim:     '#484f58',
          muted:   '#6e7681',
          body:    '#c9d1d9',
          bright:  '#f0f6fc',
          green:   '#3fb950',
          red:     '#f85149',
          yellow:  '#e3b341',
          blue:    '#58a6ff',
          purple:  '#bc8cff',
          cyan:    '#39d353',
          orange:  '#f0883e',
          accent:  '#58a6ff',
        }
      },
      animation: {
        'ticker': 'ticker 60s linear infinite',
        'blink':  'blink 1.2s step-end infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fade-up': 'fadeUp 0.2s ease both',
      },
      keyframes: {
        ticker:  { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        blink:   { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        fadeUp:  { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
