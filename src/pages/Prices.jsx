import PriceChart from "@/components/charts/PriceChart"
import LocationPrice from "@/components/price/LocationPrice"
import SetPrice from "@/components/price/SetPrice"
import Can from "@/components/Auth/Can"
import PriceTable from "@/components/table/PriceTable"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import { CAPABILITIES } from "@/lib/permissions"
import { formatCurrency } from "@/lib/utils"
import { setActiveMenu } from "@/store/MenuSlice"
import {
  ArrowDownUp,
  Building2,
  DollarSign,
  LineChart as LineChartIcon,
  Loader2,
  MapPin,
  TrendingUp,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const StatCard = ({ label, value, hint, icon: Icon, accent = "indigo" }) => {
  const accents = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    slate: { bg: "bg-slate-100", text: "text-slate-600", ring: "ring-slate-200" },
  }
  const tone = accents[accent] ?? accents.indigo

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  )
}

const Prices = () => {
  const location = useLocation()
  const token = useSelector((state) => state.authentication.token)
  const business = useSelector((state) => state.authentication.business)
  const { locationData } = useLoaderData()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [prices, setPrices] = useState([])
  const [viewChart, setViewChart] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (!locationData?.success || !Array.isArray(locationData.data)) {
      setLocations([])
      return
    }
    setLocations(locationData.data)
  }, [locationData])

  const refreshLocations = useCallback(async () => {
    if (!business?.id) return
    setLoadingLocations(true)
    try {
      const response = await axios.post(
        "api/get_business/locations/price",
        { business_id: business.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.status === 200 && Array.isArray(response.data?.data?.locations)) {
        const next = response.data.data.locations
        setLocations(next)
        if (selectedLocation) {
          const updated = next.find((l) => String(l.id) === String(selectedLocation.id))
          if (updated) setSelectedLocation(updated)
        }
      }
    } catch {
      /* keep existing list */
    } finally {
      setLoadingLocations(false)
    }
  }, [business?.id, token, selectedLocation])

  const loadPriceHistory = useCallback(
    async (loc) => {
      if (!loc?.id) return
      setLoadError(null)
      setLoadingHistory(true)
      try {
        const response = await axios.post(
          "api/get_business/location/price_history",
          { business_id: business.id, location_id: loc.id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (response.status === 200 && response.data?.data != null) {
          setPrices(Array.isArray(response.data.data) ? response.data.data : [])
        } else {
          setPrices([])
          setLoadError("Could not load price history for this location.")
        }
      } catch {
        setPrices([])
        setLoadError("Could not load price history for this location.")
      } finally {
        setLoadingHistory(false)
      }
    },
    [business.id, token]
  )

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0])
    }
  }, [locations, selectedLocation])

  useEffect(() => {
    if (selectedLocation) {
      loadPriceHistory(selectedLocation)
    }
  }, [selectedLocation, loadPriceHistory])

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc)
    setLoadError(null)
    setViewChart(false)
  }

  const handlePriceUpdated = async () => {
    if (selectedLocation) {
      await loadPriceHistory(selectedLocation)
    }
    await refreshLocations()
  }

  const totals = useMemo(() => {
    const pricesList = locations.map((loc) => Number(loc.active_price) || 0).filter((p) => p > 0)
    const siteCount = locations.length
    const avgPrice = pricesList.length ? pricesList.reduce((a, b) => a + b, 0) / pricesList.length : 0
    const minPrice = pricesList.length ? Math.min(...pricesList) : 0
    const maxPrice = pricesList.length ? Math.max(...pricesList) : 0
    return { siteCount, avgPrice, minPrice, maxPrice, pricedCount: pricesList.length }
  }, [locations])

  if (!locationData?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {locationData?.error ?? "Could not load locations."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <DollarSign className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Prices</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Set the active selling price per location and review how it has changed over time.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {totals.siteCount} location{totals.siteCount === 1 ? "" : "s"}
                {loadingLocations ? (
                  <span className="ml-2 inline-flex items-center gap-1 normal-case text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Updating…
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </div>

        {locations.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Average price"
              value={`₦${formatCurrency(totals.avgPrice)}`}
              hint={`Across ${totals.pricedCount} priced location${totals.pricedCount === 1 ? "" : "s"}`}
              icon={TrendingUp}
              accent="indigo"
            />
            <StatCard
              label="Price range"
              value={
                totals.pricedCount > 0
                  ? `₦${formatCurrency(totals.minPrice)} – ₦${formatCurrency(totals.maxPrice)}`
                  : "—"
              }
              hint="Lowest to highest active price"
              icon={ArrowDownUp}
              accent="emerald"
            />
            <StatCard
              label="Locations tracked"
              value={String(totals.siteCount)}
              hint="Sites with price management"
              icon={Building2}
              accent="slate"
            />
          </div>
        ) : null}
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <DollarSign className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location from the dashboard, then return here to set and track selling prices.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
          {/* Location sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Locations</h2>
              <p className="mt-1 text-sm text-slate-500">Select a site to review its price history</p>
            </div>
            <div className="flex max-h-[min(70vh,640px)] flex-col gap-2 overflow-y-auto p-4">
              {locations.map((loc) => (
                <LocationPrice
                  key={loc.id}
                  location={loc}
                  isSelected={String(selectedLocation?.id) === String(loc.id)}
                  onSelect={handleSelectLocation}
                />
              ))}
            </div>
          </aside>

          {/* Detail panel */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedLocation ? (
              <>
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                        <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                          {selectedLocation.name}
                        </h2>
                      </div>
                      {selectedLocation.address ? (
                        <p className="mt-1 text-sm text-slate-500">{selectedLocation.address}</p>
                      ) : null}
                      <p className="mt-3 text-sm text-slate-500">
                        Active price{" "}
                        <span className="text-2xl font-semibold tabular-nums text-slate-900">
                          ₦{formatCurrency(selectedLocation.active_price)}
                        </span>
                      </p>
                    </div>
                    <Can capability={CAPABILITIES.PRICE_SET}>
                      <SetPrice location={selectedLocation} onSuccess={handlePriceUpdated} />
                    </Can>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewChart ? "default" : "outline"}
                      className={
                        viewChart
                          ? "gap-2 shadow-sm"
                          : "gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }
                      disabled={prices.length === 0 || loadingHistory}
                      onClick={() => setViewChart((v) => !v)}
                    >
                      <LineChartIcon className="h-4 w-4" aria-hidden />
                      {viewChart ? "Hide chart" : "Show chart"}
                    </Button>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  {loadError ? (
                    <div
                      className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                      role="alert"
                    >
                      {loadError}
                    </div>
                  ) : null}

                  {viewChart && prices.length > 0 ? (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-4 sm:p-5">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Price trend</h3>
                          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                            How the selling price has changed over time
                          </p>
                        </div>
                      </div>
                      <PriceChart data={prices} />
                    </div>
                  ) : null}

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Price history</h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {prices.length} price change{prices.length === 1 ? "" : "s"} recorded
                    </p>
                  </div>

                  <PriceTable
                    data={prices}
                    isLoading={loadingHistory}
                    emptyHint="No price changes recorded yet. Set a price to start building history."
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-medium text-slate-700">Select a location</p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a site from the list to view its price history.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Prices
