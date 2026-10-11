"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ctx = createContext<ToastApi | null>(null);

const icons: Record<ToastType, ReactNode> = {
  success: <Check size={14} className="text-[oklch(72%_0.06_240)] shrink-0" />,
  error: <AlertTriangle size={14} className="text-red-400 shrink-0" />,
  info: <Info size={14} className="text-[oklch(72%_0.06_240)] shrink-0" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const api: ToastApi = {
    success: (m) => push("success", m),
    error: (m) => push("error", m),
    info: (m) => push("info", m),
  };

  return (
    <ctx.Provider value={api}>
      {children}
      <div
        className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none"
        role="region"
        aria-live="polite"
        aria-label="Notifiche"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="pointer-events-auto flex items-start gap-2.5 bg-[oklch(13%_0.006_260)] border border-[oklch(72%_.06_240)]/25 p-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              {icons[t.type]}
              <p className="flex-1 text-xs text-[oklch(98.5%_0.002_260)] leading-relaxed break-words min-w-0">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)] transition-colors shrink-0"
                aria-label="Chiudi notifica"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const c = useContext(ctx);
  if (!c) throw new Error("useToast must be used within ToastProvider");
  return c;
}