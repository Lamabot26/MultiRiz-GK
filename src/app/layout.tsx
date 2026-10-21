import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GridKavach: Solar for Everyone | India's Digital Solar Marketplace",
  description:
    "Make the sun pay a part of your electricity bill. GridKavach, by Sreesamvridhi Enterprises Pvt Ltd, lists verified rooftop solar projects; reserve a share from ₹1,000 to ₹1,00,000, receive a fixed monthly credit adjusted on your bill, and let our team handle execution, escrow and AMC. Fully paperless.",
  keywords: [
    "Digital Solar", "solar investment", "rooftop solar India", "community solar", "electricity bill credits",
    "GridKavach", "solar marketplace", "solar project escrow", "RESCO model", "paperless solar booking", "solar AMC",
  ],
  authors: [{ name: "Sreesamvridhi Enterprises Private Limited" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "GridKavach: Solar for Everyone",
    description:
      "Reserve a share of a verified rooftop solar project from ₹1,000 and watch it return as a fixed monthly credit on your electricity bill, executed, monitored and maintained by GridKavach.",
    siteName: "GridKavach",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
