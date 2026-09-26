
import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { AdminProvider } from "@/contexts/admin-context"
import { ThemeProvider } from "@/components/theme-provider"
import AnimatedBg from "@/components/ui/animated-bg"
import { NotificationsProvider } from "@/contexts/notifications"
import { Toaster } from "@/components/ui/sonner"
import { GoogleTagManager } from '@next/third-parties/google'

export const metadata: Metadata = {
  metadataBase: new URL('https://ayzek.tr'), // Domain bağlanınca burası güncellenmeli
  title: {
    default: "AYZEK | Selçuk Üniversitesi Teknoloji Topluluğu",
    template: "%s | AYZEK"
  },
  description: "Selçuk Üniversitesi AYZEK topluluğuyla yapay zekâ ve yazılımı keşfet. Eğitimlere katıl, projeler üret ve teknolojiye meraklı öğrencilerle tanış.",
  keywords: ["Ayzek", "Topluluk", "Etkinlik", "Yazılım", "Teknoloji", "Takım"],
  authors: [{ name: "Ayzek Team" }],
  creator: "Ayzek",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://ayzek.tr",
    title: "AYZEK | Selçuk Üniversitesi Teknoloji Topluluğu",
    description: "Selçuk Üniversitesi AYZEK topluluğuyla yapay zekâ ve yazılımı keşfet. Eğitimlere katıl, projeler üret ve teknolojiye meraklı öğrencilerle tanış.",
    siteName: "AYZEK",
    images: [
      {
        url: "/toplu.jpg",
        alt: "Ayzek Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AYZEK | Selçuk Üniversitesi Teknoloji Topluluğu",
    description: "Selçuk Üniversitesi AYZEK topluluğuyla yapay zekâ ve yazılımı keşfet. Eğitimlere katıl, projeler üret ve teknolojiye meraklı öğrencilerle tanış.",
    images: ["/toplu.jpg"],
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
      className={GeistSans.variable}
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
