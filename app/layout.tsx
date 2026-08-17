import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpringGlobalCursor } from "@/components/v1/Skiper61";
import { SeamlessVideoBackground } from "@/components/v1/SeamlessVideo";
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
  title: "Chemitha Sathsilu | Portfolio",
  description: "Portfolio of Chemitha Sathsilu, showcasing web development and AI projects built with modern technologies from idea to deployment.",
  icons: {
    icon: [
      {
        url: "/favicon-d.ico",
        media: "(prefers-color-scheme: light)",
        type: "image/x-icon",
      },
      {
        url: "/favicon-l.ico",
        media: "(prefers-color-scheme: dark)",
        type: "image/x-icon",
      },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col bg-black">
        <SeamlessVideoBackground />
        <SpringGlobalCursor />
        {children}
      </body>
    </html>
  );
}