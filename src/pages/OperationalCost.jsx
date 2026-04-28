import LocationCost from "@/components/cost/LocationCost"
import CostTable from "@/components/table/CostTable"
import HeaderCard from "@/components/HeaderCard"
import axios from "@/lib/axios"
import { setActiveMenu } from "@/store/MenuSlice"
import { Receipt, Wallet } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const OperationalCost = () => {
  const location = useLocation()
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { locationsOperationalCost } = useLoaderData()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  const locations = useMemo(() => {
    if (!locationsOperationalCost?.success || !Array.isArray(locationsOperationalCost.data)) return []
    return locationsOperationalCost.data
  }, [locationsOperationalCost])

  const [costData, setCost] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)
  const [loadingLocationId, setLoadingLocationId] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const LoadCost = useCallback(
    async (loc, param = "") => {
      if (!loc?.id) return
      setLoadError(null)
      setCurrentLocation(loc)
      setLoadingLocationId(loc.id)
      try {
        const response = await axios.post(
          `api/get_business/operational_cost/${param}`,
          { business_id: loc.business_id, location_id: loc.id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          setCost(response.data.data)
        } else {
          setCost([])
          setLoadError("Could not load cost entries for this location.")
        }
      } catch {
        setCost([])
        setLoadError("Could not load cost entries for this location.")
      } finally {
        setLoadingLocationId(null)
      }
    },
    [token]
  )

  return (
    <div className="flex flex-col gap-8">
      <HeaderCard name="Operational costs" address={business?.address}>
        <div className="flex items-center gap-2 text-left text-sm text-slate-600 sm:text-right">
          <Wallet className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden />
          <span>Track spending by location, then review line items below.</span>
        </div>
      </HeaderCard>

      {!locationsOperationalCost?.success ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {locationsOperationalCost?.error ?? "Could not load location cost summaries."}
        </div>
      ) : null}

      {locations.length > 0 ? (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">By location</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a site to load its cost history in the table below.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {locations.map((loc) => (
              <LocationCost
                key={loc.id}
                location={loc}
                LoadCost={LoadCost}
                isLoading={String(loadingLocationId) === String(loc.id)}
              />
            ))}
          </div>
        </section>
      ) : locationsOperationalCost?.success ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Receipt className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location from the dashboard to record operational costs.
          </p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Cost entries</h2>
          <p className="mt-1 text-sm text-slate-500">
            {currentLocation
              ? `Line items for ${currentLocation.name}`
              : "Choose “View costs” on a location card to load entries."}
          </p>
          {loadError ? (
            <p className="mt-2 text-sm font-medium text-rose-600" role="alert">
              {loadError}
            </p>
          ) : null}
        </div>
        <div className="p-4 sm:p-6">
          <CostTable data={costData} />
        </div>
      </section>
    </div>
  )
}

export default OperationalCost
