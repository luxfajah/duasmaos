import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./design-system/**/*.{js,ts,jsx,tsx,mdx}",
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
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-manrope)", "sans-serif"],
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
          highlight: "hsl(var(--brand-highlight))",
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
        none: "0px",
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glass: "var(--shadow-glass)",
        brand: "var(--shadow-brand)",
        none: "none",
      },

      transitionDuration: {
        fast: "100ms",
        normal: "200ms",
        slow: "350ms",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--brand-primary) / 0.4)" },
          "50%": { boxShadow: "0 0 0 6px hsl(var(--brand-primary) / 0)" },
        },
      },

      animation: {
        "fade-in": "fade-in 200ms ease both",
        "fade-in-up": "fade-in-up 300ms ease both",
        "fade-in-down": "fade-in-down 300ms ease both",
        "scale-in": "scale-in 200ms ease both",
        "slide-in-left": "slide-in-left 300ms ease both",
        "slide-in-right": "slide-in-right 300ms ease both",
        "pulse-brand": "pulse-brand 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
