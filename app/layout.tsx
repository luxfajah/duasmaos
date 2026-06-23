import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Amaranth, Lato, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

/* ─────────────────────────────────────────
   DUAS MÃOS BRAND TYPOGRAPHY
   - Plus Jakarta Sans  → headings (expressive, editorial)
   - Amaranth           → subheadings (warm, approachable)
   - Lato               → body (highly readable)
   - Outfit             → modern UI elements
   - Playfair Display   → serif highlights and titles
   ───────────────────────────────────────── */

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
  display: "swap",
});

const amaranth = Amaranth({
  subsets: ["latin"],
  variable: "--font-subheading",
  weight: ["400", "700"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duas Mãos | Plataforma Criativa",
  description: "Plataforma de gestão de projetos e colaboração criativa da Duas Mãos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${amaranth.variable} ${lato.variable} ${outfit.variable} ${playfairDisplay.variable} font-body`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
