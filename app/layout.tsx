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
  //your live site, so link previews can find the image
  metadataBase: new URL("https://swune.vercel.app"),
  title: "Swune",
  description: "Swipe. Tune. Swoon. Discover new music by swiping through song previews.",
  //what shows up when the link is shared on linkedin, imessage, slack, and so on
  openGraph: {
    title: "Swune: Music Discovery",
    description: "A music discovery app that learns your taste with every swipe.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}