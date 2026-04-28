import SettingsTable from "@/components/table/SettingsTable"
import HeaderCard from "@/components/HeaderCard"
import { setActiveMenu } from "@/store/MenuSlice"
import { SlidersHorizontal } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const Settings = () => {
  const business = useSelector((state) => state.authentication.business)
  const { settings } = useLoaderData()
  const location = useLocation()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  const list =
    settings?.success && Array.isArray(settings.data) ? settings.data : []

  return (
    <div className="flex flex-col gap-8">
      <HeaderCard name="Settings" address={business?.address}>
        <div className="flex items-start gap-2 text-left text-sm text-slate-600 sm:max-w-sm sm:text-right">
          <SlidersHorizontal className="mt-0.5 hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden />
          <span>Business preferences and defaults. Changes apply after you save each row.</span>
        </div>
      </HeaderCard>

      {!settings?.success ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {settings?.error ?? "Could not load settings."}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Configuration</h2>
          <p className="mt-1 text-sm text-slate-500">
            {list.length} setting{list.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <SettingsTable data={list} />
        </div>
      </section>
    </div>
  )
}

export default Settings
