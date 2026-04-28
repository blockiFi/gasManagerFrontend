import { Clock } from "lucide-react"

/**
 * Hero band for dashboard / location headers.
 * Stats KPIs live in OverviewStats on the overview page.
 */
const HeaderCard = ({
  name,
  address,
  lastUpdated,
  children,
  // Legacy props from older call sites — ignored for layout
  totalSales: _totalSales,
  loactionCount: _loactionCount,
  totalCapacity: _totalCapacity,
  percentageAvailable: _percentageAvailable,
  available: _available,
  activeDispensersCount: _activeDispensersCount,
}) => {
  const updatedLabel =
    lastUpdated ||
    new Date().toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/90 shadow-sm">
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{name}</h1>
          {address ? (
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">{address}</p>
          ) : null}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
            <span>Last updated: {updatedLabel}</span>
          </div>
        </div>
        {children ? (
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">{children}</div>
        ) : null}
      </div>
    </div>
  )
}

export default HeaderCard
