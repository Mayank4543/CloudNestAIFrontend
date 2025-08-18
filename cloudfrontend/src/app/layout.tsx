import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "../component/Navigation/ConditionalNavbar";
import ConditionalFooter from "../component/Navigation/ConditionalFooter";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudNest AI - Cloud Storage",
  description: "Modern cloud storage with AI-powered insights",
  icons: {
    icon: [
      {
        url: '/favicon-32x32.svg',
        type: 'image/svg+xml',
        sizes: '32x32'
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        <ConditionalNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
