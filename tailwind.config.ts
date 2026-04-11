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
        /* Duas Mãos brand typography */
        heading:    ["var(--font-heading)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        subheading: ["var(--font-subheading)", "Amaranth", "Georgia", "serif"],
        body:       ["var(--font-body)", "Lato", "system-ui", "sans-serif"],
        /* Legacy aliases */
        sans:  ["var(--font-body)", "Lato", "system-ui", "sans-serif"],
        serif: ["var(--font-subheading)", "Amaranth", "Georgia", "serif"],
      },

      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT:   "hsl(var(--surface))",
          muted:     "hsl(var(--surface-muted))",
          elevated:  "hsl(var(--surface-elevated))",
          "deep-blue": "hsl(var(--surface-deep-blue))",
          /* backward compat alias */
          graphite:  "hsl(var(--surface-deep-blue))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          strong:  "hsl(var(--border-strong))",
        },
        brand: {
          primary:         "hsl(var(--brand-primary))",
          "primary-hover": "hsl(var(--brand-primary-hover))",
          secondary:       "hsl(var(--brand-secondary))",
          "secondary-light": "hsl(var(--brand-secondary-light))",
          accent:          "hsl(var(--brand-accent))",
          "accent-soft":   "hsl(var(--brand-accent-soft))",
          "deep-blue":     "hsl(var(--brand-deep-blue))",
          "deep-blue-light": "hsl(var(--brand-deep-blue-light))",
          highlight:       "hsl(var(--brand-highlight))",
        },
        /* Semantic shortcuts */
        terracotta: {
          DEFAULT: "hsl(13 55% 50%)",
          light:   "hsl(13 55% 65%)",
          dark:    "hsl(13 55% 38%)",
          soft:    "hsl(13 45% 92%)",
        },
        "deep-blue": {
          DEFAULT: "hsl(222 55% 22%)",
          light:   "hsl(222 45% 35%)",
          dark:    "hsl(222 55% 14%)",
          soft:    "hsl(222 35% 92%)",
        },
        sand: {
          DEFAULT: "hsl(35 22% 93%)",
          light:   "hsl(35 25% 97%)",
          dark:    "hsl(35 18% 84%)",
          warm:    "hsl(35 28% 88%)",
        },
        olive: {
          DEFAULT: "hsl(68 28% 32%)",
          light:   "hsl(68 28% 45%)",
          dark:    "hsl(68 35% 22%)",
          soft:    "hsl(68 30% 90%)",
        },
        yellow: {
          DEFAULT: "hsl(43 90% 58%)",
          light:   "hsl(43 90% 72%)",
          dark:    "hsl(43 90% 40%)",
          soft:    "hsl(43 90% 92%)",
        },
        text: {
          primary:  "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          muted:    "hsl(var(--text-muted))",
          inverse:  "hsl(var(--text-inverse))",
          "on-dark": "hsl(var(--text-on-dark))",
        },
        status: {
          success: "hsl(var(--success))",
          warning: "hsl(var(--warning))",
          danger:  "hsl(var(--danger))",
          info:    "hsl(var(--info))",
          pending: "hsl(var(--pending))",
          draft:   "hsl(var(--draft))",
        },
        editorial: {
          highlight: "hsl(var(--editorial-highlight))",
          note:      "hsl(var(--editorial-note))",
          quote:     "hsl(var(--editorial-quote))",
          frame:     "hsl(var(--editorial-frame))",
        },
        /* Shadcn compatibility mapping */
        primary: {
          DEFAULT:    "hsl(var(--brand-primary))",
          foreground: "hsl(var(--text-inverse))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-primary))",
        },
        muted: {
          DEFAULT:    "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-muted))",
        },
        accent: {
          DEFAULT:    "hsl(var(--surface-muted))",
          foreground: "hsl(var(--text-primary))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--danger))",
          foreground: "hsl(var(--text-inverse))",
        },
        ring:   "hsl(var(--brand-primary))",
        input:  "hsl(var(--border))",
        card: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--text-primary))",
        },
        popover: {
          DEFAULT:    "hsl(var(--surface))",
          foreground: "hsl(var(--text-primary))",
        },
      },

      /* Organic border-radius scale */
      borderRadius: {
        none:    "0px",
        xs:      "var(--radius-xs)",   /* 4px */
        sm:      "var(--radius-sm)",   /* 6px */
        DEFAULT: "var(--radius-sm)",
        md:      "var(--radius-md)",   /* 10px */
        lg:      "var(--radius-lg)",   /* 16px */
        xl:      "var(--radius-xl)",   /* 24px */
        "2xl":   "var(--radius-2xl)",  /* 32px */
        full:    "var(--radius-full)",
      },

      boxShadow: {
        xs:            "var(--shadow-xs)",
        sm:            "var(--shadow-sm)",
        DEFAULT:       "var(--shadow-sm)",
        md:            "var(--shadow-md)",
        lg:            "var(--shadow-lg)",
        xl:            "var(--shadow-xl)",
        glass:         "var(--shadow-glass)",
        brand:         "var(--shadow-brand)",
        terracotta:    "var(--shadow-terracotta)",
        "deep-blue":   "var(--shadow-deep-blue)",
        "card-hover":  "var(--shadow-card-hover)",
        none:          "none",
      },

      transitionDuration: {
        fast:   "100ms",
        normal: "200ms",
        slow:   "350ms",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-brand": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--brand-primary) / 0.4)" },
          "50%":      { boxShadow: "0 0 0 8px hsl(var(--brand-primary) / 0)" },
        },
        "blob-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%":      { transform: "translate(10px, -8px) scale(1.05)" },
          "66%":      { transform: "translate(-6px, 6px) scale(0.97)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "draw-line": {
          from: { strokeDashoffset: "200" },
          to:   { strokeDashoffset: "0" },
        },
      },

      animation: {
        "fade-in":       "fade-in 200ms ease both",
        "fade-in-up":    "fade-in-up 400ms cubic-bezier(0.25,0.46,0.45,0.94) both",
        "fade-in-down":  "fade-in-down 300ms ease both",
        "scale-in":      "scale-in 220ms ease both",
        "slide-in-left": "slide-in-left 320ms cubic-bezier(0.25,0.46,0.45,0.94) both",
        "slide-in-right": "slide-in-right 300ms ease both",
        "pulse-brand":   "pulse-brand 2s ease-in-out infinite",
        "blob-drift":    "blob-drift 9s ease-in-out infinite",
        shimmer:         "shimmer 3s linear infinite",
        "draw-line":     "draw-line 1.2s ease both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
