import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "./auth";
import { LanguageProvider, type Locale } from "@/translations";
import { cookies } from "next/headers";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://reskill.app";
const SITE_NAME = "Reskill";
const SITE_DESCRIPTION = "Trasforma YouTube, Reddit, PDF e pagine web in Skill Markdown strutturate per agenti AI come Cursor, Claude e ChatGPT. Estensione browser gratuita + AI-powered.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Reskill — Trasforma il Web in Skill Markdown per AI Agent",
    template: "%s | Reskill",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "markdown converter", "web to markdown", "AI skill generator", "Cursor rules",
    "Claude projects", "ChatGPT custom GPT", "MCP server", "browser extension",
    "YouTube transcript", "PDF to markdown", "AI context file", "prompt engineering",
    "AI agent", "knowledge base", "structured content", "web clipping",
  ],
  authors: [{ name: "Reskill Team", url: SITE_URL }],
  creator: "Reskill",
  publisher: "Reskill",
  formatDetection: { email: false, telephone: false },
  category: "technology",
  classification: "AI Tools, Productivity, Developer Tools",
  referrer: "origin-when-cross-origin",
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
  alternates: {
    canonical: SITE_URL,
    languages: {
      "it": SITE_URL,
      "en": `${SITE_URL}?lang=en`,
    },
  },
  icons: {
    icon: "/reskill.png",
    apple: "/reskill.png",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Reskill — Trasforma il Web in Skill Markdown per AI Agent",
    description: "Converti YouTube, Reddit, PDF e pagine web in Skill Markdown strutturate per agenti AI. Estensione browser gratuita.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Reskill — AI Skill Generator from Web Content",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reskill — Trasforma il Web in Skill Markdown per AI Agent",
    description: "Converti YouTube, Reddit, PDF e pagine web in Skill Markdown per Cursor, Claude, ChatGPT.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@reskill_app",
  },
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1114",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("reskill-locale")?.value;
  const initialLocale: Locale = localeCookie === "en" ? "en" : "it";

  return (
    <html lang={initialLocale} className="h-full antialiased" data-scroll-behavior="smooth">
      <head>
        <link rel="canonical" href={SITE_URL} />
        <meta name="robots" content="index, follow" />
      </head>
      <body className="min-h-full flex flex-col">
        <SessionProvider session={session}>
          <LanguageProvider initialLocale={initialLocale}>
            {children}
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
