/* eslint-disable react/prop-types */
import { formatCurrency } from "@/lib/utils"
import { ChevronRight, MapPin } from "lucide-react"

const LocationSupply = ({ site, isSelected, onSelect }) => {
  const { location, supplyCount, pendingCount, openCount, totalSpend } = site

  return (
    <button
      type="button"
      onClick={() => onSelect(site)}
      className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
        isSelected
          ? "border-indigo-300 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        }`}
      >
        <MapPin className="h-4 w-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{location.name}</p>
        {location.address ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">{location.address}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-slate-500">
            {supplyCount} record{supplyCount === 1 ? "" : "s"}
          </span>
          {pendingCount > 0 ? (
            <>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="font-medium text-amber-700">{pendingCount} pending</span>
            </>
          ) : null}
          {openCount > 0 ? (
            <>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="font-medium text-indigo-700">{openCount} open</span>
            </>
          ) : null}
        </div>
        {supplyCount > 0 && totalSpend > 0 ? (
          <p className="mt-1.5 text-xs text-slate-500">
            Spend{" "}
            <span className="font-semibold tabular-nums text-slate-800">₦{formatCurrency(totalSpend)}</span>
          </p>
        ) : null}
      </div>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition ${
          isSelected ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
        }`}
        aria-hidden
      />
    </button>
  )
}

export default LocationSupply
