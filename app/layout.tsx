import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"

import { siteInfo } from "@/src/modules/landing/data/site-info"
import { AppEffectsProvider } from "@/src/providers/app-effects-provider"
import { AuthBootstrapProvider } from "@/src/providers/auth-bootstrap-provider"
import { QueryProvider } from "@/src/providers/query-provider"
import { ThemeProvider } from "@/src/providers/theme-provider"
import { Toaster } from "@/src/shared/components/ui/sonner"
import { TooltipProvider } from "@/src/shared/components/ui/tooltip"
import { appAssets } from "@/src/shared/constants/app-assets"
import { cn } from "@/src/shared/lib/utils"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans", // Use for main text to override sans
})

const ibmPlexMonoMono = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: `${siteInfo.name} — Tu sistema operativo personal con IA`,
    template: `%s | ${siteInfo.name}`,
  },
  description: siteInfo.description,
  keywords: siteInfo.keywords,
  authors: [{ name: siteInfo.author }],
  creator: siteInfo.author,
  manifest: "/manifest.json",
  category: "personal",
  applicationName: "Personal OS",
  appleWebApp: {
    title: "Personal OS",
    statusBarStyle: "black-translucent",
    capable: true,
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
    date: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: siteInfo.url,
    siteName: siteInfo.name,
    title: `${siteInfo.name} — Tu sistema operativo personal con IA`,
    description: siteInfo.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteInfo.name} — Tu sistema operativo personal con IA`,
    description: siteInfo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteInfo.url,
    languages: {
      es: `${siteInfo.url}/es`,
      en: `${siteInfo.url}/en`,
    },
    media: {
      image: `${siteInfo.url}/images/app-banner-v1.png`,
    },
  },
  icons: {
    icon: [
      { url: appAssets.favicon96, sizes: "96x96", type: "image/png" },
      { url: appAssets.faviconIco },
    ],
    apple: appAssets.appleTouchIcon,
  },
}

export const viewport: Viewport = {
  themeColor: "#131313",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        ibmPlexMono.variable,
        ibmPlexMonoMono.variable
      )}
    >
      <body>
        <QueryProvider>
          <AuthBootstrapProvider>
            <AppEffectsProvider>
              <TooltipProvider>
                <ThemeProvider defaultTheme="light">
                  <Toaster position="top-center" richColors />
                  {children}
                </ThemeProvider>
              </TooltipProvider>
            </AppEffectsProvider>
          </AuthBootstrapProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
