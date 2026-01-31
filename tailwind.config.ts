import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./store/**/*.{ts,tsx}", "./types/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 12px 40px -20px rgba(0,0,0,0.35)",
        soft: "0 12px 30px -20px rgba(30, 41, 59, 0.35)",
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top, rgba(45,212,191,0.3), transparent 60%), radial-gradient(circle at 20% 20%, rgba(251,146,60,0.25), transparent 55%), radial-gradient(circle at 80% 10%, rgba(56,189,248,0.18), transparent 50%)",
        "mesh": "linear-gradient(120deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)"
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
      }
    },
  },
  plugins: [],
};

export default config;
