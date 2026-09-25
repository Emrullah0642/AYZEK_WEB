
import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { AdminProvider } from "@/contexts/admin-context"
import { ThemeProvider } from "@/components/theme-provider"
import AnimatedBg from "@/components/ui/animated-bg"
import { SplashScreen } from "@/components/splash-screen"
import { NotificationsProvider } from "@/contexts/notifications"
import { Toaster } from "@/components/ui/sonner"
import { GoogleTagManager } from '@next/third-parties/google'

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ayzek22.com.tr'),
  title: {
    default: "AYZEK - Topluluk Hafızası & Etkinlik Vitrini",
    template: "%s | AYZEK"
  },
  description: "Topluluk başarılarını sergileyen, etkinlikleri ölümsüzleştiren ve üyeleri bir araya getiren modern topluluk platformu.",
  keywords: ["Ayzek", "Topluluk", "Etkinlik", "Yazılım", "Teknoloji", "Takım"],
  authors: [{ name: "Ayzek Team" }],
  creator: "Ayzek",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ayzek22.com.tr",
    title: "AYZEK - Topluluk Hafızası & Etkinlik Vitrini",
    description: "Topluluk başarılarını sergileyen, etkinlikleri ölümsüzleştiren ve üyeleri bir araya getiren modern topluluk platformu.",
    siteName: "AYZEK",
    images: [
      {
        url: "/ayzek-logo.png",
        width: 1200,
        height: 630,
        alt: "Ayzek Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AYZEK - Topluluk Hafızası & Etkinlik Vitrini",
    description: "Topluluk başarılarını sergileyen, etkinlikleri ölümsüzleştiren ve üyeleri bir araya getiren modern topluluk platformu.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${GeistSans.variable} ${displayFont.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head />
      {/* overflow-x-clip = sağdaki hayalet boşlukları keser */}
      <body className="antialiased font-sans min-h-dvh bg-background text-foreground overflow-x-clip">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          enableColorScheme
          disableTransitionOnChange
        >
          {/* Global hareketli arka plan */}
          <AnimatedBg />
          <SplashScreen />
          <NotificationsProvider>
            <AdminProvider>
              {children}
            </AdminProvider>
          </NotificationsProvider>
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>

        {/* Google Tag Manager Entegrasyonu */}
        <GoogleTagManager gtmId="GTM-5R2SVX3S" />
      </body>
    </html>
  )
}
