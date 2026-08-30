"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/translations";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-white/6 bg-[oklch(13%_.006_260)]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/reskill.png"
                alt="Reskill"
                width={32}
                height={32}
                className=""
              />
              <span className="font-semibold text-base text-white/90">
                Reskill
              </span>
            </div>
            <p className="text-xs text-gray leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white mb-4">
              {t.footer.prodotto}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/feed"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.feed}
                </Link>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.playground}
                </a>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white mb-4">
              {t.footer.risorse}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/mcp"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.guida_mcp}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/changelog"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.status}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-wider text-white mb-4">
              {t.footer.legale}
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.termini}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray hover:text-cyan transition-colors"
                >
                  {t.footer.cookie}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray">
          <p>© 2026 Reskill. {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
