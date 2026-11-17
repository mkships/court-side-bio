import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

const siteUrl = (() => { try { return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"); } catch { return new URL("http://localhost:3000"); } })();

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "courtsidebio — The link-in-bio for tennis, pickleball and padel coaches",
  description: "Link-in-bio pages for tennis, pickleball and padel coaches and hitting partners.",
  openGraph: { siteName: "courtsidebio", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={onest.variable}>
    <body>{children}</body>
  </html>;
}
