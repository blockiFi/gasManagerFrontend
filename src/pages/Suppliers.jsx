import AddSupplier from "@/components/supplier/AddSupplier"
import SupplierListItem from "@/components/supplier/SupplierListItem"
import UpdateSupplier from "@/components/supplier/UpdateSupplier"
import Can from "@/components/Auth/Can"
import SupplierSupplyTable from "@/components/table/SupplierSupplyTable"
import {
  isDelivered,
  isOpenSupply,
  isUnlimitedSupply,
} from "@/components/table/SupplyTable"
import { Button } from "@/components/ui/button"
import { getBusinessSuppliers, getBusinessSupplies } from "@/lib/request"
import { CAPABILITIES } from "@/lib/permissions"
import { formatCurrency } from "@/lib/utils"
import { setActiveMenu } from "@/store/MenuSlice"
import {
  Building2,
  CreditCard,
  Loader2,
  Phone,
  Scale,
  Truck,
  User,
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

function matchesSupplier(supply, supplierId) {
  return (
    String(supply.supplier_id ?? "") === String(supplierId) ||
    String(supply.supplier?.id ?? "") === String(supplierId)
  )
}

function computeSupplyTotals(supplies) {
  let totalKg = 0
  let totalSpend = 0
  for (const s of supplies) {
    if (isUnlimitedSupply(s) && isOpenSupply(s)) continue
    totalKg += Number(s.quantity) || 0
    totalSpend += Number(s.amount) || 0
  }
  return { totalKg, totalSpend }
}

function summarizeSupplier(supplier, allSupplies) {
  const supplies = allSupplies.filter((s) => matchesSupplier(s, supplier.id))
  const { totalKg, totalSpend } = computeSupplyTotals(supplies)
  return {
    supplier,
    supplies,
    supplyCount: supplies.length,
    totalKg,
    totalSpend,
  }
}

function filterByStatus(supplies, status) {
  if (status === "pending") return supplies.filter((s) => !isDelivered(s))
  if (status === "open") return supplies.filter((s) => isDelivered(s) && isOpenSupply(s))
  if (status === "closed") return supplies.filter((s) => isDelivered(s) && !isOpenSupply(s))
  return supplies
}

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
      <Icon className="h-4 w-4" aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  </div>
)

const Suppliers = () => {
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { suppliers: suppliersResult, supplies: suppliesResult } = useLoaderData()
  const dispatch = useDispatch()
  const location = useLocation()
  const menu = useSelector((state) => state.menu.menu)

  const [supplierList, setSupplierList] = useState([])
  const [supplyList, setSupplyList] = useState([])
  const [selectedRow, setSelectedRow] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (suppliersResult?.success && Array.isArray(suppliersResult.data)) {
      setSupplierList(suppliersResult.data)
    } else {
      setSupplierList([])
    }
  }, [suppliersResult])

  useEffect(() => {
    if (suppliesResult?.success && Array.isArray(suppliesResult.data)) {
      setSupplyList(suppliesResult.data)
    } else {
      setSupplyList([])
    }
  }, [suppliesResult])

  const refreshData = useCallback(async () => {
    if (!business?.id) return
    setLoadingData(true)
    try {
      const [suppliersRes, suppliesRes] = await Promise.all([
        getBusinessSuppliers(token, business.id),
        getBusinessSupplies(token, business.id),
      ])
      if (suppliersRes.success && Array.isArray(suppliersRes.data)) {
        setSupplierList(suppliersRes.data)
      }
      if (suppliesRes.success && Array.isArray(suppliesRes.data)) {
        setSupplyList(suppliesRes.data)
      }
    } catch {
      /* keep existing */
    } finally {
      setLoadingData(false)
    }
  }, [business?.id, token])

  const supplierRows = useMemo(
    () => supplierList.map((supplier) => summarizeSupplier(supplier, supplyList)),
    [supplierList, supplyList]
  )

  useEffect(() => {
    if (supplierRows.length > 0 && !selectedRow) {
      const withSupplies = supplierRows.find((r) => r.supplyCount > 0)
      setSelectedRow(withSupplies ?? supplierRows[0])
    }
  }, [supplierRows, selectedRow])

  useEffect(() => {
    if (!selectedRow) return
    const updated = supplierRows.find((r) => String(r.supplier.id) === String(selectedRow.supplier.id))
    if (updated) setSelectedRow(updated)
  }, [supplierRows, selectedRow?.supplier.id])

  const totals = useMemo(() => {
    const { totalKg, totalSpend } = computeSupplyTotals(supplyList)
    const activeSuppliers = supplierRows.filter((r) => r.supplyCount > 0).length
    return {
      supplierCount: supplierList.length,
      supplyCount: supplyList.length,
      totalKg,
      totalSpend,
      activeSuppliers,
    }
  }, [supplierList.length, supplyList, supplierRows])

  const filteredSupplies = useMemo(() => {
    if (!selectedRow) return []
    return filterByStatus(selectedRow.supplies, statusFilter)
  }, [selectedRow, statusFilter])

  const avgCostPerKg =
    selectedRow && selectedRow.totalKg > 0
      ? selectedRow.totalSpend / selectedRow.totalKg
      : 0

  if (!suppliersResult?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center shadow-sm">
        <p className="text-sm font-medium text-rose-900">
          {suppliersResult?.error ?? "Could not load suppliers."}
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
              <Building2 className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Suppliers</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Manage vendor contacts and see how much each supplier has delivered across your business.
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                {totals.supplierCount} supplier{totals.supplierCount === 1 ? "" : "s"} ·{" "}
                {totals.supplyCount} supply record{totals.supplyCount === 1 ? "" : "s"}
                {loadingData ? (
                  <span className="ml-2 inline-flex items-center gap-1 normal-case text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                    Updating…
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <Can capability={CAPABILITIES.SUPPLIER_MANAGE}>
            <AddSupplier business_id={business.id} onSuccess={refreshData} />
          </Can>
        </div>

        {totals.supplierCount > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Suppliers on file"
              value={String(totals.supplierCount)}
              hint={`${totals.activeSuppliers} with supply history`}
              icon={Building2}
              accent="indigo"
            />
            <StatCard
              label="Total supplied (kg)"
              value={formatCurrency(totals.totalKg)}
              hint="Across all recorded supplies"
              icon={Scale}
              accent="emerald"
            />
            <StatCard
              label="Total spend"
              value={`₦${formatCurrency(totals.totalSpend)}`}
              hint="Purchase amounts recorded"
              icon={Wallet}
              accent="slate"
            />
            <StatCard
              label="Supply records"
              value={String(totals.supplyCount)}
              hint="Linked to suppliers"
              icon={Truck}
              accent="indigo"
            />
          </div>
        ) : null}
      </div>

      {totals.supplierCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No suppliers yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add your first supplier to link them to supply orders and track delivery volumes.
          </p>
          <div className="mt-6">
            <Can capability={CAPABILITIES.SUPPLIER_MANAGE}>
              <AddSupplier business_id={business.id} onSuccess={refreshData} />
            </Can>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
          {/* Supplier sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">Suppliers</h2>
              <p className="mt-1 text-sm text-slate-500">Select a vendor to view supply history</p>
            </div>
            <div className="flex max-h-[min(70vh,640px)] flex-col gap-2 overflow-y-auto p-4">
              {supplierRows.map((row) => (
                <SupplierListItem
                  key={row.supplier.id}
                  row={row}
                  isSelected={String(selectedRow?.supplier.id) === String(row.supplier.id)}
                  onSelect={setSelectedRow}
                />
              ))}
            </div>
          </aside>

          {/* Detail panel */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {selectedRow ? (
              <>
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                        <h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">
                          {selectedRow.supplier.name}
                        </h2>
                      </div>
                      {selectedRow.supplier.address ? (
                        <p className="mt-1 text-sm text-slate-500">{selectedRow.supplier.address}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="text-slate-500">
                          Supplies{" "}
                          <span className="font-semibold tabular-nums text-slate-900">
                            {selectedRow.supplyCount}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Total kg{" "}
                          <span className="font-semibold tabular-nums text-slate-900">
                            {formatCurrency(selectedRow.totalKg)}
                          </span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">
                          Spend{" "}
                          <span className="font-semibold tabular-nums text-emerald-700">
                            ₦{formatCurrency(selectedRow.totalSpend)}
                          </span>
                        </span>
                        {avgCostPerKg > 0 ? (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">
                              Avg ₦/kg{" "}
                              <span className="font-semibold tabular-nums text-slate-900">
                                ₦{formatCurrency(avgCostPerKg)}
                              </span>
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <Can capability={CAPABILITIES.SUPPLIER_MANAGE}>
                      <UpdateSupplier supplier={selectedRow.supplier} onSuccess={refreshData} />
                    </Can>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <DetailRow
                      icon={User}
                      label="Contact"
                      value={selectedRow.supplier.contact_person_name}
                    />
                    <DetailRow
                      icon={Phone}
                      label="Phone"
                      value={selectedRow.supplier.contact_person_number}
                    />
                    <DetailRow
                      icon={CreditCard}
                      label="Bank account"
                      value={`${selectedRow.supplier.bank_name} · ${selectedRow.supplier.account_number}`}
                    />
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

                <div className="px-5 py-5 sm:px-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Supply history</h3>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {STATUS_TABS.find((t) => t.id === statusFilter)?.label ?? "All"} ·{" "}
                      {filteredSupplies.length} record{filteredSupplies.length === 1 ? "" : "s"}
                      {selectedRow.supplyCount === 0
                        ? " · No deliveries logged yet for this supplier"
                        : ""}
                    </p>
                  </div>

                  <SupplierSupplyTable
                    data={filteredSupplies}
                    businessId={business.id}
                    emptyHint={
                      statusFilter === "all"
                        ? "No supply orders linked to this supplier yet."
                        : `No ${statusFilter} supply records for this supplier.`
                    }
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                  <Building2 className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-sm font-medium text-slate-700">Select a supplier</p>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a vendor from the list to view contact details and supply history.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default Suppliers
