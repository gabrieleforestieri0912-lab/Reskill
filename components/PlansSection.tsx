/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2, Crown, Star, Briefcase, Building, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

interface PlanDetails {
 id: string;
 name: string;
 price: number;
 credits: number;
 currency: string;
 interval: string;
 features: {
 maxBuckets: number;
 maxSources: number;
 aiGeneration: boolean;
 prioritySupport: boolean;
 teamSharing: boolean;
 };
}

interface SubscriptionInfo {
 plan: string;
 status: string;
 planDetails: PlanDetails;
 cancelAtPeriodEnd?: boolean;
 currentPeriodEnd?: string;
}

const planIcons: Record<string, ReactNode> = {
 free: <Rocket size={14} />,

 pro: <Star size={14} />,
 business: <Briefcase size={14} />,
 enterprise: <Building size={14} />,
};

const PLANS_DATA = [
 {
 id: "free",
 name: "Free",
 price: 0,
  credits: 10,
 currency: "EUR",
 interval: "mese",
 features: { maxBuckets: 1, maxSources: 3, aiGeneration: true, prioritySupport: false, teamSharing: false },
 cta: "Inizia Gratis",
 popular: false,
 },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    credits: 500,
    currency: "EUR",
    interval: "mese",
    features: { maxBuckets: 15, maxSources: 100, aiGeneration: true, prioritySupport: true, teamSharing: false },
    cta: "Scegli Pro",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    price: 29,
    credits: 1500,
    currency: "EUR",
    interval: "mese",
    features: { maxBuckets: 50, maxSources: 500, aiGeneration: true, prioritySupport: true, teamSharing: true },
    cta: "Scegli Business",
    popular: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 59,
    credits: 5000,
    currency: "EUR",
    interval: "mese",
    features: { maxBuckets: -1, maxSources: -1, aiGeneration: true, prioritySupport: true, teamSharing: true },
    cta: "Scegli Enterprise",
    popular: false,
  },
];

