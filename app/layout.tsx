import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { siteInfo } from "@/src/modules/landing/data/site-info";
import { Toaster } from "@/src/shared/components/ui/sonner";
import { TooltipProvider } from "@/src/shared/components/ui/tooltip";
import { appAssets } from "@/src/shared/constants/app-assets";
import { cn } from "@/src/shared/lib/utils";
import { QueryProvider } from "@/src/shared/providers/query-provider";
import { ThemeProvider } from "@/src/shared/providers/theme-provider";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans", // Use for main text to override sans
});

const ibmPlexMonoMono = IBM_Plex_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${siteInfo.name} — Tu sistema operativo personal con IA`,
    template: `%s | ${siteInfo.name}`,
  },
  description: siteInfo.description,
  keywords: siteInfo.keywords,
  authors: [{ name: siteInfo.author }],
  creator: siteInfo.author,
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
  icons: {
    icon: [
      { url: appAssets.favicon96, sizes: "96x96", type: "image/png" },
      { url: appAssets.faviconIco },
    ],
    apple: appAssets.appleTouchIcon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn(
        "min-h-screen bg-background font-sans antialiased",
        ibmPlexMono.variable,
        ibmPlexMonoMono.variable,
      )}
    >
      <body>
        <QueryProvider>
          <TooltipProvider>
            <ThemeProvider defaultTheme="light">
              <Toaster position="top-center" richColors />
              {children}
            </ThemeProvider>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
