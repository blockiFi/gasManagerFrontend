import AddDispenserForBusiness from "@/components/dispenser/AddDispenserForBusiness"
import Can from "@/components/Auth/Can"
import Dispenser from "@/components/dispenser/Dispenser"
import LocationDispenser from "@/components/dispenser/LocationDispenser"
import { isDispenserActive } from "@/components/dispenser/DispenserActiveButtons"
import DispenserTable from "@/components/table/DispenserTable"
import { Button } from "@/components/ui/button"
import { getAllBusinessDispensers } from "@/lib/request"
import { CAPABILITIES } from "@/lib/permissions"
import { getDispenserFillPercent } from "@/lib/dispenserLevel"
import { setActiveMenu } from "@/store/MenuSlice"
import {
  AlertTriangle,
  Building2,
  Fuel,
  Gauge,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useLoaderData, useLocation } from "react-router-dom"

const StatCard = ({ label, value, hint, icon: Icon, accent = "indigo" }) => {
  const accents = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", ring: "ring-rose-100" },
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

function summarizeSite(location, dispensers) {
  const siteDispensers = dispensers.filter((d) => String(d.location_id) === String(location.id))
  const activeDispensers = siteDispensers.filter(isDispenserActive)

  let capacitySum = 0
  let levelSum = 0
  let lowCount = 0

  for (const d of activeDispensers) {
    const cap = Number(d.capacity) || 0
    const lvl = Number(d.current_level) || 0
    if (cap > 0) {
      capacitySum += cap
      levelSum += lvl
      if (getDispenserFillPercent(cap, lvl) < 30) lowCount += 1
    }
  }

  const avgFill =
    capacitySum > 0 ? Math.min(100, Math.max(0, Math.round((levelSum / capacitySum) * 100))) : 0

  return {
    location,
    dispensers: siteDispensers,
    dispenserCount: siteDispensers.length,
    activeCount: activeDispensers.length,
    avgFill,
    lowCount,
  }
}

const Dispensers = () => {
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { dispensers: dispensersResult, locations: locationsResult } = useLoaderData()
  const dispatch = useDispatch()
  const location = useLocation()
  const menu = useSelector((state) => state.menu.menu)

  const [dispenserList, setDispenserList] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [viewMode, setViewMode] = useState("cards")
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (dispensersResult?.success && Array.isArray(dispensersResult.data)) {
      setDispenserList(dispensersResult.data)
    } else {
      setDispenserList([])
    }
  }, [dispensersResult])

  const locationList = useMemo(() => {
    if (locationsResult?.success && Array.isArray(locationsResult.data)) {
      return locationsResult.data
    }
    return []
  }, [locationsResult])

  const refreshDispensers = useCallback(async () => {
    setLoadingList(true)
    try {
      const result = await getAllBusinessDispensers(token)
      if (result.success && Array.isArray(result.data)) {
        setDispenserList(result.data)
      }
    } catch {
      /* keep existing */
    } finally {
      setLoadingList(false)
    }
  }, [token])

  const siteRows = useMemo(() => {
    if (locationList.length > 0) {
      return locationList.map((loc) => summarizeSite(loc, dispenserList))
    }

    const byLocationId = new Map()
    for (const d of dispenserList) {
      const id = String(d.location_id ?? d.location?.id ?? "")
      if (!id) continue
      if (!byLocationId.has(id)) {
        byLocationId.set(id, {
          id: d.location_id,
          name: d.location?.name ?? `Location ${id}`,
          address: d.location?.address ?? "",
          business_id: d.business_id,
        })
      }
    }

    return [...byLocationId.values()].map((loc) => summarizeSite(loc, dispenserList))
  }, [locationList, dispenserList])

  useEffect(() => {
    if (siteRows.length > 0 && !selectedSite) {
      const withTanks = siteRows.find((s) => s.dispenserCount > 0)
      setSelectedSite(withTanks ?? siteRows[0])
    }
  }, [siteRows, selectedSite])

  useEffect(() => {
    if (!selectedSite) return
    const updated = siteRows.find((s) => String(s.location.id) === String(selectedSite.location.id))
    if (updated) setSelectedSite(updated)
  }, [siteRows, selectedSite?.location.id])

  const totals = useMemo(() => {
    const total = dispenserList.length
    const active = dispenserList.filter(isDispenserActive).length

    let capacitySum = 0
    let levelSum = 0
    let lowCount = 0

    for (const d of dispenserList.filter(isDispenserActive)) {
      const cap = Number(d.capacity) || 0
      const lvl = Number(d.current_level) || 0
      if (cap > 0) {
        capacitySum += cap
        levelSum += lvl
        if (getDispenserFillPercent(cap, lvl) < 30) lowCount += 1
      }
    }

    const avgFill =
      capacitySum > 0 ? Math.min(100, Math.max(0, Math.round((levelSum / capacitySum) * 100))) : 0

    return { total, active, avgFill, lowCount, siteCount: siteRows.length }
  }, [dispenserList, siteRows.length])

  if (!dispensersResult?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {dispensersResult?.error ?? "Could not load dispensers."}
        </p>
      </div>
    )
  }

  const hasLocations = siteRows.length > 0

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Fuel className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dispensers</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Monitor tank levels, capacity, and status across every site in your business.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {totals.total} dispenser{totals.total === 1 ? "" : "s"} · {totals.siteCount} location
                {totals.siteCount === 1 ? "" : "s"}
                {loadingList ? (
                  <span className="ml-2 inline-flex items-center gap-1 normal-case text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Updating…
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          {locationList.length > 0 ? (
            <Can capability={CAPABILITIES.DISPENSER_MANAGE}>
              <AddDispenserForBusiness
                business_id={business.id}
                locations={locationList}
                onSuccess={refreshDispensers}
              />
            </Can>
          ) : null}
        </div>

        {totals.total > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total dispensers"
              value={String(totals.total)}
              hint={`${totals.active} currently active`}
              icon={Fuel}
              accent="indigo"
            />
            <StatCard
              label="Average fill"
              value={`${totals.avgFill}%`}
              hint="Across active tanks"
              icon={Gauge}
              accent="emerald"
            />
            <StatCard
              label="Low tanks"
              value={String(totals.lowCount)}
              hint="Below 30% capacity"
              icon={AlertTriangle}
              accent={totals.lowCount > 0 ? "rose" : "slate"}
            />
            <StatCard
              label="Locations"
              value={String(totals.siteCount)}
              hint="Sites with tank inventory"
              icon={Building2}
              accent="slate"
            />
          </div>
        ) : null}
      </div>

      {!hasLocations ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Fuel className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location from the dashboard, then return here to register dispensers.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Go to locations
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
          {/* Location sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Locations</h2>
              <p className="mt-1 text-sm text-slate-500">Select a site to view its tanks</p>
            </div>
            <div className="flex max-h-[min(70vh,640px)] flex-col gap-2 overflow-y-auto p-4">
              {siteRows.map((site) => (
                <LocationDispenser
                  key={site.location.id}
                  site={site}
                  isSelected={String(selectedSite?.location.id) === String(site.location.id)}
                  onSelect={setSelectedSite}
                />
              ))}
            </div>
          </aside>

          {/* Detail panel */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedSite ? (
              <>
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                        <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                          {selectedSite.location.name}
                        </h2>
                      </div>
                      {selectedSite.location.address ? (
                        <p className="mt-1 text-sm text-slate-500">{selectedSite.location.address}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-500">
                          Tanks{" "}
                          <span className="font-semibold tabular-nums text-slate-900">
                            {selectedSite.dispenserCount}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Active{" "}
                          <span className="font-semibold tabular-nums text-emerald-700">
                            {selectedSite.activeCount}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Avg fill{" "}
                          <span
                            className={`font-semibold tabular-nums ${
                              selectedSite.avgFill < 30
                                ? "text-rose-700"
                                : selectedSite.avgFill < 60
                                  ? "text-amber-700"
                                  : "text-slate-900"
                            }`}
                          >
                            {selectedSite.avgFill}%
                          </span>
                        </span>
                      </div>
                    </div>
                    <Can capability={CAPABILITIES.DISPENSER_MANAGE}>
                      <AddDispenserForBusiness
                        business_id={business.id}
                        locations={locationList}
                        defaultLocationId={selectedSite.location.id}
                        onSuccess={refreshDispensers}
                      />
                    </Can>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === "cards" ? "default" : "outline"}
                      className={
                        viewMode === "cards"
                          ? "gap-2 shadow-sm"
                          : "gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }
                      onClick={() => setViewMode("cards")}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden />
                      Cards
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === "table" ? "default" : "outline"}
                      className={
                        viewMode === "table"
                          ? "gap-2 shadow-sm"
                          : "gap-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" aria-hidden />
                      Table
                    </Button>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  {selectedSite.lowCount > 0 ? (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />
                      <p>
                        <span className="font-semibold">{selectedSite.lowCount}</span> active tank
                        {selectedSite.lowCount === 1 ? " is" : "s are"} below 30% — consider scheduling a supply.
                      </p>
                    </div>
                  ) : null}

                  {selectedSite.dispenserCount === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
                      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <Fuel className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No dispensers at this site</p>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Add a tank to start tracking capacity and stock levels here.
                      </p>
                    </div>
                  ) : viewMode === "cards" ? (
                    <div className="grid gap-4 xl:grid-cols-2">
                      {selectedSite.dispensers.map((dispenser) => (
                        <Dispenser key={dispenser.id} dispenser={dispenser} />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Tank inventory</h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {selectedSite.dispenserCount} dispenser
                          {selectedSite.dispenserCount === 1 ? "" : "s"} at this location
                        </p>
                      </div>
                      <DispenserTable
                        data={selectedSite.dispensers}
                        locations={locationsResult}
                        businessId={business.id}
                      />
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <MapPin className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-medium text-slate-700">Select a location</p>
                <p className="mt-1 text-sm text-slate-500">Choose a site from the list to view its dispensers.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Dispensers
