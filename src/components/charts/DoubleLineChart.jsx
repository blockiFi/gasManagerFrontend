import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

const axisTick = { fill: "#64748b", fontSize: 12 }

const CustomTooltip = ({ active, payload, label, name, projected }) => {
  if (!active || !payload?.length) return null

  const row = payload[0].payload
  const raw = payload[0].value
  const isMoney = typeof name === "string" && name.includes("₦")
  const main =
    isMoney && typeof raw === "number"
      ? formatCurrency(raw)
      : raw != null
        ? Number(raw).toLocaleString()
        : "—"
  const proj = row?.[projected]
  const projStr =
    proj != null && proj !== ""
      ? isMoney
        ? formatCurrency(proj)
        : Number(proj).toLocaleString()
      : null

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="border-b border-slate-100 pb-1.5 font-medium text-slate-900">{label}</p>
      <p className="mt-2 text-slate-600">
        <span className="text-slate-500">{name}</span>
        <span className="font-medium tabular-nums text-slate-900">{main}</span>
      </p>
      {projStr != null ? (
        <p className="mt-1 flex items-center gap-1.5 text-indigo-600">
          <span className="inline-block h-0 w-8 border-t-2 border-dashed border-indigo-500" />
          <span className="text-xs font-medium uppercase tracking-wide">Projected</span>
          <span className="font-medium tabular-nums">{isMoney ? `₦${projStr}` : projStr}</span>
        </p>
      ) : null}
    </div>
  )
}

export default function DoubleLineChart({
  _SalesData,
  name,
  xKey,
  y1Key,
  toolTipTitle,
  stroke = "#4f46e5",
  projected,
  y2Key = null,
  name2 = null,
  stroke2 = null,
  dual = false,
}) {
  const hasProjection = Boolean(projected)

  const salesData = useMemo(() => {
    const base = Array.isArray(_SalesData) ? _SalesData.map((r) => ({ ...r })) : []
    if (projected && base.length >= 2) {
      base[base.length - 2].connection = base[base.length - 2][y1Key]
      base[base.length - 1].connection = base[base.length - 1][projected]
    }
    return base
  }, [_SalesData, y1Key, projected])

  return (
    <div className="relative h-[360px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={salesData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey={xKey}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(date) => {
              if (/^Q[1-4]\s\d{4}$/.test(date)) return date
              if (/^\d{4}$/.test(date)) return date
              const d = new Date(date)
              if (!Number.isNaN(d.getTime())) {
                return d.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              }
              return date
            }}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(value) => `${Number(value).toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip name={toolTipTitle} projected={projected} />} />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ fontSize: 12, color: "#64748b", paddingBottom: 8 }}
          />
          <Line
            type="monotone"
            dataKey={y1Key}
            name={name}
            stroke={stroke}
            strokeWidth={2.5}
            dot={{ r: 3, fill: stroke, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: stroke, strokeWidth: 0 }}
          />
          {hasProjection ? (
            <>
              <Line
                type="monotone"
                dataKey="connection"
                stroke={stroke}
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                connectNulls={false}
                legendType="none"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={projected}
                name="Projected"
                stroke={stroke}
                strokeWidth={2}
                dot={{ fill: stroke, r: 5, strokeWidth: 2, stroke: "#fff" }}
                connectNulls={false}
              />
            </>
          ) : null}
          {dual && y2Key ? (
            <Line
              type="monotone"
              dataKey={y2Key}
              name={name2}
              stroke={stroke2}
              strokeWidth={2.5}
              dot={{ r: 3, fill: stroke2, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: stroke2, strokeWidth: 0 }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
