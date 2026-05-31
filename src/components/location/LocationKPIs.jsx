import { useState } from "react"
import {
  BarChart3,
  ChevronDown,
  Fuel,
  Gauge,
  Package,
  PiggyBank,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react"
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

const SectionShell = ({
  title,
  description,
  children,
  collapsible = false,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen)

  const headerInner = (
    <>
      <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
      {description ? (
        <div className="mt-1 text-sm text-slate-500">{description}</div>
      ) : null}
    </>
  )

  if (!collapsible) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
        <div className="mb-4">{headerInner}</div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{children}</div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-sm">
      <button
        type="button"
        className="-m-1 flex w-full items-start justify-between gap-3 rounded-lg p-1 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
      >
        <div className="min-w-0 flex-1">{headerInner}</div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">{children}</div>
      ) : null}
    </section>
  )
}

const monthLabel = (ref = new Date()) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(ref)

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * Location KPIs: current month vs all-time from get_sales_data breakdown.
 *
 * @param {{ success?: boolean, data?: object }} locationOverview
 */
const LocationKPIs = ({ salesRows = [], dispensers, locationOverview }) => {
  const row = locationOverview?.success ? locationOverview?.data : null
  const cm = row?.currentMonthSalesData ?? null
  const ts = row?.totalSalesData ?? null
  const hasMonth = Boolean(row != null && cm != null)
  const hasLifetimeTotals = Boolean(hasMonth && ts != null)

  const totalSalesMonth = num(cm?.totalSales)
  const totalKgMonth = num(cm?.totalKg)
  const totalSalesLifetime = num(ts?.totalSales)
  const totalKgLifetime = num(ts?.totalKg)
  const profitMonth = num(cm?.profit)
  const profitLifetimeSales = num(ts?.profit)
  const profitFromExcess = num(row?.totalExcessProfit)
  const excessKg = num(row?.totalExcessKg)

  const totalSalesAll = salesRows.reduce((sum, rowSale) => sum + (parseFloat(rowSale.amount) || 0), 0)
  const totalKgAll = salesRows.reduce((sum, rowSale) => sum + (parseFloat(rowSale.kg_quantity) || 0), 0)

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {hasMonth ? "Sales analytics" : "Sales overview"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {hasMonth
              ? "Current month and all-time totals for this location."
              : "Overview unavailable — showing totals from loaded sales records."}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {hasMonth ? (
            <>
              <SectionShell
                collapsible
                defaultOpen={false}
                title="Current month"
                description={
                  <>
                    <span className="font-medium text-slate-700">{monthLabel()}</span>
                    <span className="text-slate-500">
                      {" "}
                      · Sales, volume, and profit for this calendar month only.
                    </span>
                  </>
                }
              >
                <StatCard
                  label="Total sales"
                  value={`₦${formatCurrency(totalSalesMonth)}`}
                  hint="This calendar month"
                  icon={TrendingUp}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  label="Total kg sold"
                  value={formatCurrency(totalKgMonth)}
                  hint="This calendar month"
                  icon={Scale}
                  iconBg="bg-sky-50"
                  iconColor="text-sky-600"
                />
                <StatCard
                  label="Profit (sales)"
                  value={`₦${formatCurrency(profitMonth)}`}
                  hint="After supply cost on volume sold this month"
                  icon={Wallet}
                  iconBg="bg-violet-50"
                  iconColor="text-violet-600"
                />
              </SectionShell>

              {hasLifetimeTotals ? (
                <SectionShell
                  collapsible
                  defaultOpen={false}
                  title="All time (totals)"
                  description="Every recorded sale at this location and supply excess metrics."
                >
                  <StatCard
                    label="Total sales"
                    value={`₦${formatCurrency(totalSalesLifetime)}`}
                    hint="All recorded sales"
                    icon={BarChart3}
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-800"
                  />
                  <StatCard
                    label="Total kg sold"
                    value={formatCurrency(totalKgLifetime)}
                    hint="All recorded sales"
                    icon={Scale}
                    iconBg="bg-sky-100"
                    iconColor="text-sky-800"
                  />
                  <StatCard
                    label="Profit (sales)"
                    value={`₦${formatCurrency(profitLifetimeSales)}`}
                    hint="After supply cost on all sold volume"
                    icon={Wallet}
                    iconBg="bg-violet-100"
                    iconColor="text-violet-800"
                  />
                  <StatCard
                    label="Excess kg"
                    value={formatCurrency(excessKg)}
                    hint="From closed supplies"
                    icon={Package}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-700"
                  />
                  <StatCard
                    label="Profit from excess"
                    value={`₦${formatCurrency(profitFromExcess)}`}
                    hint="Excess kg valued at supply rates"
                    icon={PiggyBank}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-700"
                  />
                </SectionShell>
              ) : null}
            </>
          ) : (
            <SectionShell title="From loaded records" description="Breakdown API unavailable — sums below are from sales shown on this page.">
              <StatCard
                label="Total sales"
                value={`₦${formatCurrency(displaySales)}`}
                hint="Loaded sales rows"
                icon={TrendingUp}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                label="Total kg sold"
                value={formatCurrency(displayKg)}
                hint="Loaded sales rows"
                icon={Scale}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
              />
            </SectionShell>
          )}
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
