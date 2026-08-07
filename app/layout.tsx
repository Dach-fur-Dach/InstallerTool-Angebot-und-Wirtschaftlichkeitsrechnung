import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
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
      </body>
    </html>
  );
}
