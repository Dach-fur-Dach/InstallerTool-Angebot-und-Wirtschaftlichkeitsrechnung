import type { Metadata } from "next";
import Script from "next/script";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mieterstrom-Rechner",
  description: "Für den Einsatz beim Kundentermin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${dmSans.variable} h-full antialiased`}>
      <body className="dfd-wave-bg min-h-full">
        <LoadingScreen />
        {children}
        <Analytics />
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="928ab8bf-f5f1-4548-8c9a-b4850e62407f"
        />
      </body>
    </html>
  );
}
