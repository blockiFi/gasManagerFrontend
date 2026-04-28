import AddSupplier from "@/components/supplier/AddSupplier"
import SupplierTable from "@/components/table/SupplierTable"
import { setActiveMenu } from "@/store/MenuSlice"
import { Building2 } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const Suppliers = () => {
  const business = useSelector((state) => state.authentication.business)
  const { suppliers } = useLoaderData()
  const dispatch = useDispatch()
  const location = useLocation()
  const menu = useSelector((state) => state.menu.menu)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  if (!suppliers?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {suppliers?.error ?? "Could not load suppliers."}
        </p>
      </div>
    )
  }

  const list = suppliers.data ?? []
  const count = Array.isArray(list) ? list.length : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Suppliers</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Manage vendor contacts and payout details for your gas business.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {count} supplier{count === 1 ? "" : "s"} on file
              </p>
            </div>
          </div>
        </div>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No suppliers yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add your first supplier to link them to supply orders and payouts.
          </p>
          <div className="mt-6">
            <AddSupplier business_id={business.id} />
          </div>
        </div>
      ) : (
        <SupplierTable data={list} business_id={business.id} />
      )}
    </div>
  )
}

export default Suppliers
