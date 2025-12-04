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
  title: "CanvasIQ | AI ROI & Strategic Roadmap Planning",
  description: "Build your AI strategy with ROI-driven portfolio selection and roadmap generation. CanvasIQ helps you identify, prioritize, and plan AI initiatives for maximum business impact.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  keywords: ['AI ROI', 'AI Strategy', 'AI Portfolio', 'AI Roadmap', 'Business Intelligence', 'AI Planning'],
  authors: [{ name: 'CanvasIQ Agent' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="fixed inset-0 matrix-grid pointer-events-none" />
        <div className="fixed inset-0 radial-overlay pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
