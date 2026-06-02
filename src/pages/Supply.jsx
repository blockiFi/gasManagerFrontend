import AddSupply from "@/components/supply/AddSupply"
import LocationSupply from "@/components/supply/LocationSupply"
import Can from "@/components/Auth/Can"
import SupplyTable, {
  isDelivered,
  isOpenSupply,
  isUnlimitedSupply,
} from "@/components/table/SupplyTable"
import { Button } from "@/components/ui/button"
import { getBusinessSupplies } from "@/lib/request"
import { CAPABILITIES } from "@/lib/permissions"
import { formatCurrency } from "@/lib/utils"
import { setActiveMenu } from "@/store/MenuSlice"
import {
  Clock,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Wallet,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
]

const StatCard = ({ label, value, hint, icon: Icon, accent = "indigo" }) => {
  const accents = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
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

function matchesLocation(supply, locationId) {
  return (
    String(supply.location_id ?? "") === String(locationId) ||
    String(supply.location?.id ?? "") === String(locationId)
  )
}

function summarizeSite(location, supplies) {
  const siteSupplies = supplies.filter((s) => matchesLocation(s, location.id))
  let pendingCount = 0
  let openCount = 0
  let totalSpend = 0

  for (const s of siteSupplies) {
    const delivered = isDelivered(s)
    const open = isOpenSupply(s)
    if (!delivered) pendingCount += 1
    if (delivered && open) openCount += 1
    if (!(isUnlimitedSupply(s) && open)) {
      totalSpend += Number(s.amount) || 0
    }
  }

  return {
    location,
    supplies: siteSupplies,
    supplyCount: siteSupplies.length,
    pendingCount,
    openCount,
    totalSpend,
  }
}

function filterByStatus(supplies, status) {
  if (status === "pending") return supplies.filter((s) => !isDelivered(s))
  if (status === "open") return supplies.filter((s) => isDelivered(s) && isOpenSupply(s))
  if (status === "closed") return supplies.filter((s) => isDelivered(s) && !isOpenSupply(s))
  return supplies
}

const Supply = () => {
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { supplies: suppliesResult, locations: locationsResult, suppliers: suppliersResult } = useLoaderData()
  const dispatch = useDispatch()
  const location = useLocation()
  const menu = useSelector((state) => state.menu.menu)

  const [supplyList, setSupplyList] = useState([])
  const [selectedSite, setSelectedSite] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (suppliesResult?.success && Array.isArray(suppliesResult.data)) {
      setSupplyList(suppliesResult.data)
    } else {
      setSupplyList([])
    }
  }, [suppliesResult])

  const locationList = useMemo(() => {
    if (locationsResult?.success && Array.isArray(locationsResult.data)) {
      return locationsResult.data
    }
    return []
  }, [locationsResult])

  const refreshSupplies = useCallback(async () => {
    if (!business?.id) return
    setLoadingList(true)
    try {
      const result = await getBusinessSupplies(token, business.id)
      if (result.success && Array.isArray(result.data)) {
        setSupplyList(result.data)
      }
    } catch {
      /* keep existing */
    } finally {
      setLoadingList(false)
    }
  }, [business?.id, token])

  const siteRows = useMemo(() => {
    if (locationList.length > 0) {
      return locationList.map((loc) => summarizeSite(loc, supplyList))
    }

    const byLocationId = new Map()
    for (const s of supplyList) {
      const id = String(s.location_id ?? s.location?.id ?? "")
      if (!id) continue
      if (!byLocationId.has(id)) {
        byLocationId.set(id, {
          id: s.location_id,
          name: s.location?.name ?? `Location ${id}`,
          address: s.location?.address ?? "",
          business_id: s.business_id,
        })
      }
    }

    return [...byLocationId.values()].map((loc) => summarizeSite(loc, supplyList))
  }, [locationList, supplyList])

  useEffect(() => {
    if (siteRows.length > 0 && !selectedSite) {
      const withSupplies = siteRows.find((s) => s.supplyCount > 0)
      setSelectedSite(withSupplies ?? siteRows[0])
    }
  }, [siteRows, selectedSite])

  useEffect(() => {
    if (!selectedSite) return
    const updated = siteRows.find((s) => String(s.location.id) === String(selectedSite.location.id))
    if (updated) setSelectedSite(updated)
  }, [siteRows, selectedSite?.location.id])

  const totals = useMemo(() => {
    let pending = 0
    let open = 0
    let totalSpend = 0

    for (const s of supplyList) {
      const delivered = isDelivered(s)
      const openBatch = isOpenSupply(s)
      if (!delivered) pending += 1
      if (delivered && openBatch) open += 1
      if (!(isUnlimitedSupply(s) && openBatch)) {
        totalSpend += Number(s.amount) || 0
      }
    }

    return {
      total: supplyList.length,
      pending,
      open,
      totalSpend,
      siteCount: siteRows.length,
    }
  }, [supplyList, siteRows.length])

  const filteredSiteSupplies = useMemo(() => {
    if (!selectedSite) return []
    return filterByStatus(selectedSite.supplies, statusFilter)
  }, [selectedSite, statusFilter])

  if (!suppliesResult?.success || !locationsResult?.success || !suppliersResult?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {!suppliesResult?.success
            ? suppliesResult?.error ?? "Could not load supplies."
            : !locationsResult?.success
              ? locationsResult?.error ?? "Could not load locations."
              : suppliersResult?.error ?? "Could not load suppliers."}
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
              <Package className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Supplies</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Record gas purchases, confirm deliveries, and close batches when a supply run ends.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {totals.total} supply record{totals.total === 1 ? "" : "s"} · {totals.siteCount} location
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
            <Can capability={CAPABILITIES.SUPPLY_ADD}>
              <AddSupply
                business_id={business.id}
                locations={locationsResult}
                suppliers={suppliersResult}
                onSuccess={refreshSupplies}
              />
            </Can>
          ) : null}
        </div>

        {totals.total > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total records"
              value={String(totals.total)}
              hint="All supply entries"
              icon={Package}
              accent="indigo"
            />
            <StatCard
              label="Pending delivery"
              value={String(totals.pending)}
              hint="Awaiting confirmation"
              icon={Clock}
              accent="amber"
            />
            <StatCard
              label="Open batches"
              value={String(totals.open)}
              hint="Delivered, not yet closed"
              icon={PackageCheck}
              accent="emerald"
            />
            <StatCard
              label="Total spend"
              value={`₦${formatCurrency(totals.totalSpend)}`}
              hint="Recorded purchase amounts"
              icon={Wallet}
              accent="slate"
            />
          </div>
        ) : null}
      </div>

      {!hasLocations ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Package className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location from the dashboard, then log supply orders against dispensers and suppliers.
          </p>
        </div>
      ) : totals.total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Package className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No supplies yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Log a supply order against a location, dispenser, and supplier to track inventory and costs.
          </p>
          <div className="mt-6">
            <Can capability={CAPABILITIES.SUPPLY_ADD}>
              <AddSupply
                business_id={business.id}
                locations={locationsResult}
                suppliers={suppliersResult}
                onSuccess={refreshSupplies}
              />
            </Can>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
          {/* Location sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Locations</h2>
              <p className="mt-1 text-sm text-slate-500">Select a site to review its supply records</p>
            </div>
            <div className="flex max-h-[min(70vh,640px)] flex-col gap-2 overflow-y-auto p-4">
              {siteRows.map((site) => (
                <LocationSupply
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
                          Records{" "}
                          <span className="font-semibold tabular-nums text-slate-900">
                            {selectedSite.supplyCount}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Pending{" "}
                          <span className="font-semibold tabular-nums text-amber-700">
                            {selectedSite.pendingCount}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Open{" "}
                          <span className="font-semibold tabular-nums text-indigo-700">
                            {selectedSite.openCount}
                          </span>
                        </span>
                        {selectedSite.totalSpend > 0 ? (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">
                              Spend{" "}
                              <span className="font-semibold tabular-nums text-slate-900">
                                ₦{formatCurrency(selectedSite.totalSpend)}
                              </span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <Can capability={CAPABILITIES.SUPPLY_ADD}>
                      <AddSupply
                        business_id={business.id}
                        locations={locationsResult}
                        suppliers={suppliersResult}
                        defaultLocationId={selectedSite.location.id}
                        onSuccess={refreshSupplies}
                      />
                    </Can>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {STATUS_TABS.map((tab) => (
                      <Button
                        key={tab.id}
                        type="button"
                        size="sm"
                        variant={statusFilter === tab.id ? "default" : "outline"}
                        className={
                          statusFilter === tab.id
                            ? "shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }
                        onClick={() => setStatusFilter(tab.id)}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {selectedSite.supplyCount === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
                      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <Package className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No supplies at this site</p>
                      <p className="mt-1 max-w-sm text-sm text-slate-500">
                        Add a supply record to track purchases and deliveries here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">Supply ledger</h3>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {STATUS_TABS.find((t) => t.id === statusFilter)?.label ?? "All"} ·{" "}
                          {filteredSiteSupplies.length} record
                          {filteredSiteSupplies.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <SupplyTable
                        data={filteredSiteSupplies}
                        business_id={business.id}
                        locations={locationsResult}
                        suppliers={suppliersResult}
                        embedded
                        onSupplyUpdated={refreshSupplies}
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
                <p className="mt-1 text-sm text-slate-500">
                  Choose a site from the list to view its supply records.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Supply
