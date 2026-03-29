import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { WebAppProvider } from "@/components/telegram/web-app-provider";
import { TelegramBackButton } from "@/components/telegram/back-button";
import "./globals.css";
import { TELEGRAM_THEME_STORAGE_KEY } from "@/lib/telegram-theme-storage";

export const metadata: Metadata = {
  title: "Money Split",
  description: "Разделяйте расходы без споров",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('${TELEGRAM_THEME_STORAGE_KEY}')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <WebAppProvider>
          <TelegramBackButton />
          {children}
          <Toaster />
        </WebAppProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
