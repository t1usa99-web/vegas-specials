import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Vegas Specials — happy hours & deals near you, verified",
  description: "The authoritative, always-fresh source for Las Vegas specials: happy hour, food, drink, freebies — pulled from venue menus and confirmed by visitors.",
  manifest: "/manifest.json",
  robots: { index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false } },
};
export const viewport: Viewport = { themeColor: "#2A1A4A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
