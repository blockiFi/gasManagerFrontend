import { formatCurrency } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

const Row = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className={`font-medium text-slate-900 ${mono ? "tabular-nums" : ""}`}>{value}</span>
  </div>
)

const LocationOverviewCard = ({ location }) => {
  const navigate = useNavigate()
  const dispensers = location.dispensers
  const hasActive =
    Array.isArray(dispensers) && dispensers.some((d) => d.active === 1 || d.active === true)

  const ts = location.totalSalesData || {}
  const cm = location.currentMonthSalesData || {}

  const go = () => navigate(`/dashboard/location/${location.id}`)

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 pb-4">
        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={go}
            className="text-left text-lg font-semibold tracking-tight text-slate-900 hover:text-indigo-600"
          >
            {location.name}
          </button>
          {location.address ? (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{location.address}</p>
          ) : null}
        </div>
        <span
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-white ${
            hasActive ? "bg-emerald-500" : "bg-slate-300"
          }`}
          title={hasActive ? "Active dispensers" : "No active dispensers"}
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 pt-4">
        <div className="space-y-2.5">
          <Row label="Total sales" value={`₦${formatCurrency(ts.totalSales)}`} mono />
          <Row label="Total kg" value={formatCurrency(ts.totalKg)} mono />
          <Row label="Total profit" value={`₦${formatCurrency(ts.profit)}`} mono />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">Excess kg</p>
            <p className="mt-0.5 font-medium tabular-nums text-slate-900">
              {formatCurrency(location.totalExcessKg)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Profit from excess</p>
            <p className="mt-0.5 font-medium tabular-nums text-slate-900">
              ₦{formatCurrency(location.totalExcessProfit)}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Current month
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Sales</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                ₦{formatCurrency(cm.totalSales)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Kg</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {formatCurrency(cm.totalKg)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Profit</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                ₦{formatCurrency(cm.profit)}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={go}
          className="mt-auto w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          Open location
        </button>
      </div>
    </article>
  )
}

export default LocationOverviewCard
