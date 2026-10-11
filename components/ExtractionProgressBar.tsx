export default function ExtractionProgressBar({ phase }: { phase: string }) {
  return (
    <div className="mt-3" role="progressbar" aria-label={phase} aria-live="polite">
      <div className="h-1 overflow-hidden bg-white/5 border border-white/5">
        <div className="h-full w-1/3 bg-cyan animate-extract-slide" />
      </div>
      <p className="mt-1.5 text-[11px] text-gray flex items-center gap-1.5">
        <span className="w-1 h-1 rounded-full bg-cyan animate-blink" />
        {phase}
      </p>
    </div>
  );
}
