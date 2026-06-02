import AddCost from "@/components/cost/AddCost"
import LocationCost from "@/components/cost/LocationCost"
import Can from "@/components/Auth/Can"
import CostTable from "@/components/table/CostTable"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import { CAPABILITIES } from "@/lib/permissions"
import { formatCurrency } from "@/lib/utils"
import { setActiveMenu } from "@/store/MenuSlice"
import {
  Building2,
  CalendarRange,
  Loader2,
  MapPin,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const PERIOD_TABS = [
  { id: "", label: "All time" },
  { id: "current_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "last_quater", label: "Last quarter" },
  { id: "current_year", label: "This year" },
]

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

const OperationalCost = () => {
  const location = useLocation()
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { locationsOperationalCost } = useLoaderData()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [costData, setCostData] = useState([])
  const [period, setPeriod] = useState("")
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (!locationsOperationalCost?.success || !Array.isArray(locationsOperationalCost.data)) {
      setLocations([])
      return
    }
    setLocations(locationsOperationalCost.data)
  }, [locationsOperationalCost])

  const refreshSummaries = useCallback(async () => {
    if (!business?.id) return
    setLoadingSummaries(true)
    try {
      const response = await axios.post(
        "api/get_business/operational_cost_details",
        { business_id: business.id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.status === 200 && Array.isArray(response.data?.data)) {
        setLocations(response.data.data)
        if (selectedLocation) {
          const updated = response.data.data.find((l) => String(l.id) === String(selectedLocation.id))
          if (updated) setSelectedLocation(updated)
        }
      }
    } catch {
      /* keep existing summaries */
    } finally {
      setLoadingSummaries(false)
    }
  }, [business?.id, token, selectedLocation])

  const loadCostEntries = useCallback(
    async (loc, range = period) => {
      if (!loc?.id) return
      setLoadError(null)
      setLoadingEntries(true)
      try {
        const path = range ? `api/get_business/operational_cost/${range}` : "api/get_business/operational_cost/"
        const response = await axios.post(
          path,
          { business_id: loc.business_id, location_id: loc.id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setCostData(response.data.data)
        } else {
          setCostData([])
          setLoadError("Could not load cost entries for this location.")
        }
      } catch {
        setCostData([])
        setLoadError("Could not load cost entries for this location.")
      } finally {
        setLoadingEntries(false)
      }
    },
    [token, period]
  )

  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0])
    }
  }, [locations, selectedLocation])

  useEffect(() => {
    if (selectedLocation) {
      loadCostEntries(selectedLocation, period)
    }
  }, [selectedLocation, period, loadCostEntries])

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc)
    setLoadError(null)
  }

  const handlePeriodChange = (nextPeriod) => {
    setPeriod(nextPeriod)
  }

  const handleCostAdded = async () => {
    if (selectedLocation) {
      await loadCostEntries(selectedLocation, period)
    }
    await refreshSummaries()
  }

  const totals = useMemo(() => {
    const allTime = locations.reduce((sum, loc) => sum + (Number(loc.totalCost) || 0), 0)
    const thisMonth = locations.reduce((sum, loc) => sum + (Number(loc.CurrentMonthsCost) || 0), 0)
    return { allTime, thisMonth, siteCount: locations.length }
  }, [locations])

  const selectedPeriodLabel = PERIOD_TABS.find((t) => t.id === period)?.label ?? "All time"

  if (!locationsOperationalCost?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {locationsOperationalCost?.error ?? "Could not load location cost summaries."}
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
              <Wallet className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Operational costs</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Monitor spending across your sites, filter by period, and keep a clear record of every expense.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {totals.siteCount} location{totals.siteCount === 1 ? "" : "s"}
                {loadingSummaries ? (
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
              label="Total spend (all time)"
              value={`₦${formatCurrency(totals.allTime)}`}
              hint="Across all locations"
              icon={TrendingUp}
              accent="indigo"
            />
            <StatCard
              label="This month"
              value={`₦${formatCurrency(totals.thisMonth)}`}
              hint="Current calendar month"
              icon={CalendarRange}
              accent="emerald"
            />
            <StatCard
              label="Locations tracked"
              value={String(totals.siteCount)}
              hint="Sites with cost records"
              icon={Building2}
              accent="slate"
            />
          </div>
        ) : null}
      </div>

      {locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Receipt className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location from the dashboard, then return here to track operational expenses.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
          {/* Location sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Locations</h2>
              <p className="mt-1 text-sm text-slate-500">Select a site to review its expenses</p>
            </div>
            <div className="flex max-h-[min(70vh,640px)] flex-col gap-2 overflow-y-auto p-4">
              {locations.map((loc) => (
                <LocationCost
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
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-500">
                          This month{" "}
                          <span className="font-semibold tabular-nums text-emerald-700">
                            ₦{formatCurrency(selectedLocation.CurrentMonthsCost)}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          All time{" "}
                          <span className="font-semibold tabular-nums text-slate-900">
                            ₦{formatCurrency(selectedLocation.totalCost)}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Can capability={CAPABILITIES.COST_ADD} locationId={selectedLocation.id}>
                      <AddCost location={selectedLocation} onSuccess={handleCostAdded} />
                    </Can>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {PERIOD_TABS.map((tab) => (
                      <Button
                        key={tab.id || "all"}
                        type="button"
                        size="sm"
                        variant={period === tab.id ? "default" : "outline"}
                        className={
                          period === tab.id
                            ? "shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }
                        onClick={() => handlePeriodChange(tab.id)}
                      >
                        {tab.label}
                      </Button>
                    ))}
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

                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Expense ledger</h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {selectedPeriodLabel} · {costData.length} entr{costData.length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                  </div>

                  <CostTable
                    data={costData}
                    isLoading={loadingEntries}
                    emptyHint={`No costs recorded for ${selectedPeriodLabel.toLowerCase()}. Add an entry or try another period.`}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-medium text-slate-700">Select a location</p>
                <p className="mt-1 text-sm text-slate-500">Choose a site from the list to view its cost history.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default OperationalCost
