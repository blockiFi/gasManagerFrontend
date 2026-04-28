import { formatCurrency } from "@/lib/utils"
import { Flame, TrendingUp, Scale, Wallet } from "lucide-react"

const TILES = [
  {
    id: "sales",
    label: "Sales",
    key: "totalSalesAmount",
    currency: true,
    icon: TrendingUp,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "kg",
    label: "Volume (kg)",
    key: "totalSalesKg",
    currency: false,
    icon: Scale,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    id: "profit",
    label: "Profit",
    key: "profit",
    currency: true,
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    id: "excess_profit",
    label: "Profit from excess kg",
    key: "ExcessKgProfit",
    currency: true,
    icon: Flame,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
]

function num(row, key) {
  const v = row?.[key]
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function deltaPct(latest, prev) {
  if (prev === null || latest === null || prev === 0) return null
  return ((latest - prev) / prev) * 100
}

function formatValue(tile, value) {
  if (value === null || value === undefined) return "—"
  if (tile.currency) return `₦${formatCurrency(value)}`
  return formatCurrency(value)
}

/**
 * @param {Array} data - chart rows (last row may include projection fields)
 * @param {string|null} activeMetric - which pill metric is shown on the chart (for ring highlight)
 */
export default function AnalyticsKpiStrip({ data, activeMetric }) {
  const rows = Array.isArray(data) ? data : []
  if (rows.length < 1) {
    return null
  }

  const last = rows[rows.length - 1]
  const prev = rows.length >= 2 ? rows[rows.length - 2] : null

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {TILES.map((tile) => {
        const latest = num(last, tile.key)
        const previous = prev ? num(prev, tile.key) : null
        const d = deltaPct(latest, previous)
        const Icon = tile.icon
        const isActive = activeMetric === tile.id

        return (
          <div
            key={tile.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm ${
              isActive ? "border-indigo-300 ring-2 ring-indigo-100" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-500">{tile.label}</span>
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tile.iconBg} ${tile.iconColor}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
              {formatValue(tile, latest)}
            </p>
            {d !== null && Number.isFinite(d) ? (
              <p className={`mt-1 text-xs font-medium ${d >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {d >= 0 ? "+" : ""}
                {d.toFixed(1)}% vs previous
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Not enough history for trend</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
