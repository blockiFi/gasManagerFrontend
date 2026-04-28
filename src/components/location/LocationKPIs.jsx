import { BadgeDollarSign, Fuel, Gauge, Package, PiggyBank, Scale, TrendingUp, Wallet } from "lucide-react"
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

const monthLabel = (ref = new Date()) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(ref)

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Location KPIs: current-month sales analytics (from API) plus dispenser snapshot.
 */
const LocationKPIs = ({ salesRows = [], dispensers, monthAnalytics }) => {
  const monthPayload = monthAnalytics?.data
  const hasMonth =
    Boolean(monthAnalytics?.success) &&
    monthPayload != null &&
    typeof monthPayload === "object" &&
    !Array.isArray(monthPayload) &&
    ("amount" in monthPayload || "kg" in monthPayload)

  const month = hasMonth ? monthPayload : null
  const totalSalesMonth = num(month?.amount)
  const totalKgMonth = num(month?.kg)
  const profitMonth = num(month?.profit)
  const profitFromExcess = num(month?.profitfromExcess)
  const excessKg = num(month?.excessKg)
  const totalProfitMonth = num(month?.totalProfit)

  const totalSalesAll = salesRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)
  const totalKgAll = salesRows.reduce((sum, row) => sum + (parseFloat(row.kg_quantity) || 0), 0)

  const data =
    dispensers?.success && Array.isArray(dispensers.data) ? dispensers.data : []
  const activePumps = data.filter((d) => d.active === 1).length

  let capacitySum = 0
  let levelSum = 0
  for (const d of data) {
    if (d.active !== 1) continue
    const cap = Number(d.capacity) || 0
    const lvl = Number(d.current_level) || 0
    if (cap > 0) {
      capacitySum += cap
      levelSum += lvl
    }
  }
  const avgTankPct =
    capacitySum > 0 ? Math.min(100, Math.max(0, Number(((levelSum / capacitySum) * 100).toFixed(1)))) : 0

  const displaySales = hasMonth ? totalSalesMonth : totalSalesAll
  const displayKg = hasMonth ? totalKgMonth : totalKgAll
  const salesHint = hasMonth ? "Recorded on this location this month" : "Recorded on this location (all time)"
  const kgHint = hasMonth ? "From sales records this month" : "From sales records (all time)"

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {hasMonth ? "Sales analytics" : "Sales overview"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasMonth ? (
              <>
                Current month · <span className="font-medium text-slate-700">{monthLabel()}</span>
              </>
            ) : (
              "Month data unavailable — showing totals from loaded sales records."
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard
            label="Total sales"
            value={`₦${formatCurrency(displaySales)}`}
            hint={salesHint}
            icon={TrendingUp}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Total kg sold"
            value={formatCurrency(displayKg)}
            hint={kgHint}
            icon={Scale}
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
          />
          {hasMonth ? (
            <>
              <StatCard
                label="Profit (sales)"
                value={`₦${formatCurrency(profitMonth)}`}
                hint="After supply cost on sold volume"
                icon={Wallet}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />
              <StatCard
                label="Excess kg"
                value={formatCurrency(excessKg)}
                hint="From closed supplies this month"
                icon={Package}
                iconBg="bg-amber-50"
                iconColor="text-amber-700"
              />
              <StatCard
                label="Profit from excess"
                value={`₦${formatCurrency(profitFromExcess)}`}
                hint="Value of excess kg at supply rates"
                icon={PiggyBank}
                iconBg="bg-teal-50"
                iconColor="text-teal-700"
              />
              <StatCard
                label="Total profit"
                value={`₦${formatCurrency(totalProfitMonth)}`}
                hint="Sales profit plus excess profit"
                icon={BadgeDollarSign}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />
            </>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Dispensers</h2>
          <p className="mt-1 text-sm text-slate-500">Active pumps and tank levels at this location</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Active pumps"
            value={activePumps}
            hint="Dispensers marked active"
            icon={Fuel}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-500">Avg. tank level</span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                <Gauge className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
              {avgTankPct}%
              <span className="ml-1 text-base font-medium text-slate-500">
                ({formatCurrency(levelSum)} kg)
              </span>
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-[width]"
                style={{ width: `${avgTankPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">Active dispensers vs total capacity</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationKPIs
