"use client";

import { useState, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen, FileText, Sparkles, Video, MessageSquare,
  Globe, FileCode, Activity,
} from "lucide-react";

interface Stats {
 totalBuckets: number;
 totalSources: number;
 skillsGenerated: number;
 sourcesByType: Record<string, number>;
 lastActivity: Array<{
 type: string;
 name: string;
 date: string;
 sourceType?: string;
 }>;
}

export default function StatsPanel() {
 const [stats, setStats] = useState<Stats | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchStats = async () => {
 try {
 const res = await fetch("/api/stats");
 if (res.ok) {
 const data = await res.json();
 setStats(data);
 }
 } catch (e) {
 console.error("Failed to fetch stats", e);
 } finally {
 setLoading(false);
 }
 };
 fetchStats();
 }, []);

  if (loading) {
  return (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-3">
      {[1,2,3].map((i) => (
        <div key={i} className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[oklch(13% 0.006 260)] animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-12 bg-[oklch(13% 0.006 260)] animate-pulse" />
            <div className="h-3 w-16 bg-[oklch(13% 0.006 260)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4">
        <div className="h-3 w-28 bg-[oklch(13% 0.006 260)] animate-pulse mb-4" />
        <div className="space-y-2">
          {[1,2,3].map((j) => (
            <div key={j} className="h-4 w-full bg-[oklch(13% 0.006 260)] animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4">
        <div className="h-3 w-28 bg-[oklch(13% 0.006 260)] animate-pulse mb-4" />
        <div className="space-y-2">
          {[1,2,3].map((j) => (
            <div key={j} className="h-3 w-full bg-[oklch(13% 0.006 260)] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
  );
  }

 if (!stats) return null;

 const sourceTypeIcons: Record<string, ReactNode> = {
 youtube: <Video size={14} />,
 twitter: <MessageSquare size={14} />,
 reddit: <Globe size={14} />,
 pdf: <FileCode size={14} />,
 };

 const typeLabels: Record<string, string> = {
 youtube: "YouTube",
 twitter: "X/Twitter",
 reddit: "Reddit",
 pdf: "PDF",
 webpage: "Web",
 };

 const statCards = [
 { label: "Bucket", value: stats.totalBuckets, icon: <FolderOpen size={18} />, color: "from-[oklch(13% .006 260)] to-[oklch(13% .006 260)]" },
 { label: "Fonti", value: stats.totalSources, icon: <FileText size={18} />, color: "from-[oklch(13% .006 260)] to-[oklch(72% .06 240)]" },
 { label: "Skill Generate", value: stats.skillsGenerated, icon: <Sparkles size={18} />, color: "from-[oklch(13% .006 260)] to-[oklch(72% .06 240)]" },
 ];

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 <div className="grid grid-cols-3 gap-3">
 {statCards.map((card, idx) => (
 <div
 key={idx}
 className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4 flex items-center gap-3"
 >
 <div className={`w-10 h-10 bg-linear-to-br ${card.color} flex items-center justify-center text-[oklch(72% .06 240)]`}>
 {card.icon}
 </div>
 <div>
 <p className="text-2xl font-bold text-white">{card.value}</p>
 <p className="text-[12px] text-gray font-medium">{card.label}</p>
 </div>
 </div>
 ))}
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4">
 <h4 className="text-[12px] font-bold text-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
 <Activity size={11} /> Fonti per Tipo
 </h4>
 <div className="space-y-2">
 {Object.entries(stats.sourcesByType).length === 0 ? (
 <p className="text-[12px] text-slate-600">Nessuna fonte ancora</p>
 ) : (
 Object.entries(stats.sourcesByType).map(([type, count]) => (
 <div key={type} className="flex items-center justify-between text-xs">
 <span className="flex items-center gap-1.5 text-gray">
 {sourceTypeIcons[type] || <Globe size={14} />}
 {typeLabels[type] || type}
 </span>
 <span className="font-bold text-white">{count}</span>
 </div>
 ))
 )}
 </div>
 </div>

 <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/15 p-4">
 <h4 className="text-[12px] font-bold text-gray uppercase tracking-wider mb-3 flex items-center gap-1.5">
 <Activity size={11} /> AttivitÃ  Recente
 </h4>
 <div className="space-y-2 max-h-[160px] overflow-y-auto">
 {stats.lastActivity.length === 0 ? (
 <p className="text-[12px] text-slate-600">Nessuna attivitÃ </p>
 ) : (
 stats.lastActivity.slice(0, 5).map((item, idx) => (
 <div key={idx} className="flex items-center gap-2 text-[12px]">
 <span className={`w-1.5 h-1.5 ${item.type === "bucket" ? "bg-[oklch(72% .06 240)]" : "bg-[oklch(72% .06 240)]"}`} />
 <span className="text-gray truncate flex-1">{item.name}</span>
 <span className="text-slate-600 shrink-0">
 {new Date(item.date).toLocaleDateString()}
 </span>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </motion.div>
 );
}

