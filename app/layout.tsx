import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "인터넷 최대 140만원",
  description: "인터넷 최대 140만원",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
