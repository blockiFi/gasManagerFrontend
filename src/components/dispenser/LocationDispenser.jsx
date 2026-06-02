/* eslint-disable react/prop-types */
import { ChevronRight, MapPin } from "lucide-react"

const LocationDispenser = ({ site, isSelected, onSelect }) => {
  const { location, dispenserCount, activeCount, avgFill, lowCount } = site

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
            {dispenserCount} tank{dispenserCount === 1 ? "" : "s"}
            {activeCount > 0 ? (
              <>
                {" "}
                · <span className="font-medium text-emerald-700">{activeCount} active</span>
              </>
            ) : null}
          </span>
          {dispenserCount > 0 ? (
            <>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="text-slate-500">
                Avg fill{" "}
                <span
                  className={`font-semibold tabular-nums ${
                    avgFill < 30 ? "text-rose-700" : avgFill < 60 ? "text-amber-700" : "text-slate-800"
                  }`}
                >
                  {avgFill}%
                </span>
              </span>
            </>
          ) : null}
        </div>
        {lowCount > 0 ? (
          <p className="mt-1.5 text-[11px] font-medium text-rose-600">
            {lowCount} tank{lowCount === 1 ? "" : "s"} below 30%
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

export default LocationDispenser
