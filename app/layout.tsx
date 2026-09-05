import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "CanvasIQ — AI investment workbench",
  description:
    "Compare AI initiatives, challenge assumptions, and build a feasible portfolio with an evidence-backed decision brief.",
  authors: [{ name: "Noah Hicks" }],
  icons: { icon: "/mark.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
