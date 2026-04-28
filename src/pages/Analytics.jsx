import Analytic from "@/components/analytic"
import { setActiveMenu } from "@/store/MenuSlice"
import { MapPin } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const Analytics = () => {
  const { locations } = useLoaderData()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)
  const location = useLocation()

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])
  const list = locations?.data

  if (!list || list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <MapPin className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">No locations yet</h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Add a location from the dashboard to see analytics and trends here.
        </p>
      </div>
    )
  }

  return <Analytic locations={locations} />
}

export default Analytics
