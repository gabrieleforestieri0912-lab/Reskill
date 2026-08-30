/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import it from "./it";
import en from "./en";

export type Locale = "it" | "en";

const translations = { it, en } as const;

type TranslationContext = {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (typeof it);
};

const ctx = createContext<TranslationContext | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
    const [locale, setLocaleState] = useState<Locale>(initialLocale || "it");

    const setLocale = (l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("reskill-locale", l);
        document.cookie = `reskill-locale=${l};path=/;max-age=31536000`;
    };

    return (
        <ctx.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </ctx.Provider>
    );
}

export function useTranslation() {
    const c = useContext(ctx);
    if (!c) throw new Error("useTranslation must be within LanguageProvider");
    return c;
}
