/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        head:    ['Oswald', 'sans-serif'],
      },
      colors: {
        /* ── Primary: Deep Burgundy (from the 'Q' in logo) ── */
        burgundy: {
          50:  '#fdf4f5',
          100: '#fbe8ea',
          200: '#f5c9ce',
          300: '#eca0a9',
          400: '#de6d7a',
          500: '#cc3f50',
          600: '#b02436',
          700: '#8d1a29',
          800: '#761826',
          900: '#651824',
          950: '#3d0c14',
        },
        /* ── Secondary: Cream/Tan (arrow in logo, button fill) ── */
        cream: {
          50:  '#fdfaf5',
          100: '#faf3e0',
          200: '#f5e6c2',
          300: '#edd49a',
          400: '#e3be6e',
          500: '#d4a44a',
          600: '#b88437',
          700: '#99672a',
          800: '#7e5227',
          900: '#684425',
        },
        /* ── Background tones ── */
        panel: {
          dark:    '#5c1520',  /* left panel bg — deep burgundy */
          medium:  '#7a1e2c',  /* hover/active shades */
          light:   '#f7f0e6',  /* right panel bg — pale cream */
          cream:   '#ede3d0',  /* watermark area tone */
        },
      },
      backgroundImage: {
        /* Subtle tan/cream parchment-style right panel */
        'panel-right': 'linear-gradient(135deg, #f7f0e6 0%, #ede3d0 100%)',
        /* Deep burgundy left panel */
        'panel-left':  'linear-gradient(180deg, #5c1520 0%, #4a1019 100%)',
        /* Overall page background — off-white warm */
        'page-bg':     'linear-gradient(160deg, #f7f0e6 0%, #ede3d0 100%)',
      },
      boxShadow: {
        'btn-3d':    '0 4px 0 0 #7a1e2c, 0 6px 12px rgba(92,21,32,0.3)',
        'btn-3d-sm': '0 3px 0 0 #7a1e2c, 0 4px 8px rgba(92,21,32,0.25)',
        'panel':     '6px 0 24px rgba(0,0,0,0.25)',
        'header':    '0 2px 12px rgba(0,0,0,0.18)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-in-out',
        'slide-up':   'slideUp 0.35s ease-out',
        'slide-in-l': 'slideInLeft 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:     { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInLeft: { from: { opacity: 0, transform: 'translateX(-20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
