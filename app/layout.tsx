import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Noto_Sans, Geist } from "next/font/google"

import { appMetadata } from "@/src/shared/constants/app-metadata"
import { AppEffectsProvider } from "@/src/providers/app-effects-provider"
import { AuthBootstrapProvider } from "@/src/providers/auth-bootstrap-provider"
import { QueryProvider } from "@/src/providers/query-provider"
import { ThemeProvider } from "@/src/providers/theme-provider"
import { Toaster } from "@/src/shared/components/ui/sonner"
import { TooltipProvider } from "@/src/shared/components/ui/tooltip"
import { appAssets } from "@/src/shared/constants/app-assets"
import {
  APPEARANCE_SCRIPT,
  DEFAULT_APPEARANCE_STYLE,
} from "@/src/shared/appearance"
import { cn } from "@/src/shared/lib/utils"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import "@/src/shared/appearance/styles/index.css"

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" })

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const ibmPlexMonoMono = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: `${appMetadata.name} — Tu sistema operativo personal con IA`,
    template: `%s | ${appMetadata.name}`,
  },
  description: appMetadata.description,
  keywords: appMetadata.keywords,
  authors: [{ name: appMetadata.author }],
  creator: appMetadata.author,
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
  metadataBase: new URL(appMetadata.url),
  openGraph: {
    type: "website",
    locale: "es_DO",
    url: appMetadata.url,
    siteName: appMetadata.name,
    title: `${appMetadata.name} — Tu sistema operativo personal con IA`,
    description: appMetadata.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${appMetadata.name} — Tu sistema operativo personal con IA`,
    description: appMetadata.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: appMetadata.url,
    media: {
      image: `${appMetadata.url}/images/app-banner-v1.png`,
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
      data-style={DEFAULT_APPEARANCE_STYLE}
      suppressHydrationWarning
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        ibmPlexMonoMono.variable,
        "font-sans",
        notoSans.variable,
        geistHeading.variable
      )}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: APPEARANCE_SCRIPT }} />
        <QueryProvider>
          <AuthBootstrapProvider>
            <ThemeProvider defaultTheme="light">
              <AppEffectsProvider>
                <TooltipProvider>
                  <Toaster position="top-center" richColors />
                  {children}
                </TooltipProvider>
              </AppEffectsProvider>
            </ThemeProvider>
          </AuthBootstrapProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
