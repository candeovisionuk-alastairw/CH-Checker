import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FollowsProvider } from '@/context/FollowsContext';
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
  title: "CVUK CH Checker",
  description: "Companies House Dashboard for CVUK",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <FollowsProvider>{children}</FollowsProvider>
      </body>
    </html>
  )
}
