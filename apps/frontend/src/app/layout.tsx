import "dotenv/config";
import "./globals.css";
import type { Metadata } from "next";
import { APP_LOCALE } from "../constants";

export const metadata: Metadata = {
  title: "High traffic city simulator",
  description:
    "A demo application showing how to handle heavy WebSocket traffic and displaying real time updated dashboard.",
  openGraph: {
    locale: APP_LOCALE,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={APP_LOCALE}>
      <body>{children}</body>
    </html>
  );
}
