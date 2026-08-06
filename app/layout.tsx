import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "./auth";
import { LanguageProvider, type Locale } from "@/translations";
import { cookies } from "next/headers";
export const metadata: Metadata = {
 metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3002"),
 title: "Skillgrowth - Trasforma il Web in Markdown Pulito",
 description: "Estensione browser gratuita che converte qualsiasi pagina web in markdown formattato. Solo testo pulito, perfetto per appunti e documentazione.",
 keywords: "markdown, web to markdown, browser extension, testo pulito, note, documentazione",
 authors: [{ name: "Skillgrowth Team" }],
 icons: {
 icon: "/skillgrowth.png",
 apple: "/skillgrowth.png",
 },
 openGraph: {
 title: "Skillgrowth - Trasforma il Web in Markdown",
 description: "Converti qualsiasi pagina web in markdown pulito con un click. Estensione browser gratuita.",
 type: "website",
 images: [{ url: "/skillgrowth.png", width: 1200, height: 630 }],
 },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("skillgrowth-locale")?.value;
  const initialLocale: Locale = localeCookie === "en" ? "en" : "it";

  return (
  <html lang={initialLocale} className="h-full antialiased" data-scroll-behavior="smooth">
  <head />
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
