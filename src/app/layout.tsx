import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { launchGateScript } from "@/lib/storageKeys";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const siteUrl = (() => { try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"); } catch { return new URL("http://localhost:3000"); } })();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "courtsidebio — Your court. Your page.",
  description: "Link-in-bio pages for tennis, pickleball and padel coaches and hitting partners.",
  openGraph: { siteName: "courtsidebio", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`} suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: launchGateScript }} /></head>
    <body>{children}</body>
  </html>;
}
