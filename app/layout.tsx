import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { Nav } from "@/app/components/Nav";
import { getCategories as getArtworkCategories } from "@/lib/artworks";
import { getCategories as getPhotographyCategories } from "@/lib/photos";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// masthead-style serif for the name heading ("newspaper" vibe)
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

// handwritten font for the tab card titles
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Hindy Hamburger",
  description: "Portfolio of projects, code, and artwork.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const artworkCategories = getArtworkCategories().map((c) => c.name);
  const photographyCategories = getPhotographyCategories().map((c) => c.name);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Nav artworkCategories={artworkCategories} photographyCategories={photographyCategories} />
        {children}
      </body>
    </html>
  );
}