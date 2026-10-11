export default function DashboardLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-73px)] pt-[73px] bg-[oklch(13%_0.006_260)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[oklch(72%_.06_240)] border-t-transparent animate-spin" />
        <p className="text-sm text-[oklch(60%_0.01_260)]">Caricamento...</p>
      </div>
    </div>
  )
}
