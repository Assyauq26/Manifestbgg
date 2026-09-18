import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manifest Retur BGG16",
  description: "Return Manifest Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
