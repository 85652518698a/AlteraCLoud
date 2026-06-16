import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.5' }],
        base: ['15px', { lineHeight: '1.6' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['24px', { lineHeight: '1.3' }],
        '2xl': ['36px', { lineHeight: '1.2' }],
        '3xl': ['56px', { lineHeight: '1.1' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
      },
      colors: {
        background: '#0A0A0A',
        surface: '#111111',
        'surface-elevated': '#1A1A1A',
        border: '#2A2A2A',
        'border-subtle': '#1F1F1F',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A1A1A1',
        'text-muted': '#555555',
        accent: '#FFFFFF',
        'accent-hover': '#E0E0E0',
        danger: '#FF4444',
        'danger-subtle': '#1A0000',
        success: '#22C55E',
      },
      spacing: {
        px: '1px',
        0: '0',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        modal: '0 24px 64px rgba(0,0,0,0.9)',
        elevated: '0 4px 24px rgba(0,0,0,0.8)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
