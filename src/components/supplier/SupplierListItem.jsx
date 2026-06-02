/* eslint-disable react/prop-types */
import { formatCurrency } from "@/lib/utils"
import { Building2, ChevronRight } from "lucide-react"

const SupplierListItem = ({ row, isSelected, onSelect }) => {
  const { supplier, supplyCount, totalKg, totalSpend } = row

  return (
    <button
      type="button"
      onClick={() => onSelect(row)}
      className={`group flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
        isSelected
          ? "border-indigo-300 bg-indigo-50/80 shadow-sm ring-1 ring-indigo-200"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
        }`}
      >
        <Building2 className="h-4 w-4" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{supplier.name}</p>
        {supplier.contact_person_name ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">{supplier.contact_person_name}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="text-slate-500">
            {supplyCount} suppl{supplyCount === 1 ? "y" : "ies"}
          </span>
          {totalKg > 0 ? (
            <>
              <span className="hidden text-slate-300 sm:inline">·</span>
              <span className="text-slate-500">
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatCurrency(totalKg)}
                </span>{" "}
                kg
              </span>
            </>
          ) : null}
        </div>
        {totalSpend > 0 ? (
          <p className="mt-1.5 text-xs text-slate-500">
            Spend{" "}
            <span className="font-semibold tabular-nums text-emerald-700">
              ₦{formatCurrency(totalSpend)}
            </span>
          </p>
        ) : null}
      </div>

      <ChevronRight
        className={`h-4 w-4 shrink-0 transition ${
          isSelected ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
        }`}
        aria-hidden
      />
    </button>
  )
}

export default SupplierListItem
