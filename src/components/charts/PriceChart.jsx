import { useEffect, useMemo, useRef, useState } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

const COMPACT_BREAKPOINT = 520

function formatAxisPrice(value, compact) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "—"
  if (compact) {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `₦${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  }
  return `₦${formatCurrency(n)}`
}

function formatDateLabel(value, compact) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  if (compact) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })
}

function formatTooltipDate(value) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function isActiveRow(row) {
  const v = row?.active
  return v === true || v === "true" || v === 1 || v === "1"
}

const PriceTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const price = Number(row.price)

  return (
    <div className="min-w-[10rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-lg ring-1 ring-slate-900/5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {formatTooltipDate(row.created_at)}
      </p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-slate-900">
        ₦{formatCurrency(price)}
      </p>
      {isActiveRow(row) ? (
        <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
          Current price
        </span>
      ) : null}
    </div>
  )
}

/**
 * Responsive price history chart for the Prices page.
 */
const PriceChart = ({ data = [] }) => {
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined

    const update = () => setContainerWidth(node.getBoundingClientRect().width)
    update()

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setContainerWidth(width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const compact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return []
    return [...data]
      .map((row) => ({
        ...row,
        price: Number(row.price) || 0,
        created_at: row.created_at,
      }))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  }, [data])

  const stats = useMemo(() => {
    if (chartData.length === 0) return null
    const first = chartData[0].price
    const last = chartData[chartData.length - 1].price
    const delta = last - first
    const pct = first > 0 ? (delta / first) * 100 : 0
    return { first, last, delta, pct, count: chartData.length }
  }, [chartData])

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100]
    const values = chartData.map((d) => d.price)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = Math.max((max - min) * 0.12, max * 0.05, 1)
    return [Math.max(0, min - pad), max + pad]
  }, [chartData])

  const chartMargins = compact
    ? { top: 8, right: 8, left: 0, bottom: 4 }
    : { top: 12, right: 16, left: 4, bottom: 8 }

  const xAxisHeight = compact ? 52 : 32
  const yAxisWidth = compact ? 44 : 56

  if (chartData.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-500 sm:min-h-[280px]">
        No price data to display
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full min-w-0">
      {stats ? (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Latest</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              ₦{formatCurrency(stats.last)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Starting</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              ₦{formatCurrency(stats.first)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Change</p>
            <p
              className={`mt-1 text-sm font-semibold tabular-nums sm:text-base ${
                stats.delta >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {stats.delta >= 0 ? "+" : "−"}₦{formatCurrency(Math.abs(stats.delta))}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Records</p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {stats.count}
            </p>
          </div>
        </div>
      ) : null}

      <div className="h-[240px] w-full min-w-0 sm:h-[300px] lg:h-[360px]">
        <ResponsiveContainer width="100%" height="100%" debounce={50}>
          <ComposedChart data={chartData} margin={chartMargins}>
            <defs>
              <linearGradient id="priceAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="created_at"
              tick={{ fill: "#64748b", fontSize: compact ? 10 : 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              interval={chartData.length > 8 && compact ? "preserveStartEnd" : 0}
              minTickGap={compact ? 4 : 12}
              angle={compact && chartData.length > 4 ? -35 : 0}
              textAnchor={compact && chartData.length > 4 ? "end" : "middle"}
              height={xAxisHeight}
              tickFormatter={(v) => formatDateLabel(v, compact)}
            />
            <YAxis
              domain={yDomain}
              width={yAxisWidth}
              tick={{ fill: "#64748b", fontSize: compact ? 10 : 11 }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tickFormatter={(v) => formatAxisPrice(v, compact)}
            />
            <Tooltip content={<PriceTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="none"
              fill="url(#priceAreaFill)"
              isAnimationActive={chartData.length <= 24}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={compact ? 2 : 2.5}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (cx == null || cy == null) return null
                const active = isActiveRow(payload)
                const r = active ? 5 : chartData.length > 12 ? 0 : 3
                if (r === 0 && !active) return null
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={active ? "#059669" : "#4f46e5"}
                    stroke="#fff"
                    strokeWidth={active ? 2 : 1.5}
                  />
                )
              }}
              activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={chartData.length <= 24}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PriceChart
