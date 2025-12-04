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
  title: "AI ROI Canvas | Strategic AI Portfolio Planning",
  description: "Build your AI strategy with ROI-driven portfolio selection and roadmap generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
