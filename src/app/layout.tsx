import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
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

export const metadata: Metadata = { title: "courtsidebio — Your court. Your page.", description: "Link-in-bio pages for tennis, pickleball and padel coaches and hitting partners." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${barlowCondensed.variable}`}><body>{children}</body></html>;
}
