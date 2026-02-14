/** @type {import('tailwindcss').Config} */

/**
 * 🎨 FlowSpace Tailwind Configuration
 * 
 * ✅ Custom animations for skeleton loading
 * ✅ Dark mode support (class-based)
 * ✅ Custom colors matching design system
 * ✅ Professional shadows and spacing
 */

export default {
  // ═══════════════════════════════════════
  // DARK MODE CONFIGURATION
  // ═══════════════════════════════════════
  darkMode: 'class', // Toggle via className="dark" on <html> or <body>

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      // ═══════════════════════════════════════
      // CUSTOM COLORS
      // ═══════════════════════════════════════
      colors: {
        // Primary brand colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Success colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        
        // Warning colors
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        
        // Danger colors
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },

      // ═══════════════════════════════════════
      // CUSTOM ANIMATIONS
      // ═══════════════════════════════════════
      keyframes: {
        // Shimmer effect for skeleton loading
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        
        // Fade in animation
        fadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(10px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        
        // Slide in from right
        slideInRight: {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1' 
          },
        },
        
        // Slide in from bottom
        slideInBottom: {
          '0%': { 
            transform: 'translateY(100%)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)',
            opacity: '1' 
          },
        },
        
        // Pulse animation (enhanced)
        pulseEnhanced: {
          '0%, 100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)' 
          },
        },
        
        // Bounce animation (subtle)
        bounceSubtle: {
          '0%, 100%': { 
            transform: 'translateY(0)' 
          },
          '50%': { 
            transform: 'translateY(-10px)' 
          },
        },

        // Spin slow
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        // Apply animations
        shimmer: 'shimmer 2s infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideInRight: 'slideInRight 0.3s ease-out',
        slideInBottom: 'slideInBottom 0.3s ease-out',
        pulseEnhanced: 'pulseEnhanced 2s ease-in-out infinite',
        bounceSubtle: 'bounceSubtle 1s ease-in-out infinite',
        spinSlow: 'spinSlow 3s linear infinite',
      },

      // ═══════════════════════════════════════
      // CUSTOM SHADOWS
      // ═══════════════════════════════════════
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'floating': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },

      // ═══════════════════════════════════════
      // CUSTOM SPACING
      // ═══════════════════════════════════════
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },

      // ═══════════════════════════════════════
      // CUSTOM BORDER RADIUS
      // ═══════════════════════════════════════
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      // ═══════════════════════════════════════
      // CUSTOM TRANSITIONS
      // ═══════════════════════════════════════
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },

      // ═══════════════════════════════════════
      // CUSTOM Z-INDEX
      // ═══════════════════════════════════════
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // ═══════════════════════════════════════
      // CUSTOM BACKDROP BLUR
      // ═══════════════════════════════════════
      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [
    // Add custom scrollbar styles
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          /* Hide scrollbar for IE, Edge and Firefox */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        
        '.scrollbar-thin': {
          /* Thin scrollbar for Chrome, Safari and Opera */
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(156, 163, 175, 0.5)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(107, 114, 128, 0.7)',
          },
        },

        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
          '.dark &': {
            '&::-webkit-scrollbar-track': {
              background: '#1e293b',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#475569',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#64748b',
            },
          },
        },
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
};

/**
 * 🎯 USAGE EXAMPLES:
 * 
 * 1. Skeleton Loading:
 *    <div className="bg-gray-200 animate-shimmer">...</div>
 * 
 * 2. Fade In Animation:
 *    <div className="animate-fadeIn">...</div>
 * 
 * 3. Dark Mode Colors:
 *    <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
 * 
 * 4. Custom Shadows:
 *    <div className="shadow-card hover:shadow-card-hover">...</div>
 * 
 * 5. Custom Scrollbar:
 *    <div className="overflow-auto custom-scrollbar">...</div>
 */