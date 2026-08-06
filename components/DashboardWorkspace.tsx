
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable react-hooks/immutability */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
 Plus, Search, Trash2, ExternalLink, Zap, Download, Copy, Check,
 FolderOpen, Folder, X, FileText, Eye, Plug, Loader2, Globe, Video,
 MessageSquare, FileCode, AlertTriangle, Sparkles,
 Share2, Activity,
} from "lucide-react";
import StatsPanel from "@/components/StatsPanel";
import PlansSection from "@/components/PlansSection";

interface Source {
 id: string;
 type: string;
 title: string;
 url: string;
 domain: string;
 date: string;
 content: string;
 skillMarkdown: string;
}

interface Bucket {
 id: string;
 name: string;
 description: string;
 sources: Source[];
 generatedSkill?: string;
 updatedAt: string;
}

export default function DashboardWorkspace() {
  const { data: session } = useSession();
 const [buckets, setBuckets] = useState<Bucket[]>([]);
 const [activeBucketId, setActiveBucketId] = useState<string>("");
 const [activeSourceId, setActiveSourceId] = useState<string | null>(null);

 // State for forms
 const [newBucketName, setNewBucketName] = useState("");
 const [newBucketDesc, setNewBucketDesc] = useState("");
 const [newUrl, setNewUrl] = useState("");

 // UI states
 const [isExtracting, setIsExtracting] = useState(false);
 const [isGeneratingSkill, setIsGeneratingSkill] = useState(false);
 const [activeTab, setActiveTab] = useState<"editor" | "preview" | "mcp">("editor");
 const [searchQuery, setSearchQuery] = useState("");
 const [copyFeedback, setCopyFeedback] = useState(false);
 const [showCreateBucketModal, setShowCreateBucketModal] = useState(false);
 const [extractionError, setExtractionError] = useState<string | null>(null);

 const [isLoading, setIsLoading] = useState(true);
 const [selectedModel, setSelectedModel] = useState("");
 const [showDashboard, setShowDashboard] = useState(false);
 const [skillSaveStatus, setSkillSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

 // Fetch real data from MongoDB via API
 useEffect(() => {
 const fetchBuckets = async () => {
 setIsLoading(true);
 try {
 const res = await fetch("/api/buckets");
 if (res.ok) {
 const data = await res.json();
 setBuckets(data);
 if (data.length > 0) {
 setActiveBucketId(data[0].id);
 }
 }
 } catch (e) {
 console.error("Failed to fetch buckets", e);
 } finally {
 setIsLoading(false);
 }
 };
 fetchBuckets();
 }, []);

 const activeBucket = buckets.find((b) => b.id === activeBucketId);

 const handleCreateBucket = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newBucketName.trim()) return;

 try {
 const res = await fetch("/api/buckets", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ name: newBucketName, description: newBucketDesc }),
 });

 if (res.ok) {
 const newB = await res.json();
 setBuckets((prev) => [newB, ...prev]);
 setActiveBucketId(newB.id);
 setActiveSourceId(null);
 }
 } catch (err) {
 console.error(err);
 }

 setNewBucketName("");
 setNewBucketDesc("");
 setShowCreateBucketModal(false);
 };

 const handleAddSource = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newUrl.trim() || !activeBucketId) return;

 setIsExtracting(true);
 setExtractionError(null);

 try {
 const res = await fetch("/api/extract", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ url: newUrl }),
 });

 const data = await res.json();
 if (!res.ok) throw new Error(data.error || "Estrazione fallita");

 const saveRes = await fetch(`/api/buckets/${activeBucketId}/sources`, {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({
 type: data.type,
 title: data.title,
 url: data.url,
 domain: data.domain,
 date: data.date,
 content: data.content,
 skillMarkdown: data.skillMarkdown || "",
 }),
 });

 if (!saveRes.ok) {
 const saveErr = await saveRes.json();
 throw new Error(saveErr.error || "Salvataggio fonte fallito");
 }

 const savedSource: Source = await saveRes.json();

 const updatedBuckets = buckets.map((b) => {
 if (b.id === activeBucketId) {
 return {
 ...b,
 updatedAt: new Date().toISOString(),
 sources: [...b.sources, savedSource],
 };
 }
 return b;
 });

 setBuckets(updatedBuckets);

 setActiveSourceId(savedSource.id);
 setNewUrl("");
 } catch (err: any) {
 console.error(err);
 setExtractionError(err.message || "Errore sconosciuto");
 } finally {
 setIsExtracting(false);
 }
 };

 const handleGenerateSkill = async () => {
 if (!activeBucket || activeBucket.sources.length === 0) return;
 setIsGeneratingSkill(true);
 setActiveTab("editor");

 const sourcesSummary = activeBucket.sources
 .map((s) => `TITOLO: ${s.title}\nURL: ${s.url}\nCONTENUTO:\n${s.content}`)
 .join("\n\n---\n\n");

 try {
 const model = selectedModel || undefined;
 const res = await fetch("/api/generate-skill", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ prompt: activeBucket.name, sourcesSummary, model }),
 });

 if (!res.ok) {
 const data = await res.json().catch(() => ({}));
 const errorMsg = data.error || `Errore ${res.status}`;
 if (res.status === 403 || res.status === 429) {
 const detail = res.status === 429
 ? `Limite orario raggiunto per il piano.`
 : `Crediti esauriti per il piano corrente.`;
 setExtractionError(`âš ï¸ ${detail} ${errorMsg} â€” effettua l'upgrade dalla pagina Account.`);
 } else {
 setExtractionError(`âš ï¸ ${errorMsg}`);
 }
 setIsGeneratingSkill(false);
 return;
 }

 if (!res.body) throw new Error("Stream non disponibile");

 const reader = res.body.getReader();
 const decoder = new TextDecoder();
 let done = false;
 let fullText = "";

 // Start by clearing the skill so the user sees the stream starting
 setBuckets((prev) =>
 prev.map((b) => b.id === activeBucket.id ? { ...b, generatedSkill: "" } : b)
 );

 while (!done) {
 const { value, done: doneReading } = await reader.read();
 done = doneReading;
 if (value) {
 fullText += decoder.decode(value, { stream: true });

 setBuckets((prev) =>
 prev.map((b) => b.id === activeBucket.id ? { ...b, generatedSkill: fullText } : b)
 );
 }
 }

 // Update DB after stream finishes
 const updateRes = await fetch(`/api/buckets/${activeBucket.id}`, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ generatedSkill: fullText }),
 });

 if (updateRes.ok) {
 const updatedBucket = await updateRes.json();
 setBuckets((prev) => prev.map((b) => b.id === activeBucket.id ? { ...b, updatedAt: updatedBucket.updatedAt } : b));
 setSkillSaveStatus("saved");
 }

 } catch (err) {
 console.error(err);
 } finally {
 setIsGeneratingSkill(false);
 }
 };

 const handleEditSkillChange = (newText: string) => {
 if (!activeBucket) return;
 setSkillSaveStatus("unsaved");
 const updatedBuckets = buckets.map((b) => {
 if (b.id === activeBucketId) {
 return {
 ...b,
 generatedSkill: newText,
 updatedAt: new Date().toISOString(),
 };
 }
 return b;
 });
 setBuckets(updatedBuckets);
 };

 const handleSaveSkill = async () => {
 if (!activeBucket || !activeBucket.generatedSkill) return;
 setSkillSaveStatus("saving");
 try {
 const res = await fetch(`/api/buckets/${activeBucket.id}`, {
 method: "PUT",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ generatedSkill: activeBucket.generatedSkill }),
 });
 if (res.ok) {
 setSkillSaveStatus("saved");
 } else {
 setSkillSaveStatus("unsaved");
 }
 } catch {
 setSkillSaveStatus("unsaved");
 }
 };

 const handleCopySkill = () => {
 if (!activeBucket?.generatedSkill) return;
 navigator.clipboard.writeText(activeBucket.generatedSkill);
 setCopyFeedback(true);
 setTimeout(() => setCopyFeedback(false), 2000);
 };

 const handleDownloadSkill = () => {
 if (!activeBucket?.generatedSkill) return;
 const blob = new Blob([activeBucket.generatedSkill], { type: "text/markdown;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 const safeName = activeBucket.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
 a.href = url;
 a.download = `SKILL_${safeName}.md`;
 a.style.display = "none";
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 };

 const handleDeleteSource = async (sourceId: string) => {
 if (!activeBucket) return;
 try {
 const res = await fetch(`/api/sources/${sourceId}`, { method: "DELETE" });
 if (!res.ok) throw new Error("Eliminazione fallita");
 } catch (err) {
 console.error(err);
 return;
 }
 const updatedSources = activeBucket.sources.filter((s) => s.id !== sourceId);
 const updatedBuckets = buckets.map((b) => {
 if (b.id === activeBucketId) {
 return {
 ...b,
 sources: updatedSources,
 updatedAt: new Date().toISOString(),
 };
 }
 return b;
 });
 setBuckets(updatedBuckets);

 if (activeSourceId === sourceId) {
 setActiveSourceId(null);
 }
 };

 const handleDeleteBucket = async (bucketId: string) => {
 if (!confirm("Sei sicuro di voler eliminare questo intero Bucket?")) return;
 try {
 const res = await fetch(`/api/buckets/${bucketId}`, { method: "DELETE" });
 if (!res.ok) throw new Error("Eliminazione fallita");
 } catch (err) {
 console.error(err);
 return;
 }
 const updatedBuckets = buckets.filter((b) => b.id !== bucketId);
 setBuckets(updatedBuckets);

 if (activeBucketId === bucketId) {
 if (updatedBuckets.length > 0) {
 setActiveBucketId(updatedBuckets[0].id);
 } else {
 setActiveBucketId("");
 }
 setActiveSourceId(null);
 }
 };

 // Helper icons
 const getSourceIcon = (type: string) => {
 switch (type) {
 case "youtube":
 return (
 <span className="w-8 h-8 bg-[#271d1d] border border-[oklch(13%_.006_260)]/35 text-[oklch(72%_.06_240)] flex items-center justify-center font-bold text-[12px]">
 YT
 </span>
 );
 case "twitter":
 return (
 <span className="w-8 h-8 bg-[#14202a] border border-sky-900/35 text-[oklch(72%_.06_240)] flex items-center justify-center font-bold text-[12px]">
 ð•
 </span>
 );
 case "reddit":
 return (
 <span className="w-8 h-8 bg-[#271c14] border border-orange-900/35 text-[oklch(72%_.06_240)] flex items-center justify-center font-bold text-[12px]">
 RD
 </span>
 );
 case "pdf":
 return (
 <span className="w-8 h-8 bg-[#14251e] border border-emerald-900/35 text-[oklch(72%_.06_240)] flex items-center justify-center font-bold text-[12px]">
 PDF
 </span>
 );
 default:
 return (
 <span className="w-8 h-8 bg-[#1e3238] border border-slate-850 text-[oklch(72% .06 240)] flex items-center justify-center font-bold text-[12px]">
 WEB
 </span>
 );
 }
 };

 const filteredBuckets = buckets.filter((b) =>
 b.name.toLowerCase().includes(searchQuery.toLowerCase())
 );

 return (
 <main className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-73px)] pt-[73px] bg-[oklch(13% 0.006 260)] text-slate-350 select-none">
 {/* LEFT SIDEBAR: BUCKETS LIST */}
 <aside className="w-full md:w-80 bg-[oklch(13% .006 260)] border-b md:border-b-0 md:border-r border-[oklch(72% .06 240)]/15 p-6 flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-bold text-[oklch(98.5%_.002_260)] tracking-tight">I tuoi Bucket</h2>
 <button
 onClick={() => setShowCreateBucketModal(true)}
 className="w-8 h-8 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] border border-[oklch(72% .06 240)]/40 flex items-center justify-center transition-transform active:scale-95"
 title="Crea nuovo Bucket"
 >
 <Plus size={14} />
 </button>
 </div>

 {/* Search */}
 <div className="relative">
 <input
 type="text"
 placeholder="Cerca bucket..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 px-4 py-2 text-xs text-[oklch(98.5%_0.002_260)] focus:outline-none focus:border-[oklch(72% .06 240)] transition-colors"
 />
 <Search size={12} className="absolute right-3 top-2.5 text-[oklch(60%_0.01_260)]" />
 </div>

 {/* Buckets list */}
 <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
 {filteredBuckets.length === 0 ? (
 <p className="text-xs text-[oklch(60%_0.01_260)] text-center py-6">Nessun bucket trovato</p>
 ) : (
 filteredBuckets.map((b) => (
 <div
 key={b.id}
 onClick={() => {
 setActiveBucketId(b.id);
 setActiveSourceId(null);
 }}
 className={`w-full text-left p-4 border transition-all cursor-pointer group ${activeBucketId === b.id
 ? "bg-[oklch(13% .006 260)]/35 border-[oklch(72% .06 240)]/60 text-[oklch(72% .06 240)]"
 : "bg-[oklch(13% 0.006 260)]/30 border-[oklch(72% .06 240)]/10 hover:border-[oklch(72% .06 240)]/35"
 }`}
 >
 <div className="flex justify-between items-start mb-1">
 <h3 className="font-bold text-[oklch(98.5%_0.002_260)] group-hover:text-[oklch(98.5%_.002_260)] transition-colors line-clamp-1 text-sm">
 {b.name}
 </h3>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteBucket(b.id);
 }}
 className="text-[oklch(60%_0.01_260)] hover:text-[oklch(72%_.06_240)] text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-2"
 title="Elimina bucket"
 >
 <Trash2 size={12} />
 </button>
 </div>
 <p className="text-[12px] text-[oklch(60%_0.01_260)] line-clamp-2 mb-3">{b.description}</p>
 <div className="flex justify-between items-center text-[12px] text-slate-600">
 <span>{b.sources.length} fonti</span>
 <span>{b.updatedAt}</span>
 </div>
 </div>
 ))
 )}
 </div>



 {/* PLANS / SUBSCRIPTION */}
 <div className="mt-auto pt-6">
 <PlansSection />
 </div>
 </aside>

 {/* MIDDLE SECTION: BUCKET DETAILS & ADD URL */}
 {buckets.length === 0 && !isLoading ? (
 <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[oklch(13% .006 260)]/50 relative overflow-hidden">
 <div className="absolute inset-0 bg-linear-to-br from-[oklch(13% .006 260)]/20 via-transparent to-[oklch(72% .06 240)]/10 pointer-events-none" />
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, ease: "easeOut" }}
 className="max-w-xl z-10 w-full"
 >
 <div className="bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/30 p-10 shadow-[0_20px_50px_oklch(13% 0.006 260)]">
 <div className="w-20 h-20 bg-linear-to-tr from-[oklch(13% .006 260)] to-[oklch(72% .06 240)] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(77,138,150,0.3)] rotate-3">
 <Sparkles size={40} className="text-[oklch(72% .06 240)]" />
 </div>
 <h2 className="text-3xl font-extrabold text-[oklch(98.5%_.002_260)] mb-4 tracking-tight">Benvenuto in Skillgrowth!</h2>
 <p className="text-[oklch(72% .06 240)] mb-8 text-sm leading-relaxed max-w-md mx-auto">
 Il tuo <strong className="text-[oklch(98.5%_.002_260)]">secondo cervello AI</strong> Ã¨ pronto. Inizia creando un Bucket per collezionare fonti web tramite l&apos;estensione, e poi usa l&apos;Intelligenza Artificiale per compilare super-skill contestuali.
 </p>
 <button
 onClick={() => setShowCreateBucketModal(true)}
 className="w-full sm:w-auto mx-auto px-8 py-4 bg-linear-to-r from-[oklch(72% .06 240)] to-[oklch(13% .006 260)] hover:from-[oklch(72% .06 240)] hover:to-[oklch(72% .06 240)] text-[oklch(98.5%_.002_260)] font-bold transition-all shadow-[0_0_20px_rgba(77,138,150,0.4)] flex items-center justify-center gap-3"
 >
 <Plus size={20} />
 Crea il tuo Primo Bucket
 </button>
 </div>
 </motion.div>
 </div>
 ) : (
 <>
 <section className="flex-1 flex flex-col md:max-w-2xl border-b md:border-b-0 md:border-r border-[oklch(72% .06 240)]/15 bg-[oklch(13% 0.006 260)]/40 p-6 gap-6">
 {activeBucket ? (
 <>
 {/* Header info */}
 <div>
 <div className="flex items-center gap-2 mb-1.5">
 <span className="px-2 py-0.5 rounded bg-[oklch(13% .006 260)]/40 border border-[oklch(72% .06 240)]/30 text-[oklch(72% .06 240)] text-[12px] uppercase font-bold tracking-wider">
 Bucket Attivo
 </span>
 <span className="text-[12px] text-slate-650 font-mono">ID: {activeBucket.id}</span>
 </div>
 <h1 className="text-2xl font-bold text-[oklch(98.5%_.002_260)] tracking-tight">{activeBucket.name}</h1>
 <p className="text-xs text-[oklch(60%_0.01_260)] mt-1">{activeBucket.description}</p>
 </div>

 {/* Dashboard Stats Toggle */}
 <button
 onClick={() => setShowDashboard(!showDashboard)}
 className="flex items-center gap-2 text-[12px] font-semibold text-[oklch(72% .06 240)] hover:text-[oklch(72% .06 240)] transition-colors"
 >
 <Activity size={12} />
 {showDashboard ? "Nascondi" : "Mostra"} Dashboard Statistiche
 </button>
 {showDashboard && <StatsPanel />}

 {/* Add Source URL Form */}
 <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-5">
 <h3 className="text-xs font-semibold text-slate-350 mb-3 flex items-center gap-2">
 <Plus size={12} className="text-[oklch(72% .06 240)]" /> Aggiungi URL al Bucket
 </h3>
 <form onSubmit={handleAddSource} className="flex gap-2">
 <input
 type="url"
 placeholder="Incolla link di YouTube, Twitter, Reddit, PDF o Articolo..."
 value={newUrl}
 onChange={(e) => setNewUrl(e.target.value)}
 className="flex-1 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 px-4 py-2.5 text-xs text-[oklch(98.5%_0.002_260)] focus:outline-none focus:border-[oklch(72% .06 240)] transition-colors"
 required
 />
 <button
 type="submit"
 disabled={isExtracting}
 className="px-5 py-2.5 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] border border-[oklch(72% .06 240)]/30 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
 >
 {isExtracting ? (
 <Loader2 size={14} className="animate-spin" />
 ) : (
 "Estrai AI"
 )}
 </button>
 </form>
 {extractionError && (
 <p className="text-xs text-[oklch(72%_.06_240)] mt-2 flex items-center gap-1"><AlertTriangle size={11} /> {extractionError}</p>
 )}
 <div className="flex gap-4 mt-3 text-[12px] text-slate-600 font-medium">
 <span className="flex items-center gap-1"><Video size={9} /> YouTube</span>
 <span className="flex items-center gap-1"><MessageSquare size={9} /> X/Twitter</span>
 <span className="flex items-center gap-1"><Globe size={9} /> Reddit</span>
 <span className="flex items-center gap-1"><FileCode size={9} /> PDF / Web</span>
 </div>
 </div>

 {/* Source items list */}
 <div className="flex-1 flex flex-col gap-4 overflow-hidden">
 <div className="flex items-center justify-between">
 <h3 className="text-[12px] font-bold text-[oklch(60%_0.01_260)] uppercase tracking-wider">
 Fonti incluse ({activeBucket.sources.length})
 </h3>
 <div className="flex items-center gap-2">
 <select
 value={selectedModel}
 onChange={(e) => setSelectedModel(e.target.value)}
 className="bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 px-2 py-1 text-[12px] text-[oklch(60%_0.01_260)] focus:outline-none focus:border-[oklch(72% .06 240)] cursor-pointer"
 title="Modello AI per la generazione"
 >
 <option value="">Modello Auto</option>
 <option value="gpt-4o-mini">GPT-4o Mini</option>
 <option value="gpt-4o">GPT-4o</option>
 <option value="llama3">Llama 3 (locale)</option>
 <option value="llama3.1">Llama 3.1 (locale)</option>
 <option value="mistral">Mistral (locale)</option>
 </select>
 {activeBucket.sources.length > 0 && (
 <button
 onClick={handleGenerateSkill}
 disabled={isGeneratingSkill}
 className="text-xs font-bold text-[oklch(72% .06 240)] hover:text-[oklch(72% .06 240)] transition-colors flex items-center gap-1 disabled:opacity-50"
 >
 {isGeneratingSkill ? (
 <>
 <Loader2 size={11} className="animate-spin" />
 Compilazione AI...
 </>
 ) : (
 <><Zap size={11} /> Rigenera Skill AI</>
 )}
 </button>
 )}
 </div>
 </div>

 <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
 {activeBucket.sources.length === 0 ? (
 <div className="text-center py-16 border-2 border-dashed border-[oklch(72% .06 240)]/15 flex flex-col items-center justify-center p-6 bg-[oklch(13% .006 260)]/20">
 <FolderOpen size={36} className="text-[oklch(72% .06 240)] mb-3" />
 <h4 className="font-bold text-slate-350 text-sm">Nessuna fonte salvata</h4>
 <p className="text-[12px] text-[oklch(60%_0.01_260)] max-w-xs mt-1 leading-relaxed">
 Aggiungi dei link qui sopra per iniziare a popolare il tuo Bucket con dati puliti.
 </p>
 </div>
 ) : (
 activeBucket.sources.map((s) => (
 <div
 key={s.id}
 onClick={() => setActiveSourceId(s.id)}
 className={`p-4 border flex justify-between items-center gap-4 transition-all cursor-pointer group ${activeSourceId === s.id
 ? "bg-[oklch(13% .006 260)]/20 border-[oklch(72% .06 240)]/60"
 : "bg-[oklch(13% .006 260)]/40 border-[oklch(72% .06 240)]/10 hover:border-[oklch(72% .06 240)]/30"
 }`}
 >
 <div className="flex items-center gap-3 overflow-hidden">
 {getSourceIcon(s.type)}
 <div className="overflow-hidden">
 <h4 className="text-xs font-bold text-[oklch(98.5%_0.002_260)] group-hover:text-[oklch(98.5%_.002_260)] transition-colors truncate">
 {s.title}
 </h4>
 <p className="text-[12px] text-slate-550 truncate mt-0.5 font-mono">
 {s.domain} â€¢ {s.date}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <a
 href={s.url}
 target="_blank"
 rel="noreferrer"
 onClick={(e) => e.stopPropagation()}
 className="text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)] text-xs transition-colors p-1"
 title="Apri URL originale"
 >
 <ExternalLink size={12} />
 </a>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteSource(s.id);
 }}
 className="text-[oklch(60%_0.01_260)] hover:text-[oklch(72%_.06_240)] text-xs transition-colors p-1"
 title="Rimuovi fonte"
 >
 <Trash2 size={12} />
 </button>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Core CTA: Generate AI Skill */}
 {activeBucket.sources.length > 0 && !activeBucket.generatedSkill && (
 <button
 onClick={handleGenerateSkill}
 disabled={isGeneratingSkill}
 className="w-full py-4 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] border border-[oklch(72% .06 240)]/35 font-bold text-xs transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {isGeneratingSkill ? (
 <>
 <Loader2 size={14} className="animate-spin" />
 Compilazione delle fonti in corso...
 </>
 ) : (
 <>
 <Sparkles size={14} /> Compila in SKILL.md (AI Context)
 </>
 )}
 </button>
 )}
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
 <Folder size={40} className="text-[oklch(72% .06 240)] mb-4" />
 <h2 className="text-base font-bold text-[oklch(98.5%_0.002_260)]">Nessun Bucket selezionato</h2>
 <p className="text-xs text-[oklch(60%_0.01_260)] mt-1 max-w-xs leading-relaxed">
 Seleziona un bucket dal menu a sinistra o creane uno nuovo per iniziare ad accumulare abilitÃ  AI.
 </p>
 </div>
 )}
 </section>

 {/* RIGHT PANEL: AI SKILL EDITOR & PREVIEW */}
 <main className="flex-1 flex flex-col bg-[oklch(13% 0.006 260)]/60 p-6 gap-6">
 {activeBucket ? (
 activeBucket.generatedSkill ? (
 <div className="flex-1 flex flex-col h-full overflow-hidden">
 {/* Header Editor tabs */}
 <div className="flex justify-between items-center border-b border-[oklch(72% .06 240)]/15 pb-4 mb-4">
 <div className="flex items-center gap-1 p-1 bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 text-xs">
 <button
 onClick={() => setActiveTab("editor")}
 className={`px-3 py-1.5 font-medium transition-all ${activeTab === "editor"
 ? "bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] font-bold border border-[oklch(72% .06 240)]/30"
 : "text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)]"
 }`}
 >
 <FileText size={11} className="inline mr-1" />Editor SKILL.md
 </button>
 <button
 onClick={() => setActiveTab("preview")}
 className={`px-3 py-1.5 font-medium transition-all flex items-center gap-1 ${activeTab === "preview"
 ? "bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] font-bold border border-[oklch(72% .06 240)]/30"
 : "text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)]"
 }`}
 >
 <Eye size={11} /> Anteprima
 </button>
 <button
 onClick={() => setActiveTab("mcp")}
 className={`px-3 py-1.5 font-medium transition-all flex items-center gap-1 ${activeTab === "mcp"
 ? "bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] font-bold border border-[oklch(72% .06 240)]/30"
 : "text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_0.002_260)]"
 }`}
 >
 <Plug size={11} /> Integrazione MCP
 </button>
 </div>

 <div className="flex gap-2">
 <button
 onClick={handleSaveSkill}
 className={`px-3 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 border ${
 skillSaveStatus === "saved"
 ? "bg-[oklch(13%_.006_260)]/20 text-[oklch(72%_.06_240)] border-emerald-800/30"
 : skillSaveStatus === "saving"
 ? "bg-[oklch(13% .006 260)] text-[oklch(60%_0.01_260)] border-slate-800"
 : "bg-[oklch(13% .006 260)]/40 text-[oklch(72% .06 240)] border-[oklch(72% .06 240)]/30 hover:bg-[oklch(13% .006 260)]"
 }`}
 title="Salva modifiche Skill"
 >
 {skillSaveStatus === "saved" ? <><Check size={12} /> Salvato</> :
 skillSaveStatus === "saving" ? <><Loader2 size={12} className="animate-spin" /> Salvataggio...</> :
 <><Check size={12} /> Salva</>}
 </button>
 <button
 onClick={() => {
 const url = `${window.location.origin}/share/${activeBucket.id}`;
 navigator.clipboard.writeText(url);
 alert("Link pubblico copiato! Chiunque puÃ² vedere questa Skill.");
 }}
 className="px-3 py-2 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/50 text-xs font-semibold transition-all flex items-center gap-1.5 text-[oklch(72% .06 240)]"
 title="Copia link per la condivisione pubblica"
 >
 <Share2 size={12} /> Pubblica
 </button>
 <button
 onClick={handleCopySkill}
 className="px-3 py-2 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] border border-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 text-[oklch(60%_0.01_260)]"
 >
 {copyFeedback ? <><Check size={12} /> Copiato!</> : <><Copy size={12} /> Copia</>}
 </button>
 <button
 onClick={handleDownloadSkill}
 className="px-3 py-2 bg-[oklch(13% .006 260)]/60 hover:bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] text-xs font-bold border border-[oklch(72% .06 240)]/40 transition-all flex items-center gap-1.5"
 >
 <Download size={12} /> Scarica .md
 </button>
 </div>
 </div>

 {/* Tab views */}
 <div className="flex-1 overflow-hidden flex flex-col">
 {activeTab === "editor" && (
 <div className="flex-1 flex flex-col bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15 overflow-hidden p-1 relative">
 <div className="absolute top-3 right-3 bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 text-[12px] text-[oklch(60%_0.01_260)] px-2 py-0.5 rounded font-mono">
 Modificabile in tempo reale
 </div>
 <textarea
 value={activeBucket.generatedSkill}
 onChange={(e) => handleEditSkillChange(e.target.value)}
 onBlur={handleSaveSkill}
 className="flex-1 bg-transparent text-[oklch(98.5%_0.002_260)] font-mono text-xs p-6 overflow-y-auto focus:outline-none leading-relaxed select-text"
 spellCheck={false}
 />
 </div>
 )}

 {activeTab === "preview" && (
 <div className="flex-1 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15 p-6 overflow-y-auto text-[oklch(98.5%_0.002_260)] max-w-none text-xs leading-relaxed scrollbar-thin select-text">
 {/* Rendered YAML Frontmatter header */}
 <div className="bg-[oklch(13% 0.006 260)]/80 border border-[oklch(72% .06 240)]/20 p-4 mb-6 text-[12px] text-[oklch(60%_0.01_260)] font-mono">
 <div className="text-[oklch(72% .06 240)] font-semibold mb-2 uppercase tracking-wider">METADATI CONTESTO AI (YAML)</div>
 <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
 <div>name:</div>
 <div className="text-[oklch(98.5%_0.002_260)]">
 {activeBucket.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ai-skill
 </div>
 <div>description:</div>
 <div className="text-[oklch(98.5%_0.002_260)]">Skill generata per {activeBucket.name}</div>
 <div>trigger:</div>
 <div className="text-[oklch(98.5%_0.002_260)]">Attiva su argomenti inerenti a {activeBucket.name}</div>
 <div>author:</div>
 <div className="text-[oklch(98.5%_0.002_260)]">Skillgrowth AI</div>
 <div>sources:</div>
 <div className="text-[oklch(98.5%_0.002_260)]">{activeBucket.sources.length} fonti estrapolate</div>
 </div>
 </div>

 {/* Basic Markdown Parser for gorgeous rendering */}
 <div className="space-y-4 font-sans">
 {activeBucket.generatedSkill
 .replace(/---[\s\S]*?---/, "") // Strip YAML block for rendering
 .split("\n\n")
 .map((p, idx) => {
 const trimmed = p.trim();
 if (trimmed.startsWith("# ")) {
 return (
 <h1 key={idx} className="text-xl font-bold text-[oklch(98.5%_.002_260)] pt-4 pb-2 border-b border-slate-800">
 {trimmed.replace("# ", "")}
 </h1>
 );
 }
 if (trimmed.startsWith("## ")) {
 return (
 <h2 key={idx} className="text-sm font-bold text-[oklch(98.5%_.002_260)] pt-3 pb-1">
 {trimmed.replace("## ", "")}
 </h2>
 );
 }
 if (trimmed.startsWith("### ")) {
 return (
 <h3 key={idx} className="text-xs font-bold text-[oklch(98.5%_0.002_260)] pt-2">
 {trimmed.replace("### ", "")}
 </h3>
 );
 }
 if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
 return (
 <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-[oklch(60%_0.01_260)]">
 {trimmed.split("\n").map((li, lIdx) => (
 <li key={lIdx} className="text-[12px]">{li.replace(/^[-*]\s+/, "")}</li>
 ))}
 </ul>
 );
 }
 if (trimmed.startsWith("```")) {
 const lines = trimmed.split("\n");
 const content = lines.slice(1, lines.length - 1).join("\n");
 return (
 <pre key={idx} className="bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 p-4 overflow-x-auto text-[12px] font-mono text-[oklch(72% .06 240)] my-4 select-text">
 <code>{content}</code>
 </pre>
 );
 }
 return (
 <p key={idx} className="text-[oklch(60%_0.01_260)] leading-relaxed whitespace-pre-wrap select-text text-[12px]">
 {trimmed}
 </p>
 );
 })}
 </div>
 </div>
 )}

 {activeTab === "mcp" && (
 <div className="flex-1 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15 p-6 overflow-y-auto text-[oklch(60%_0.01_260)] text-xs leading-relaxed scrollbar-thin select-text space-y-6">
 <div>
 <h2 className="text-sm font-bold text-[oklch(98.5%_.002_260)] mb-2 flex items-center gap-2"><Plug size={14} className="text-[oklch(72% .06 240)]" /> Come Collegare questa Skill ai tuoi Agenti AI</h2>
 <p className="text-[12px] text-[oklch(60%_0.01_260)]">
 Una volta compilate le fonti in una singola skill in formato Markdown, puoi fornirla direttamente al tuo LLM per dargli superpoteri di contesto.
 </p>
 </div>

 <div className="grid gap-4">
 <div className="p-4 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15">
 <h3 className="font-bold text-[oklch(98.5%_.002_260)] text-[12px] mb-1.5 flex items-center gap-1.5">
 <span className="w-5 h-5 rounded bg-[oklch(13% .006 260)]/30 text-[oklch(72% .06 240)] flex items-center justify-center font-mono text-[12px]">C</span>
 Cursor (.cursorrules)
 </h3>
 <p className="text-[12px] text-[oklch(60%_0.01_260)] mb-2">
 Inserisci il contenuto di questo file all&apos;interno del file <code className="bg-[oklch(13% 0.006 260)] px-1.5 py-0.5 rounded text-[oklch(98.5%_.002_260)] text-[12px]">.cursorrules</code> alla radice del tuo progetto. Cursor applicherÃ  automaticamente queste istruzioni ad ogni query.
 </p>
 </div>

 <div className="p-4 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15">
 <h3 className="font-bold text-[oklch(98.5%_.002_260)] text-[12px] mb-1.5 flex items-center gap-1.5">
 <span className="w-5 h-5 rounded bg-[oklch(13%_.006_260)]/20 text-[oklch(72%_.06_240)]/80 flex items-center justify-center font-mono text-[12px]">P</span>
 Claude.ai Projects & Custom GPTs
 </h3>
 <p className="text-[12px] text-[oklch(60%_0.01_260)] mb-2">
 Se utilizzi Claude Pro (Projects) o ChatGPT Plus (Custom GPTs): scarica il file <code className="bg-[oklch(13% 0.006 260)] px-1.5 py-0.5 rounded text-[oklch(98.5%_.002_260)] text-[12px]">.md</code> e caricalo direttamente nella sezione &quot;Project Files&quot; o &quot;Knowledge&quot;. L&apos;AI interrogherÃ  questo documento ogni volta che ne ha bisogno!
 </p>
 </div>

 <div className="p-4 bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/15">
 <h3 className="font-bold text-[oklch(98.5%_.002_260)] text-[12px] mb-1.5 flex items-center gap-1.5">
 <span className="w-5 h-5 rounded bg-[oklch(13%_.006_260)]/20 text-[oklch(72%_.06_240)]/80 flex items-center justify-center font-mono text-[12px]">M</span>
 Model Context Protocol (MCP Server)
 </h3>
 <p className="text-[12px] text-[oklch(60%_0.01_260)] mb-2">
 Salva la skill in una cartella locale sul tuo computer, e configura un server filesystem MCP puntando a quella directory. Gli agenti AI saranno in grado di leggere e scrivere direttamente nelle tue skill registrate!
 </p>
 <pre className="bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 p-2.5 text-[12px] font-mono text-[oklch(72% .06 240)]">
 {`"mcpServers": {
 "skills": {
 "command": "npx",
 "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\\\Users\\\\TuoNome\\\\.skillgrowth\\\\skills"]
 }
}`}
 </pre>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[oklch(13% .006 260)]/20 border border-[oklch(72% .06 240)]/10 ">
 <Sparkles size={40} className="text-[oklch(72% .06 240)] mb-4" />
 <h3 className="text-base font-bold text-[oklch(98.5%_0.002_260)]">Nessuna Skill Compilata</h3>
 <p className="text-xs text-[oklch(60%_0.01_260)] max-w-sm mt-2 leading-relaxed">
 Questo bucket contiene {activeBucket.sources.length} fonti estratte, ma non hai ancora compilato la Skill AI. Clicca su <strong>&quot;Compila in SKILL.md&quot;</strong> nella colonna centrale per unire le fonti con l&apos;AI e generare il file di contesto definitivo!
 </p>
 </div>
 )
 ) : activeSourceId ? (
 // If no bucket selected, but we clicked a source (shouldn't happen, but fallback)
 <div className="flex-1 flex flex-col p-4 bg-[oklch(13% .006 260)]/20 ">
 <h3 className="font-bold text-[oklch(98.5%_0.002_260)] mb-2 text-sm">Visualizzazione Fonte</h3>
 </div>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[oklch(13% .006 260)]/20 border border-[oklch(72% .06 240)]/10 ">
 <Sparkles size={40} className="text-[oklch(72% .06 240)] mb-4" />
 <h3 className="text-base font-bold text-[oklch(60%_0.01_260)]">AI Workspace</h3>
 <p className="text-xs text-[oklch(60%_0.01_260)] max-w-sm mt-2 leading-relaxed">
 Il compilatore di contesto AI si attiverÃ  qui non appena selezioni un bucket e generi la tua Skill.
 </p>
 </div>
 )}
 </main>
 </>
 )}

 {/* CREATE BUCKET MODAL */}
 {showCreateBucketModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
 <div className="w-full max-w-md bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/30 p-6 shadow-2xl">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-base font-bold text-[oklch(98.5%_.002_260)]">Crea Nuovo Bucket</h3>
 <button
 onClick={() => setShowCreateBucketModal(false)}
 className="text-[oklch(60%_0.01_260)] hover:text-[oklch(98.5%_.002_260)] transition-colors"
 >
 <X size={16} />
 </button>
 </div>
 <form onSubmit={handleCreateBucket} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-[oklch(60%_0.01_260)] uppercase tracking-wider mb-2">
 Nome del Bucket
 </label>
 <input
 type="text"
 placeholder="Es: Best Practices NextJS, Appunti Chimica..."
 value={newBucketName}
 onChange={(e) => setNewBucketName(e.target.value)}
 className="w-full bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 px-4 py-3 text-xs text-[oklch(98.5%_0.002_260)] focus:outline-none focus:border-[oklch(72% .06 240)]"
 required
 maxLength={40}
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-[oklch(60%_0.01_260)] uppercase tracking-wider mb-2">
 Descrizione (opzionale)
 </label>
 <textarea
 placeholder="Di cosa trattano le conoscenze in questo bucket..."
 value={newBucketDesc}
 onChange={(e) => setNewBucketDesc(e.target.value)}
 className="w-full bg-[oklch(13% 0.006 260)] border border-[oklch(72% .06 240)]/20 px-4 py-3 text-xs text-[oklch(98.5%_0.002_260)] focus:outline-none focus:border-[oklch(72% .06 240)] h-24 resize-none"
 maxLength={150}
 />
 </div>

 <div className="flex gap-3 justify-end pt-2">
 <button
 type="button"
 onClick={() => setShowCreateBucketModal(false)}
 className="px-4 py-2 border border-slate-800 hover:bg-[oklch(13%_0.006_260)] text-xs font-semibold transition-colors text-slate-450"
 >
 Annulla
 </button>
 <button
 type="submit"
 className="px-5 py-2 bg-[oklch(13% .006 260)] hover:bg-[oklch(13% .006 260)] text-[oklch(72% .06 240)] border border-[oklch(72% .06 240)]/30 text-xs font-bold transition-all"
 >
 Crea Bucket
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </main>
 );
}


