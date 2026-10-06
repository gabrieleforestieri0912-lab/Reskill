import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://reskill.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/login", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/mcp", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/tools", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/how-it-works/ingestione-fonti", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/how-it-works/pulizia-ai", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/how-it-works/compilazione-skill", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/how-it-works/connessione-mcp", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/how-it-works/lavora-con-ai", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/changelog", priority: 0.7, changeFrequency: "weekly" as const },
  ]

  return staticPages.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
