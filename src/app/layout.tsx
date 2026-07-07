import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Sidebar from "@/components/ui/Sidebar";
import BackendWarmup from "@/components/ui/BackendWarmup";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JAD Synq — H-1B & E-Verify Company Search",
  description: "Search US companies by H-1B sponsorship history and E-Verify enrollment status.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f0fdf4]`}>
        <AuthProvider>
          <BackendWarmup />
          <Sidebar />
          {/* Main content: offset by sidebar width on desktop, top bar height on mobile */}
          <main className="md:ml-60 min-h-screen pt-14 md:pt-0">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
