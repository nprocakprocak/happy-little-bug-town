import "dotenv/config";
import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";

import { GoogleAuthCallbackRegistrar } from "../components/home/GoogleAuthCallbackRegistrar";
import { AuthProvider } from "../context/AuthContext";
import { GridVisibilityProvider } from "../context/GridVisibilityContext";
import { QueryProvider } from "../providers/QueryProvider";

const APP_LOCALE = "en";

export const metadata: Metadata = {
  title: "Happy Little Bug Town",
  description: "A demo game showing REST API architecture in Node.js.",
  openGraph: {
    locale: APP_LOCALE,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={APP_LOCALE}>
      <body>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <QueryProvider>
          <AuthProvider>
            <GoogleAuthCallbackRegistrar />
            <GridVisibilityProvider>{children}</GridVisibilityProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
