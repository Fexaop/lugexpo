import type { Metadata } from "next";
import { Bebas_Neue, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUG Expo CTF — The Table",
  description: "Open CTF — no login, all challenges live. Play your hand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#05080a] text-foreground">
        {children}
      </body>
    </html>
  );
}
