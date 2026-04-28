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
import { MapPin } from "lucide-react"
import AddSupply from "../supply/AddSupply"
import TransferSupply from "../supply/TransferSupply"
import ConfirmSupply from "../supplier/ConfirmSupply"
import CloseSupply from "../supplier/CloseSupply"
import SupplyDetailsModal from "@/components/supply/SupplyDetailsModal"

const columns = [
  {
    id: "rowNum",
    header: "#",
    cell: ({ row }) => (
      <span className="tabular-nums text-slate-500">{row.index + 1}</span>
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
  {
    id: "dispenserName",
    accessorFn: (row) => row.dispenser?.name ?? "",
    header: "Dispenser",
    cell: ({ row }) => (
      <div className="max-w-[120px] truncate text-sm text-slate-700">
        {row.original.dispenser?.name ?? "—"}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty (kg)",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-slate-800">{formatCurrency(row.getValue("quantity"))}</span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="inline-block rounded-md bg-emerald-50 px-2 py-1 text-sm font-medium tabular-nums text-emerald-800">
        ₦{formatCurrency(row.getValue("amount"))}
      </span>
    ),
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
      const ok = row.getValue("supplied") === 1 || row.getValue("supplied") === true
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            ok ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
          }`}
        >
          {ok ? "Delivered" : "Pending"}
        </span>
      )
    },
  },
  {
    accessorKey: "available_quantity",
    header: "Available",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-slate-800">{row.getValue("available_quantity")}</span>
    ),
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
      if (row.getValue("supplied") === 1) {
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
      const supplied = s.supplied === true || s.supplied === 1
      const sold = s.sold === true || s.sold === 1 || s.sold === "1"
      if (!supplied) {
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ConfirmSupply supply={s} />
          </div>
        )
      }
      if (!sold) {
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <TransferSupply supply={s} />
            <CloseSupply supply={s} />
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
const SupplyTable = ({ data = [], business_id, locations, suppliers }) => {
  const [locationFilterId, setLocationFilterId] = useState("")
  // eslint-disable-next-line react/prop-types -- locations is API payload shape { data: [...] }
  const locationsData = locations?.data
  const locationOptions = useMemo(() => {
    if (!Array.isArray(locationsData)) return []
    return [...locationsData].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
  }, [locationsData])

  const filteredByLocation = useMemo(() => {
    if (!locationFilterId) return data
    return data.filter((row) => matchesLocationFilter(row, locationFilterId))
  }, [data, locationFilterId])

  const [reversedArray, setReversedArray] = useState([])

  useEffect(() => {
    setReversedArray([...filteredByLocation].reverse())
  }, [filteredByLocation])

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState(null)

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

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <SupplyDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        supply={selectedSupply}
        businessId={business_id}
      />
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supply-location-filter" className="text-xs font-medium text-slate-600">
              Location
            </Label>
            <div className="flex items-center gap-2">
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
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-sm">
            <Label htmlFor="supply-search" className="text-xs font-medium text-slate-600">
              Search
            </Label>
            <Input
              id="supply-search"
              placeholder="Location, dispenser, or supplier…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-200">
                Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddSupply business_id={business_id} locations={locations} suppliers={suppliers} />
        </div>
      </div>

      <div className="overflow-x-auto px-1 pb-1">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="whitespace-nowrap bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600"
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/80"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => {
                    setSelectedSupply(row.original)
                    setDetailsOpen(true)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="align-middle text-sm"
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
                <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-slate-500">
                  No supplies match your filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5">
        <p className="text-sm text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
