import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

/**
 * Responsive price (or generic) line chart.
 * Legacy props `width` / `height` are ignored in favour of a fluid container.
 */
const Chart = ({
  data = [],
  dataKeyX,
  dataKeyY,
  type = "monotone",
  stroke = "#4f46e5",
  gridStroke = "#e2e8f0",
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        No data to chart
      </div>
    )
  }

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey={dataKeyX}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(v) => {
              const d = new Date(v)
              return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            tickFormatter={(v) => Number(v).toLocaleString()}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              fontSize: "0.875rem",
            }}
            labelFormatter={(v) => {
              const d = new Date(v)
              return Number.isNaN(d.getTime()) ? v : d.toLocaleString()
            }}
          />
          <Line type={type} dataKey={dataKeyY} stroke={stroke} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart
