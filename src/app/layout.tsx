import type { Metadata } from "next";
import { Geist, Geist_Mono, Dancing_Script } from "next/font/google";
import "@/app/globals.css"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const handwritten = Dancing_Script({
  variable: "--font-handwritten",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shantal's Vault",
  description: "A secret place for our love letters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${handwritten.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}