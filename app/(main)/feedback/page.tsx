"use client";

import { useState } from "react";
import { useTranslation } from "@/translations";

export default function FeedbackPage() {
 const { t } = useTranslation();
 const [name, setName] = useState("");
 const [email, setEmail] = useState("");
 const [type, setType] = useState("suggestion");
 const [message, setMessage] = useState("");
 const [sent, setSent] = useState(false);
 const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");

 try {
 const res = await fetch("/api/feedback", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name, email, type, message }),
 });

 if (res.ok) {
 setSent(true);
 } else {
 const data = await res.json();
 setError(data.error || "Errore nell'invio del feedback.");
 }
 } catch {
 setError("Errore di connessione. Riprova più tardi.");
 }
 };

 return (
 <div className="min-h-screen bg-[oklch(13% 0.006 260)] text-[oklch(98.5%_0.002_260)] pt-24 pb-20 px-6 relative overflow-hidden selection:bg-[oklch(60%_0.01_260)]/30 selection:text-[oklch(98.5%_0.002_260)]">
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(72%_0.06_240/0.07)_0%,transparent_60%)] pointer-events-none" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_80%_80%,oklch(72%_0.06_240/0.04)_0%,transparent_50%)] pointer-events-none" />
 <div className="max-w-2xl mx-auto relative z-10">

 <div className="text-center mb-10">
 <div className="w-12 h-12 bg-[oklch(13%_0.006_260)] border border-[oklch(72%_0.06_240)]/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_-5px_oklch(72%_0.06_240/0.15)]">
 <svg className="w-6 h-6 text-[oklch(72%_0.06_240)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
 <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
 </svg>
 </div>
 <h1 className="text-3xl font-bold text-white">{t.feedback.title}</h1>
 <p className="text-sm text-[oklch(60%_0.01_260)] mt-2">{t.feedback.subtitle}</p>
 </div>

 {sent ? (
 <div className="p-10 bg-[oklch(13% 0.006 260)] border border-emerald-700/20 text-center shadow-lg">
 <div className="w-16 h-16 bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center mx-auto mb-4">
 <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
 <path d="M5 13l4 4L19 7" />
 </svg>
 </div>
 <p className="text-white font-semibold">{t.feedback.success}</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(60%_0.01_260)] block mb-1.5">{t.feedback.name_label}</label>
 <input
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder={t.feedback.name_placeholder}
 className="w-full px-4 py-3 bg-black/70 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(60%_0.01_260)] block mb-1.5">{t.feedback.email_label}</label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder={t.feedback.email_placeholder}
 className="w-full px-4 py-3 bg-black/70 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
 />
 </div>
 </div>

 <div>
 <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(60%_0.01_260)] block mb-1.5">{t.feedback.type_label}</label>
 <select
 value={type}
 onChange={(e) => setType(e.target.value)}
 className="w-full px-4 py-3 bg-black/70 border border-white/10 text-sm text-white focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all"
 >
 <option value="suggestion">{t.feedback.type_suggestion}</option>
 <option value="bug">{t.feedback.type_bug}</option>
 <option value="other">{t.feedback.type_other}</option>
 </select>
 </div>

 <div>
 <label className="text-[10px] font-bold uppercase tracking-wider text-[oklch(60%_0.01_260)] block mb-1.5">{t.feedback.message_label}</label>
 <textarea
 required
 rows={5}
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder={t.feedback.message_placeholder}
 className="w-full px-4 py-3 bg-black/70 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[oklch(72%_0.06_240)]/40 focus:shadow-[0_0_12px_-4px_oklch(72%_0.06_240/0.15)] transition-all resize-none"
 />
 </div>

 {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2">{error}</p>}

 <button
 type="submit"
 className="w-full py-3.5 bg-[oklch(72%_0.06_240)] text-black text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_-5px_oklch(72%_0.06_240/0.3)]"
 >
 {t.feedback.submit}
 </button>
 </form>
 )}
 </div>
 </div>
 );
}
