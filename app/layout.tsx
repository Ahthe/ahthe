import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/header";
import { ThemeProvider } from "./theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://ahthe.vercel.app/"
  ),
  title: {
    default: "Syed Ahthesham Ali - Software Engineer",
    template: "%s | Syed Ahthesham Ali",
  },
  description:
    "Syed Ahthesham Ali - Software Engineer at American Muslim Center, Dearborn, focused on building comprehensive applications and micro products.",
  openGraph: {
    title: "Syed Ahthesham Ali - Software Engineer",
    description:
      "Software Engineer at American Muslim Center, Dearborn, focused on building comprehensive applications and micro products.",
    url: "https://ahthe.vercel.app/",
    siteName: " Syed Ahthesham Ali",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://ahthe.vercel.app//logo.svg",
        width: 1200,
        height: 630,
        alt: " Syed Ahthesham Ali",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: " Syed Ahthesham Ali",
    card: "summary_large_image",
    site: "@onurhan1337",
    creator: "@onurhan1337",
  },
  verification: {
    google: "K1pkJ72cY3DylswXke2MHJGxmjJ91WXwgozcCICvFrU",
    // TODO: Add yandex verification key here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-zinc-50 dark:bg-zinc-950 overflow-y-scroll`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="theme"
          enableSystem
          disableTransitionOnChange
        >
          <main className=" antialiased lg:max-w-2xl md:max-w-full mx-4 mb-40 flex flex-col md:flex-row  mt-2 sm:mt-8 lg:mx-auto">
            <section className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
              <Header />
              {children}
            </section>
          </main>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
