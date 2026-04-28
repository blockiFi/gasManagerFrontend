import SetPrice from "@/components/price/SetPrice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { History, Loader2, MapPin } from "lucide-react"
import { useState } from "react"

const LocationPrice = ({ location, getPrices, isSelected }) => {
  const [loading, setLoading] = useState(false)

  const handleLoadHistory = async () => {
    setLoading(true)
    try {
      await getPrices(location.id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      className={`flex flex-col border transition-shadow ${
        isSelected
          ? "border-indigo-300 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
            {location.name}
          </CardTitle>
          {isSelected ? (
            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
              Selected
            </span>
          ) : null}
        </div>
        {location.address ? (
          <p className="flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="line-clamp-2">{location.address}</span>
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Current price</p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
          ₦{formatCurrency(location.active_price)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/50 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-slate-200"
          onClick={handleLoadHistory}
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
          View history
        </Button>
        <SetPrice location={location} />
      </CardFooter>
    </Card>
  )
}

export default LocationPrice
