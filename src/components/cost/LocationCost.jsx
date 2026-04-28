/* eslint-disable react/prop-types */
import AddCost from "./AddCost"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Loader2, MapPin, Receipt } from "lucide-react"

const LocationCost = ({ location, LoadCost, isLoading = false }) => {
  const handleViewCosts = () => {
    LoadCost(location)
  }

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold tracking-tight text-slate-900">{location.name}</h3>
            {location.address ? (
              <p className="mt-1 line-clamp-2 text-xs text-slate-500">{location.address}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-slate-500">Total cost</span>
          <span className="font-semibold tabular-nums text-slate-900">
            ₦{formatCurrency(location.totalCost)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="text-slate-500">This month</span>
          <span className="font-semibold tabular-nums text-emerald-700">
            ₦{formatCurrency(location.CurrentMonthsCost)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-slate-200"
          disabled={isLoading}
          onClick={handleViewCosts}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Receipt className="h-4 w-4" aria-hidden />}
          View costs
        </Button>
        <AddCost location={location} />
      </div>
    </article>
  )
}

export default LocationCost
