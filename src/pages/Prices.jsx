import Chart from "@/components/charts/Chart"
import LocationPrice from "@/components/price/LocationPrice"
import PriceTable from "@/components/table/PriceTable"
import { setActiveMenu } from "@/store/MenuSlice"
import axios from "@/lib/axios"
import { DollarSign, LineChart as LineChartIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"

const Prices = () => {
  const location = useLocation()
  const token = useSelector((state) => state.authentication.token)
  const business = useSelector((state) => state.authentication.business)
  const { locationData } = useLoaderData()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  const [prices, setPrices] = useState([])
  const [viewChart, setViewChart] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [banner, setBanner] = useState({ type: null, text: "" })

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  const getPrices = useCallback(
    async (location_id) => {
      setBanner({ type: null, text: "" })
      try {
        const response = await axios.post(
          "api/get_business/location/price_history",
          { business_id: business.id, location_id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (response.status === 200 && response.data?.data != null) {
          setPrices(Array.isArray(response.data.data) ? response.data.data : [])
          setSelectedLocationId(location_id)
          setBanner({ type: "success", text: "Price history loaded." })
        } else {
          setPrices([])
          setBanner({ type: "error", text: "Could not load price history." })
        }
      } catch {
        setPrices([])
        setBanner({ type: "error", text: "Could not load price history." })
      }
    },
    [business.id, token]
  )

  if (!locationData?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {locationData?.error ?? "Could not load locations."}
        </p>
      </div>
    )
  }

  const locations = locationData.data ?? []
  const count = locations.length
  const selectedLocation = locations.find((l) => String(l.id) === String(selectedLocationId))

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <DollarSign className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Prices</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Set the active selling price per location and review how it has changed over time.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {count} location{count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <DollarSign className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a location first, then you can set and track prices here.
          </p>
        </div>
      ) : (
        <>
          {banner.type ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                banner.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              {banner.text}
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {locations.map((loc) => (
              <LocationPrice
                key={loc.id}
                location={loc}
                getPrices={getPrices}
                isSelected={String(selectedLocationId) === String(loc.id)}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Price history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedLocation
                    ? `Showing changes for ${selectedLocation.name}.`
                    : "Choose “View history” on a location card to load its timeline."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-200 shrink-0"
                disabled={prices.length === 0}
                onClick={() => setViewChart((v) => !v)}
              >
                <LineChartIcon className="mr-2 h-4 w-4" aria-hidden />
                {viewChart ? "Hide chart" : "Show chart"}
              </Button>
            </div>

            {viewChart && prices.length > 0 ? (
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <Chart data={prices} dataKeyX="created_at" dataKeyY="price" />
              </div>
            ) : null}

            <div className={viewChart && prices.length > 0 ? "mt-6" : "mt-4"}>
              <PriceTable data={prices} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Prices
