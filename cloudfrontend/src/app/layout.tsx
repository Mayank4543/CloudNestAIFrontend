import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "../component/Navigation/ConditionalNavbar";
import ConditionalFooter from "../component/Navigation/ConditionalFooter";
import PWAInstallPrompt from "../component/common/PWAInstallPrompt";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloudNest AI - Intelligent Cloud Storage",
  description: "AI-powered cloud storage platform for secure file management, semantic search, and document analysis",
  manifest: "/manifest.json",
  themeColor: "#18b26f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CloudNest AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "CloudNest AI",
    title: "CloudNest AI - Intelligent Cloud Storage",
    description: "AI-powered cloud storage platform for secure file management",
    images: [
      {
        url: "/cloudnest-logo.svg",
        width: 1200,
        height: 630,
        alt: "CloudNest AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudNest AI - Intelligent Cloud Storage",
    description: "AI-powered cloud storage platform for secure file management",
    images: ["/cloudnest-logo.svg"],
  },
  icons: {
    icon: [
      {
        url: '/favicon-16x16.svg',
        type: 'image/svg+xml',
        sizes: '16x16'
      },
      {
        url: '/favicon-32x32.svg',
        type: 'image/svg+xml',
        sizes: '32x32'
      }
    ],
    apple: [
      {
        url: '/apple-touch-icon.svg',
        type: 'image/svg+xml',
        sizes: '180x180'
      }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "CloudNest AI",
    "application-name": "CloudNest AI",
    "msapplication-TileColor": "#18b26f",
    "msapplication-tap-highlight": "no",
  },
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
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
