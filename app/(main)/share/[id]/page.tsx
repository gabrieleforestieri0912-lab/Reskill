/* eslint-disable @typescript-eslint/no-unused-vars */
import { getBucketById } from "@/models/Bucket";
import ReactMarkdown from "react-markdown";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PublicSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let bucket = null;
  try {
    bucket = await getBucketById(id);
  } catch (e) {
    // Invalid ID format
  }

  if (!bucket || !bucket.generated_skill) {
    return (
      <div className="min-h-screen bg-[oklch(13% 0.006 260)] flex items-center justify-center text-[oklch(60%_0.06_240)] font-medium">
        <p>Skill non trovata o ancora in elaborazione.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(13% 0.006 260)] text-[oklch(98.5% 0.002 260)] selection:bg-[oklch(60%_0.01_260)] selection:text-white pb-20">
      <nav className="border-b border-[oklch(13%_0.006_260)] bg-[oklch(13% 0.006 260)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[oklch(98.5%_0.002_260)] font-bold text-lg hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-sm bg-[oklch(13%_0.006_260)] border border-[oklch(60%_0.01_260)] flex items-center justify-center shadow-[0_0_10px_oklch(60%_0.01_260/0.3)]">
              <Sparkles size={18} className="text-[oklch(98.5%_0.002_260)]" />
            </div>
            Reskill
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs text-[oklch(60%_0.06_240)] hidden sm:block">
              Pubblicato da <span className="text-[oklch(98.5%_0.002_260)] font-medium">{bucket.user_email}</span>
            </div>
            <Link href="/dashboard" className="text-xs font-medium bg-[oklch(13%_0.006_260)] border border-[oklch(60%_0.01_260)] text-[oklch(98.5%_0.002_260)] px-3 py-1.5 rounded-full hover:bg-[oklch(60%_0.01_260)] hover:text-white transition-colors flex items-center gap-1">
              Crea la tua Skill
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-16">
        <div className="mb-12 border-b border-[oklch(13%_0.006_260)] pb-8">
          <div className="inline-block px-3 py-1 bg-[oklch(13%_0.006_260)] text-[oklch(98.5%_0.002_260)] text-[10px] font-bold tracking-wider uppercase rounded-full mb-4">
            Public Skill
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{bucket.name}</h1>
          <p className="text-[oklch(72%_0.06_240)] text-lg leading-relaxed">{bucket.description}</p>
        </div>

        <div className="prose prose-invert prose-cyan max-w-none prose-headings:text-white prose-a:text-[oklch(98.5%_0.002_260)] prose-pre:bg-[oklch(13% 0.006 260)] prose-pre:border prose-pre:border-[oklch(13%_0.006_260)] prose-code:text-[oklch(98.5%_0.002_260)]">
          <ReactMarkdown>{bucket.generated_skill}</ReactMarkdown>
        </div>
      </main>
    </div>
  );
}
