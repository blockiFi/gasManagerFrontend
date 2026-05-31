/* eslint-disable react/prop-types -- API payload shapes */
import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getSupplyDetails } from "@/lib/request"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Loader2, Package, Truck, User } from "lucide-react"
import { useSelector } from "react-redux"

const Stat = ({ label, value, tone = "default" }) => {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900 ring-amber-200"
        : tone === "bad"
          ? "bg-rose-50 text-rose-900 ring-rose-200"
          : "bg-slate-50 text-slate-900 ring-slate-200"

  return (
    <div className={cn("rounded-2xl p-4 ring-1 ring-inset", toneClass)}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function safeDate(raw) {
  const d = raw ? new Date(raw) : null
  if (!d || Number.isNaN(d.getTime())) return null
  return d
}

export default function SupplyDetailsModal({ open, onOpenChange, supply, businessId }) {
  const token = useSelector((state) => state.authentication.token)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [details, setDetails] = useState(null)

  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!open) return
      if (!supply?.id) return
      setLoading(true)
      setError("")
      setDetails(null)
      const res = await getSupplyDetails(token, businessId, supply.id)
      if (!alive) return
      setLoading(false)
      if (!res.success) {
        setError(res.error ?? "Could not load supply details.")
        return
      }
      setDetails(res.data)
    }
    run()
    return () => {
      alive = false
    }
  }, [open, supply?.id, token, businessId])

  const header = useMemo(() => {
    const s = details?.supply ?? supply
    if (!s) return null
    const purchasedAt = safeDate(s.purchased_at)
    const deliveredAt = safeDate(s.delivered_at)
    const supplied = s.supplied === true || s.supplied === 1
    const sold = s.sold === true || s.sold === 1 || s.sold === "1"
    const unlimited = s.unlimited === true || s.unlimited === 1 || s.unlimited === "1"
    return {
      locationName: s.location?.name ?? "—",
      dispenserName: s.dispenser?.name ?? "—",
      supplierName: s.supplier?.name ?? "—",
      receiverName: s.reciever?.name ?? s.reciever?.email ?? "—",
      supplied,
      sold,
      unlimited,
      unitCost: s.unit_cost ?? null,
      purchasedAt,
      deliveredAt,
      note: s.note ?? "",
    }
  }, [details, supply])

  const totals = details?.totals
  const sales = Array.isArray(details?.sales) ? details.sales : []

  const quantityDisplay = useMemo(() => {
    if (header?.unlimited && !header?.sold) {
      const soldKg = totals?.total_kg_sold ?? 0
      return soldKg > 0 ? `Running (${formatCurrency(soldKg)} kg sold)` : "Running"
    }
    return formatCurrency(totals?.quantity ?? supply?.quantity ?? 0)
  }, [header, totals, supply])

  const quantityLeftDisplay = useMemo(() => {
    if (header?.unlimited && !header?.sold) {
      return "—"
    }
    return formatCurrency(totals?.quantity_left ?? supply?.available_quantity ?? 0)
  }, [header, totals, supply])

  const toneForStatus = header?.sold ? "good" : header?.supplied ? "warn" : "bad"
  const statusLabel = header?.sold ? "Closed" : header?.supplied ? "Delivered" : "Pending"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-slate-700" aria-hidden />
            Supply details
          </DialogTitle>
          <DialogDescription>
            Supply batch, sales breakdown, and surplus analytics.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading supply details…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-900">
            {error}
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
                  <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">
                    {header?.locationName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Dispenser: <span className="font-medium text-slate-800">{header?.dispenserName}</span>
                    <span className="text-slate-300"> · </span>
                    Supplier: <span className="font-medium text-slate-800">{header?.supplierName}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {header?.unlimited ? (
                    <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 ring-1 ring-inset ring-indigo-200">
                      Unlimited
                    </span>
                  ) : null}
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset", {
                    "bg-emerald-50 text-emerald-800 ring-emerald-200": toneForStatus === "good",
                    "bg-amber-50 text-amber-900 ring-amber-200": toneForStatus === "warn",
                    "bg-rose-50 text-rose-800 ring-rose-200": toneForStatus === "bad",
                  })}>
                    {statusLabel}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    <Truck className="h-4 w-4 text-slate-500" aria-hidden />
                    {header?.deliveredAt ? `Delivered ${format(header.deliveredAt, "d MMM yyyy")}` : "Not delivered"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                    <User className="h-4 w-4 text-slate-500" aria-hidden />
                    {header?.receiverName}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Purchased</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {header?.purchasedAt ? format(header.purchasedAt, "d MMM yyyy") : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-inset ring-slate-200">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Note</p>
                  <p className="mt-1 line-clamp-2 text-slate-700">{header?.note || "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Quantity (kg)" value={quantityDisplay} />
              <Stat label="Quantity left (kg)" value={quantityLeftDisplay} tone={!header?.unlimited && (totals?.quantity_left ?? 0) > 0 ? "warn" : "good"} />
              <Stat label="Total kg sold" value={formatCurrency(totals?.total_kg_sold ?? 0)} />
              <Stat label="Total sales amount" value={`₦${formatCurrency(totals?.total_sales_amount ?? 0)}`} tone="good" />
              {header?.unlimited && !header?.sold ? (
                <Stat label="Cost per kg" value={`₦${formatCurrency(Number(header?.unitCost ?? 0))}`} />
              ) : null}
              <Stat label="Sales profit" value={`₦${formatCurrency(totals?.sales_profit ?? 0)}`} tone={(totals?.sales_profit ?? 0) >= 0 ? "good" : "bad"} />
              <Stat label="Excess (kg)" value={formatCurrency(totals?.excess_kg ?? supply?.excess_kg ?? 0)} tone={(totals?.excess_kg ?? 0) < 0 ? "bad" : "default"} />
              <Stat label="Excess profit" value={`₦${formatCurrency(totals?.excess_profit ?? 0)}`} />
              <Stat label="Total profit" value={`₦${formatCurrency(totals?.total_profit ?? 0)}`} tone="good" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h4 className="text-base font-semibold text-slate-900">Sales for this supply</h4>
                <p className="mt-1 text-sm text-slate-500">
                  {sales.length} sale record{sales.length === 1 ? "" : "s"} linked to this batch.
                </p>
              </div>
              <div className="max-h-[340px] overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Dispenser</th>
                      <th className="px-5 py-3">Kg</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Avg price</th>
                      <th className="px-5 py-3">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.length === 0 ? (
                      <tr>
                        <td className="px-5 py-10 text-center text-slate-500" colSpan={6}>
                          No sales linked to this supply yet.
                        </td>
                      </tr>
                    ) : (
                      sales
                        .slice()
                        .sort((a, b) => new Date(b.sales_date ?? 0) - new Date(a.sales_date ?? 0))
                        .map((s) => {
                          const d = safeDate(s.sales_date)
                          const kg = Number(s.kg_quantity ?? 0)
                          const amt = Number(s.amount ?? 0)
                          const avg = kg > 0 ? amt / kg : null
                          const profit = s.profit ?? null
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/80">
                              <td className="px-5 py-3 text-slate-700">
                                {d ? format(d, "d MMM yyyy") : "—"}
                              </td>
                              <td className="px-5 py-3 text-slate-700">{s.dispenser?.name ?? "—"}</td>
                              <td className="px-5 py-3 tabular-nums text-slate-700">{formatCurrency(kg)}</td>
                              <td className="px-5 py-3 tabular-nums text-slate-900">₦{formatCurrency(amt)}</td>
                              <td className="px-5 py-3 tabular-nums text-slate-700">
                                {avg == null ? "—" : `₦${formatCurrency(avg)}`}
                              </td>
                              <td className="px-5 py-3 tabular-nums text-slate-700">
                                {profit == null ? "—" : `₦${formatCurrency(profit)}`}
                              </td>
                            </tr>
                          )
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

