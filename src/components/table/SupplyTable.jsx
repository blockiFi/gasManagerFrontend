import { useEffect, useMemo, useState } from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import { ListFilter, MapPin, Package, Search } from "lucide-react"
import AddSupply from "../supply/AddSupply"
import TransferSupply from "../supply/TransferSupply"
import ConfirmSupply from "../supplier/ConfirmSupply"
import CloseSupply from "../supplier/CloseSupply"
import SupplyDetailsModal from "@/components/supply/SupplyDetailsModal"
import Can from "@/components/Auth/Can"
import { CAPABILITIES } from "@/lib/permissions"

const isUnlimitedSupply = (row) => row.unlimited === true || row.unlimited === 1 || row.unlimited === "1"
const isOpenSupply = (row) => !(row.sold === true || row.sold === 1 || row.sold === "1")
export const isDelivered = (row) => row.supplied === 1 || row.supplied === true
export { isUnlimitedSupply, isOpenSupply }

const COLUMN_LABELS = {
  rowNum: "#",
  id: "ID",
  locationName: "Location",
  dispenserName: "Dispenser",
  quantity: "Qty (kg)",
  amount: "Amount",
  supplierName: "Supplier",
  note: "Note",
  supplied: "Status",
  available_quantity: "Available",
  excess_kg: "Surplus (kg)",
  purchased_at: "Purchased",
  delivered_at: "Delivered",
  actions: "Actions",
}

