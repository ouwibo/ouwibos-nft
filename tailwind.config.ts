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
        primary: "#8B5CF6",
        secondary: "#06B6D4",
        cyber: {
          bg: "#020617",
          card: "rgba(30, 41, 59, 0.5)",
          cyan: "#22d3ee",
          purple: "#a855f7",
          border: "rgba(255, 255, 255, 0.1)",
        },
        base: {
          amber: "#fbbf24",
          emerald: "#10b981",
        },
      },
      animation: {
        'glow-pulse': 'glow 4s infinite ease-in-out',
        'float-slow': 'float 8s infinite ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scan': 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(40px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(to bottom right, #020617, #0f172a, #1e1b4b)',
        'neon-border': 'linear-gradient(to right, #22d3ee, #a855f7)',
        'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')",
        'grid-white': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white' stroke-opacity='0.05'%3E%3Cpath d='M0 .5H31.5V32'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.3)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'base-glow': '0 20px 40px rgba(251,191,36,0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
