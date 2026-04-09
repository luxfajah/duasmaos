import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          muted: "hsl(var(--surface-muted))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        brand: {
          primary: "hsl(var(--brand-primary))",
          "primary-hover": "hsl(var(--brand-primary-hover))",
          secondary: "hsl(var(--brand-secondary))",
          accent: "hsl(var(--brand-accent))",
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          inverse: "hsl(var(--text-inverse))",
        },
        status: {
          success: "hsl(var(--success))",
          warning: "hsl(var(--warning))",
          danger: "hsl(var(--danger))",
          info: "hsl(var(--info))",
          pending: "hsl(var(--pending))",
          draft: "hsl(var(--draft))",
        },
        editorial: {
          highlight: "hsl(var(--editorial-highlight))",
          note: "hsl(var(--editorial-note))",
          quote: "hsl(var(--editorial-quote))",
          frame: "hsl(var(--editorial-frame))",
        },
        // Mapeamento automático para componentes Shadcn
        primary: {
          DEFAULT: "hsl(var(--brand-primary))",
          foreground: "hsl(var(--text-inverse))",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-primary))",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-muted))",
        },
        accent: {
          DEFAULT: "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-primary))",
        },
        destructive: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--text-inverse))",
        },
        ring: "hsl(var(--brand-primary))",
        input: "hsl(var(--border))",
        card: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--text-primary))",
        },
        popover: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--text-primary))",
        },
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
