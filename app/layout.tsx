import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { WebAppProvider } from "@/components/telegram/web-app-provider";
import { TelegramBackButton } from "@/components/telegram/back-button";
import "./globals.css";

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
      </body>
    </html>
  );
}
