import type { Metadata } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

//big bold retro font for headings
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton" });
//clean but a little quirky, for normal text
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
//typewriter style font for the small labels
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Swune",
  description: "Swipe. Tune. Swoon. Discover new music by swiping through song previews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}