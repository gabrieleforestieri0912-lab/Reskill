"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/translations";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[oklch(8%_0.004_260)] h-16 box-border">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Brand Logo - Left */}
        <Link href="/" className="flex items-center">
          <Image
            src="/reskill.png"
            alt="Reskill"
            width={24}
            height={24}
            className=" transition-all group-hover:scale-105 group-hover:shadow-[0_0_12px_oklch(60%_0.01_260/0.3)]"
          />
          <span className="text-sm font-bold text-white tracking-tight">
            Reskill
          </span>
        </Link>

        {/* Desktop Nav - Center */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/#howItWorks"
            className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
              pathname === "/#howItWorks"
                ? "text-white bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            How it works
          </Link>
          <Link
            href="/feedback"
            className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
              pathname === "/feedback"
                ? "text-white bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            Feedback
          </Link>
          <Link
            href="/mcp"
            className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
              pathname === "/mcp"
                ? "text-white bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            {t.nav.mcp}
          </Link>
          <Link
            href="/faq"
            className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
              pathname === "/faq"
                ? "text-white bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/#piani"
            className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
              pathname === "/#piani"
                ? "text-white bg-white/10"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            {t.nav.piani}
          </Link>
          {status === "authenticated" && (
            <Link
              href="/feed"
              className={`px-1.5 py-1 text-[14px] font-semibold transition-all ${
                pathname.startsWith("/feed")
                  ? "text-white bg-white/10"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Feed
            </Link>
          )}
        </div>

        {/* Right section - Auth + Mobile button */}
        <div className="flex items-center gap-1">
          {status === "authenticated" && session?.user ? (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden transition-all hover:brightness-125"
                style={{
                  border: "2px solid oklch(72% .06 240 / 0.3)",
                  background: "oklch(0% 0 0 / 0.3)",
                }}
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Avatar"}
                    width={36}
                    height={36}
                    className="object-cover rounded-full scale-105"
                    style={{ width: 36, height: 36 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[oklch(72% .06 240)]">
                    {session.user?.name
                      ? session.user.name[0].toUpperCase()
                      : "U"}
                  </div>
                )}
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[oklch(8%_0.004_260)] border border-white/10 shadow-xl shadow-black/80 py-1.5 z-50">
                  <div className="px-2.5 py-1.5 border-b border-white/6 mb-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {session.user.name || "Utente"}
                    </p>
                    <p className="text-[11px] text-white/60 truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <Link
                    href="/feed"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Feed
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-red-500 hover:text-red-500 hover:bg-white/5 transition-all"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t.nav.esci}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1 bg-[oklch(13% .006 260)] text-white text-xs font-semibold transition-all active:scale-95 hover:bg-cyan hover:text-black hover:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.4)]"
            >
              {t.nav.accedi}
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 text-gray hover:text-white hover:bg-white/5 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              {menuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[oklch(72% .06 240)]/8 bg-[oklch(8%_0.004_260)]">
            <div className="px-6 py-4 space-y-2">
              <Link
                href="/#features"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                Features
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                Feedback
              </Link>
              <Link
                href="/mcp"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {t.nav.mcp}
              </Link>
              <Link
                href="/faq"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                FAQ
              </Link>
              <Link
                href="/#piani"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {t.nav.piani}
              </Link>
              {status === "authenticated" && (
                <Link
                  href="/feed"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all"
                >
                  Feed
                </Link>
              )}
              {status !== "authenticated" && (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-white/80 bg-white/5 hover:text-white hover:bg-[oklch(72% .06 240)] transition-all text-center mt-2"
                >
                  {t.nav.accedi}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
