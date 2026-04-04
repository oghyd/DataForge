import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DataForge - Football Practitioner Data Platform",
  description:
    "Collect, analyze, and explore football practitioner data. Solve the lack of structured sports data with a professional data platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