const createColumns = (onSupplyUpdated, showLocationColumn) => [
  {
    id: "rowNum",
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs font-medium tabular-nums text-slate-400">{row.index + 1}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-600">{row.getValue("id")}</span>
    ),
  },
  ...(showLocationColumn
    ? [
        {
          id: "locationName",
          accessorFn: (row) => row.location?.name ?? "",
          header: "Location",
          cell: ({ row }) => (
            <div className="max-w-[140px] truncate font-medium text-slate-900">
              {row.original.location?.name ?? "—"}
            </div>
          ),
        },
      ]
    : []),
  {
    id: "dispenserName",
    accessorFn: (row) => row.dispenser?.name ?? "",
    header: "Dispenser",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          <Package className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="max-w-[120px] truncate font-medium text-slate-900">
          {row.original.dispenser?.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty (kg)",
    cell: ({ row }) => {
      const s = row.original
      if (isUnlimitedSupply(s) && isOpenSupply(s)) {
        return <span className="text-sm italic text-slate-500">Running</span>
      }
      return (
        <span className="tabular-nums text-sm text-slate-800">{formatCurrency(row.getValue("quantity"))}</span>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const s = row.original
      if (isUnlimitedSupply(s) && isOpenSupply(s)) {
        return <span className="text-sm italic text-slate-500">—</span>
      }
      return (
        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-900 ring-1 ring-slate-200/80">
          ₦{formatCurrency(row.getValue("amount"))}
        </span>
      )
    },
  },
  {
    id: "supplierName",
    accessorFn: (row) => row.supplier?.name ?? "",
    header: "Supplier",
    cell: ({ row }) => (
      <div className="max-w-[130px] truncate text-sm text-slate-700">
        {row.original.supplier?.name ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <div className="max-w-[160px] truncate text-sm text-slate-500">{row.getValue("note") || "—"}</div>
    ),
  },
  {
    accessorKey: "supplied",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original
      const ok = isDelivered(s)
      const unlimited = isUnlimitedSupply(s)
      const sold = !isOpenSupply(s)
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {unlimited ? (
            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-100">
              Unlimited
            </span>
          ) : null}
          {!ok ? (
            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-100">
              Pending
            </span>
          ) : sold ? (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
              Closed
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
              Open
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "available_quantity",
    header: "Available",
    cell: ({ row }) => {
      const s = row.original
      if (isUnlimitedSupply(s) && isOpenSupply(s)) {
        return <span className="text-sm italic text-slate-500">—</span>
      }
      return (
        <span className="tabular-nums text-sm text-slate-800">{row.getValue("available_quantity")}</span>
      )
    },
  },
  {
    accessorKey: "excess_kg",
    header: "Surplus (kg)",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-slate-700">{row.getValue("excess_kg")}</span>
    ),
  },
  {
    accessorKey: "purchased_at",
    header: "Purchased",
    cell: ({ row }) => {
      const raw = row.getValue("purchased_at")
      const date = new Date(raw)
      if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
      return <span className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</span>
    },
  },
  {
    accessorKey: "delivered_at",
    header: "Delivered",
    cell: ({ row }) => {
      if (isDelivered(row.original)) {
        const raw = row.getValue("delivered_at")
        const date = new Date(raw)
        if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
        return <span className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</span>
      }
      return <span className="text-sm text-slate-400">—</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const s = row.original
      const supplied = isDelivered(s)
      const sold = !isOpenSupply(s)
      const unlimited = isUnlimitedSupply(s)
      if (!supplied) {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Can capability={CAPABILITIES.SUPPLY_MANAGE}>
              <ConfirmSupply supply={s} onSuccess={onSupplyUpdated} />
            </Can>
          </div>
        )
      }
      if (!sold) {
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Can capability={CAPABILITIES.SUPPLY_MANAGE}>
              {!unlimited ? <TransferSupply supply={s} onSuccess={onSupplyUpdated} /> : null}
              <CloseSupply supply={s} onSuccess={onSupplyUpdated} />
            </Can>
          </div>
        )
      }
      return <span className="text-sm text-slate-400">Closed</span>
    },
  },
]

const selectClass = cn(
  "h-10 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm",
  "focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
)

function matchesLocationFilter(row, locationId) {
  if (!locationId) return true
  const lid = String(locationId)
  if (String(row.location_id ?? "") === lid) return true
  if (String(row.location?.id ?? "") === lid) return true
  return false
}

// eslint-disable-next-line react/prop-types
const SupplyTable = ({
  data = [],
  business_id,
  locations,
  suppliers,
  embedded = false,
  onSupplyUpdated,
}) => {
  const [locationFilterId, setLocationFilterId] = useState("")
  const locationsData = locations?.data
  const locationOptions = useMemo(() => {
    if (!Array.isArray(locationsData)) return []
    return [...locationsData].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
  }, [locationsData])

  const filteredByLocation = useMemo(() => {
    if (embedded || !locationFilterId) return data
    return data.filter((row) => matchesLocationFilter(row, locationFilterId))
  }, [data, locationFilterId, embedded])

  const [reversedArray, setReversedArray] = useState([])

  useEffect(() => {
    setReversedArray([...filteredByLocation].reverse())
  }, [filteredByLocation])

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState(
    embedded ? { locationName: false } : {}
  )
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState(null)

  const columns = useMemo(
    () => createColumns(onSupplyUpdated, !embedded),
    [onSupplyUpdated, embedded]
  )

  const table = useReactTable({
    data: reversedArray,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      if (filterValue == null || String(filterValue).trim() === "") return true
      const original = row.original
      const q = String(filterValue).toLowerCase()
      const loc = (original.location?.name ?? "").toLowerCase()
      const disp = (original.dispenser?.name ?? "").toLowerCase()
      const sup = (original.supplier?.name ?? "").toLowerCase()
      return loc.includes(q) || disp.includes(q) || sup.includes(q)
    },
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className={`w-full ${embedded ? "" : "rounded-2xl border border-slate-200 bg-white shadow-sm"}`}>
      <SupplyDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        supply={selectedSupply}
        businessId={business_id}
      />

      <div
        className={`flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${
          embedded ? "mb-4" : "border-b border-slate-100 p-4 sm:p-5"
        }`}
      >
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            id="supply-search"
            placeholder="Search dispenser or supplier…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!embedded ? (
            <div className="flex items-center gap-2">
              <Label htmlFor="supply-location-filter" className="sr-only">
                Location
              </Label>
              <MapPin className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden />
              <select
                id="supply-location-filter"
                className={selectClass}
                value={locationFilterId}
                onChange={(e) => setLocationFilterId(e.target.value)}
                aria-label="Filter supplies by location"
              >
                <option value="">All locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-200 shadow-sm">
                <ListFilter className="mr-1.5 h-4 w-4 text-slate-500" aria-hidden />
                Columns
                <ChevronDownIcon className="ml-1.5 h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {COLUMN_LABELS[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!embedded ? (
            <Can capability={CAPABILITIES.SUPPLY_ADD}>
              <AddSupply
                business_id={business_id}
                locations={locations}
                suppliers={suppliers}
                onSuccess={onSupplyUpdated}
              />
            </Can>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[min(56vh,520px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm [&_tr]:border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={`cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => {
                      setSelectedSupply(row.original)
                      setDetailsOpen(true)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 align-middle text-sm"
                        onClick={(e) => {
                          if (cell.column.id === "actions") e.stopPropagation()
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <Package className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No supplies found</p>
                      <p className="text-sm text-slate-500">Try another filter or add a new supply record.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${embedded ? "mt-4" : "border-t border-slate-100 px-4 py-3 sm:px-5"}`}>
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{totalRows}</span> entr{totalRows === 1 ? "y" : "ies"}
          <span className="mx-2 text-slate-300">·</span>
          Page <span className="font-medium text-slate-700">{pageIndex + 1}</span> of{" "}
          <span className="font-medium text-slate-700">{pageCount}</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SupplyTable
