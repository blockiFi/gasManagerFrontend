import { formatCurrency } from "@/lib/utils"
import { useMemo, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]

function getByPath(obj, path) {
  if (!obj || !path) return 0
  const parts = path.split(".")
  let cur = obj
  for (const p of parts) {
    if (cur == null) return 0
    cur = cur[p]
  }
  const n = Number(cur)
  return Number.isFinite(n) ? n : 0
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
        <p className="font-medium text-slate-900">{payload[0].name}</p>
        <p className="text-slate-600">₦{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

const PCharts = ({ data, keyValue }) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.map((entry) => ({
      ...entry,
      __value: getByPath(entry, keyValue),
    }))
  }, [data, keyValue])

  const total = useMemo(
    () => chartData.reduce((sum, e) => sum + (Number(e.__value) || 0), 0),
    [chartData]
  )

  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        No chart data
      </div>
    )
  }

  return (
    <>
      <div className="relative h-[280px] w-full sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              data={chartData}
              dataKey="__value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={2}
              stroke="none"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Total</p>
            <p className="text-lg font-semibold tabular-nums text-slate-900">₦{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium text-slate-800">{entry.name}</span>
            <span className="tabular-nums text-slate-500">₦{formatCurrency(entry.__value)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default PCharts
