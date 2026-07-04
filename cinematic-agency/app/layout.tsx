import type { Metadata } from "next";
import { Syne, Outfit } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "YourBrand — Immersive Growth Story",
  description: "From humble beginnings to a thriving marketing empire. Witness our cinematic story of persistence and ultimate success.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${outfit.variable} font-sans min-h-full bg-[#0a0a0f] text-[#f0efff] overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}

