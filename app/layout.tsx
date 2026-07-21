import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { CrtOverlay } from "@/components/crt-overlay";
import "./globals.css";

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUG Expo CTF — The Table",
  description: "Open CTF — no login, all challenges live. Play your hand.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="crt-grade flex min-h-full flex-col bg-[#05080a] text-foreground">
        {children}
        <CrtOverlay intensity={0.9} />
      </body>
    </html>
  );
}
