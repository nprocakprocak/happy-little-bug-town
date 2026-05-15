import "dotenv/config";
import "./globals.css";
import type { Metadata } from "next";
import { AnonymousIdProvider } from "../context/AnonymousIdContext";
import { GridVisibilityProvider } from "../context/GridVisibilityContext";
import { APP_LOCALE } from "../constants";

export const metadata: Metadata = {
  title: "Happy little park",
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
        <AnonymousIdProvider>
          <GridVisibilityProvider>{children}</GridVisibilityProvider>
        </AnonymousIdProvider>
      </body>
    </html>
  );
}
