import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "../component/Navigation/ConditionalNavbar";

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
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">CloudNest AI</h3>
                <p className="text-gray-600 text-sm">
                  Intelligent cloud storage solution for all your file management needs.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Features</h3>
                <ul className="space-y-2">
                  <li><a href="/upload" className="text-gray-600 hover:text-[#18b26f] text-sm">File Upload</a></li>
                  <li><a href="/dashboard" className="text-gray-600 hover:text-[#18b26f] text-sm">Dashboard</a></li>
                  <li><a href="/insights" className="text-gray-600 hover:text-[#18b26f] text-sm">AI Insights</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Documentation</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">API Reference</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Contact Us</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Twitter</a></li>
                  <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">LinkedIn</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 text-sm">© 2025 CloudNest AI. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-[#18b26f] text-sm">Terms of Service</a>
                <a href="#" className="text-gray-500 hover:text-[#18b26f] text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-500 hover:text-[#18b26f] text-sm">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
