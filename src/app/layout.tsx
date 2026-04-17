import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lead Admin Web",
  description: "Admin console for product catalog, samples, and access management.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
