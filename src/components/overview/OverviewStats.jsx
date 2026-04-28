import { Fuel, Gauge, TrendingUp, Warehouse } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const StatCard = ({ label, value, hint, icon: Icon, iconBg, iconColor }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${iconBg} ${iconColor}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>
    </div>
    <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
  </div>
)

const OverviewStats = ({
  activeDispensersCount,
  totalSales,
  totalCapacity,
  percentageAvailable,
  available,
}) => {
  const pct = Math.min(100, Math.max(0, Number(percentageAvailable) || 0))

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Active pumps"
        value={activeDispensersCount}
        hint="Across all locations"
        icon={Fuel}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <StatCard
        label="Total sales"
        value={`₦${formatCurrency(totalSales)}`}
        hint="All-time recorded sales"
        icon={TrendingUp}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <StatCard
        label="Total capacity"
        value={`${totalCapacity} L`}
        hint="Active dispensers only"
        icon={Warehouse}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-500">Avg. tank level</span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
            <Gauge className="h-4 w-4" aria-hidden />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
          {percentageAvailable}%{" "}
          <span className="text-base font-medium text-slate-500">({available} kg)</span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Share of capacity currently in tank</p>
      </div>
    </div>
  )
}

export default OverviewStats
