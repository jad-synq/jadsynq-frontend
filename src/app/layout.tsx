import type { Metadata } from "next";
import { Newsreader, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import Sidebar from "@/components/ui/Sidebar";
import BackendWarmup from "@/components/ui/BackendWarmup";
import OnboardingGate from "@/components/ui/OnboardingGate";
import CopilotPanel from "@/components/copilot/CopilotPanel";
import { Analytics } from "@vercel/analytics/next";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
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
      <body className={`${newsreader.variable} ${manrope.variable} font-sans antialiased bg-paper text-ink`}>
        <AuthProvider>
          <BackendWarmup />
          <OnboardingGate />
          <Sidebar />
          {/* Main content: sidebar offset on desktop, top+bottom bar on mobile */}
          <main className="md:ml-60 min-h-screen pt-14 md:pt-0 pb-16 md:pb-0">
            {children}
          </main>
          <CopilotPanel />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
