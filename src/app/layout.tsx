import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Sidebar from "@/components/ui/Sidebar";
import BackendWarmup from "@/components/ui/BackendWarmup";
import { Analytics } from "@vercel/analytics/next";

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
  title: {
    default: "JAD Synq — H-1B & E-Verify Company Search",
    template: "%s — JAD Synq",
  },
  description: "Search US companies by H-1B sponsorship history and E-Verify enrollment status. Built for international students on OPT, STEM OPT, and H-1B visas.",
  metadataBase: new URL("https://jadsynq.com"),
  openGraph: {
    title: "JAD Synq — H-1B & E-Verify Company Search",
    description: "Find companies that sponsor H-1B visas. Built for OPT & STEM OPT students.",
    url: "https://jadsynq.com",
    siteName: "JAD Synq",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JAD Synq — H-1B & E-Verify Company Search",
    description: "Find companies that sponsor H-1B visas. Built for OPT & STEM OPT students.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Analytics />
      </body>
    </html>
  );
}
