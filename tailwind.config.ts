import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          amber: "#fbbf24",
          emerald: "#10b981",
        },
        opensea: {
          blue: "#2081E2",
          dark: "#1868B7",
          bg: "#04111D",
          card: "#202225",
        },
        bikini: {
          sand: "#F4E4BC",
          pink: "#FF91AF",
          yellow: "#F9E076",
          sky: "#0077be",
        }
      },
      animation: {
        'shine': 'shine 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 20s linear infinite',
        'bubble': 'bubble 10s infinite ease-in-out',
        'flower': 'float 12s infinite linear',
      },
      keyframes: {
        bubble: {
          '0%, 100%': { transform: 'translateY(100vh) scale(0.5)', opacity: '0' },
          '50%': { opacity: '0.8' },
          '99%': { transform: 'translateY(-10vh) scale(1.2)', opacity: '0' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) translateX(10px) rotate(5deg)' },
        },
        aurora: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        }
      },
      boxShadow: {
        'base-glow': '0 20px 40px rgba(251,191,36,0.3)',
      },
      backgroundImage: {
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
        'grid-white': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white' stroke-opacity='0.05'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
};
export default config;