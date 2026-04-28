/* eslint-disable react/prop-types -- dispenser is API model shape */
import DispenserData from "./DispenserData"
import ViewDispenser from "./ViewDispenser"
import Tank from "./TankPage"
import {
  getDispenserFillPercent,
  getDispenserFillRatioClamped,
  getStatusLabel,
  getStatusPillClass,
  getTankTier,
} from "@/lib/dispenserLevel"
import { TriangleAlert } from "lucide-react"

const Dispenser = ({ dispenser }) => {
  const cap = Number(dispenser.capacity) || 0
  const level = Number(dispenser.current_level) || 0
  const tierPct = getDispenserFillPercent(cap, level)
  const displayPct = getDispenserFillRatioClamped(cap, level)
  const statusLabel = getStatusLabel(tierPct)
  const pillClass = getStatusPillClass(tierPct)
  const tier = getTankTier(tierPct)
  const remaining = Math.max(0, cap - level)

  return (
    <div className="w-full rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-200 transition-[box-shadow,ring-color] hover:shadow-md hover:ring-slate-300 sm:p-5">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-stretch">
        <div className="flex w-full shrink-0 justify-center sm:w-[8.75rem] sm:max-w-[8.75rem]">
          <Tank dispenser={dispenser} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <DispenserData dispenser={dispenser} compact />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
              <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-700 ring-1 ring-inset ring-slate-200/80">
                {dispenser.capacity} kg
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${pillClass}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Current</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {level.toFixed(2)} kg
              </p>
              <p className="mt-0.5 text-xs tabular-nums text-slate-500">{displayPct.toFixed(1)}% full</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Remaining</p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-slate-900">
                {remaining.toFixed(2)} kg
              </p>
              <p className="mt-0.5 text-xs text-slate-500">headroom</p>
            </div>
          </div>

          {tier === "low" ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-rose-900 ring-1 ring-inset ring-rose-100">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
              <p className="text-xs font-medium leading-snug">
                Below 30% — consider scheduling a supply soon.
              </p>
            </div>
          ) : null}

          <div className="mt-auto pt-1">
            <ViewDispenser dispenser={dispenser} triggerVariant="ghost" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dispenser
