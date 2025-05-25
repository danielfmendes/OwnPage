import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";

import "./globals.css";
import "../../i18n";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { NotificationProvider } from "@/components/helpers/NotificationProvider";
import { OpenAPIInitializer } from "@/components/helpers/OpenAPIInitializer";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "NebulaDW",
  description:
    "Projekt by Daniel Freire Mendes"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <NotificationProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <OpenAPIInitializer />
            {children}
          </ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
