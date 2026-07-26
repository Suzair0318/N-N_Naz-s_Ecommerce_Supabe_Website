import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { Toaster } from "sonner";

import { cn } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

function getMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      // Invalid env value — fall back for local/dev.
    }
  }
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  title: {
    default: "Naz's Collection — Women's Clothing",
    template: "%s · Naz's Collection",
  },
  description:
    "Ultra-luxurious modern women's fashion. Modern elegance for 2026.",
  metadataBase: getMetadataBase(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(playfair.variable, inter.variable)}>
      <body className="font-sans">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: "0",
              border: "1px solid #E0E0E0",
            },
          }}
        />
      </body>
    </html>
  );
}
