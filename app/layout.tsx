import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "where2watch — Find where to watch anything",
  description: "Instantly discover where to stream, rent, or buy movies and TV shows. Real-time US availability powered by Watchmode.",
  metadataBase: new URL("https://where2watch.vercel.app"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "where2watch",
    description: "Find where to watch anything. Real-time streaming availability for movies & TV.",
    images: [{ url: "/og.png" }],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
