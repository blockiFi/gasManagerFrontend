/* eslint-disable react/prop-types -- dispenser is API model shape */
import pump from "@/assets/pump.png"
import pumpGreen from "@/assets/pumpgreen.png"
import { getDispenserFillPercent, getTankTier } from "@/lib/dispenserLevel"
import { CircleCheckBig, TriangleAlert } from "lucide-react"

/**
 * @param {{ dispenser: object, compact?: boolean }} props
 * compact: header only (icon + name) for use inside the modern dispenser card right column.
 */
const DispenserData = ({ dispenser, compact = false }) => {
  const pct = getDispenserFillPercent(dispenser.capacity, dispenser.current_level)
  const tier = getTankTier(pct)
  const pumpImg = tier === "low" ? pump : pumpGreen
  const icon =
    tier === "low" ? (
      <TriangleAlert className="h-4 w-4 shrink-0 text-rose-500" aria-hidden />
    ) : (
      <CircleCheckBig className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
    )

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <img src={pumpImg} alt="" className="h-9 w-9 shrink-0 object-contain" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            {dispenser.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-slate-500">
            {icon}
            <span className="text-[11px] font-medium text-slate-500">Dispenser</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={pumpImg} alt="" className="h-11 w-11 shrink-0 object-contain" />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold tracking-tight text-slate-900">{dispenser.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Dispenser</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-slate-600">
          {icon}
          <span className="text-xs font-medium text-slate-500">Level</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tank capacity</p>
        <span className="mt-1 inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold tabular-nums text-slate-700">
          {dispenser.capacity} kg
        </span>
      </div>
    </div>
  )
}

export default DispenserData