export default function PlansSection() {
 const router = useRouter();
 const { data: session } = useSession();
	const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
	const [actionLoading, setActionLoading] = useState<string | null>(null);
 const [message, setMessage] = useState<string | null>(null);

 useEffect(() => {
 const fetchSubscription = async () => {
 if (!session) return;
 try {
 const res = await fetch("/api/subscription");
 if (res.ok) {
 setSubscription(await res.json());
 }
 } catch (e) {
 console.error(e);
 }
 };
 fetchSubscription();
 }, [session]);

 const handlePlanAction = async (planId: string) => {
 setActionLoading(planId);
 setMessage(null);

 try {
 const res = await fetch("/api/stripe/checkout", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ planId }),
 });
 const data = await res.json();

 if (data.url) {
 router.push(data.url);
 } else if (data.demo) {
 setMessage(`✓ Demo: ${data.message}`);
 } else if (data.message) {
 setMessage(data.message);
 }
 } catch (e) {
 setMessage("Errore di connessione");
 } finally {
 setActionLoading(null);
 }
 };

 const handleManageSubscription = async () => {
 setActionLoading("manage");
 try {
 const res = await fetch("/api/stripe/portal", { method: "POST" });
 const data = await res.json();
 if (data.url) router.push(data.url);
 } catch (e) {
 console.error(e);
 } finally {
 setActionLoading(null);
 }
 };

  const currentPlanId = subscription?.plan || "free";

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-6"
 >
 {currentPlanId !== "free" && subscription && (
 <div className="bg-gradient-to-r from-[oklch(13% .006 260)]/60 to-[oklch(13% .006 260)]/40 border border-[oklch(72% .06 240)]/40 p-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-[oklch(72% .06 240)]/20 flex items-center justify-center">
 <Crown size={20} className="text-[oklch(72% .06 240)]" />
 </div>
 <div>
 <p className="text-sm font-bold text-[oklch(98.5%_.002_260)]">
 Piano {subscription.planDetails.name}
 </p>
 <p className="text-[12px] text-[oklch(60%_0.01_260)]">
 {subscription.cancelAtPeriodEnd
 ? `Scade il ${new Date(subscription.currentPeriodEnd!).toLocaleDateString("it-IT")}`
 : `Rinnovo il ${new Date(subscription.currentPeriodEnd!).toLocaleDateString("it-IT")}`
 }
 </p>
 </div>
 </div>
 <button
 onClick={handleManageSubscription}
 disabled={actionLoading === "manage"}
 className="px-3 py-2 bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/30 text-[12px] font-semibold text-[oklch(72% .06 240)] hover:bg-[oklch(13% .006 260)] transition-colors disabled:opacity-50"
 >
 {actionLoading === "manage" ? (
 <Loader2 size={11} className="animate-spin" />
 ) : (
 "Gestisci"
 )}
 </button>
 </div>
 )}

 {message && (
 <div className="bg-[oklch(13% .006 260)] border border-[oklch(72% .06 240)]/20 p-3 text-xs text-[oklch(60%_0.01_260)]">
 {message}
 </div>
 )}

  <div className="space-y-2">
 {PLANS_DATA.map((plan) => {
 const isCurrent = currentPlanId === plan.id;
 const isFree = plan.id === "free";
 const isDowngrade = !isFree && currentPlanId !== "free" && plan.price < (subscription?.planDetails?.price || 0);

 return (
 <div
 key={plan.id}
  className={`relative bg-[oklch(13% .006 260)] p-3 flex items-center gap-3 transition-all duration-300 group ${
  isCurrent
  ? "border border-[oklch(72% .06 240)]/60 shadow-[0_0_15px_rgba(165,213,223,0.1)]"
  : plan.popular
  ? "border border-[oklch(72%_0.06_240)]/40 bg-gradient-to-b from-[oklch(60%_0.01_260/0.08)] to-[oklch(13% .006 260)] shadow-[0_0_15px_oklch(60%_0.01_260/0.08)]"
  : "border border-[oklch(72% .06 240)]/15 hover:border-[oklch(72% .06 240)]/35 hover:bg-white/[0.02]"
  }`}
 >
{plan.popular && !isCurrent && (
 <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-[oklch(72%_.06_240)] text-[oklch(13%_0.006_260)] text-[7px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(165,213,223,0.3)] z-10">
    Più scelto
    </span>
   )}

  <span className="w-8 h-8 bg-[#0a0f14] border border-[oklch(72% .06 240)]/20 flex items-center justify-center text-[oklch(72% .06 240)] group-hover:scale-110 transition-transform duration-300 shrink-0">
  {planIcons[plan.id] || <Rocket size={14} />}
  </span>

  <div className="flex-1 min-w-0">
  <div className="flex items-baseline justify-between gap-2">
  <h3 className="text-xs font-bold text-[oklch(98.5%_.002_260)] truncate">{plan.name}</h3>
  <div className="flex items-baseline gap-0.5 shrink-0">
  <span className="text-sm font-extrabold text-[oklch(98.5%_.002_260)]">€{plan.price}</span>
  <span className="text-[12px] text-[oklch(60%_0.01_260)]">/{plan.interval || "mese"}</span>
  </div>
  </div>
  <div className="flex items-center justify-between mt-0.5">
  <span className="text-[12px] text-[oklch(98.5%_.002_260)]/60">{plan.credits.toLocaleString()} crediti</span>
  {isCurrent ? (
  <span className="text-[12px] font-semibold text-[oklch(72% .06 240)]">{currentPlanId === "free" ? "Piano Attuale" : "Attivo"}</span>
  ) : (
<button
   onClick={() => handlePlanAction(plan.id)}
   disabled={actionLoading !== null}
   className="text-[12px] font-bold transition-all disabled:opacity-50 flex items-center gap-1 bg-[oklch(72%_.06_240)] text-[oklch(13%_0.006_260)] px-2 py-0.5 hover:bg-[oklch(60%_0.08_240)]"
   >
  {actionLoading === plan.id ? (
  <Loader2 size={10} className="animate-spin" />
  ) : (
  <>{isDowngrade ? "Downgrade" : isFree ? "Gratuito" : plan.cta}</>
  )}
  </button>
  )}
  </div>
  </div>
 </div>
 );
 })}
 </div>
 </motion.div>
 );
}

