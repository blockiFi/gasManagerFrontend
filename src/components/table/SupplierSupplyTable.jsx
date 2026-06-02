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
import SupplyDetailsModal from "@/components/supply/SupplyDetailsModal"
import {
  isDelivered,
  isOpenSupply,
  isUnlimitedSupply,
} from "@/components/table/SupplyTable"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ListFilter, MapPin, Package, Search } from "lucide-react"

const COLUMN_LABELS = {
  rowNum: "#",
  locationName: "Location",
  dispenserName: "Dispenser",
  quantity: "Qty (kg)",
  amount: "Amount",
  supplied: "Status",
  purchased_at: "Purchased",
  delivered_at: "Delivered",
}

const columns = [
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
    id: "locationName",
    accessorFn: (row) => row.location?.name ?? "",
    header: "Location",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        <span className="max-w-[140px] truncate font-medium text-slate-900">
          {row.original.location?.name ?? "—"}
        </span>
      </div>
    ),
  },
  {
    id: "dispenserName",
    accessorFn: (row) => row.dispenser?.name ?? "",
    header: "Dispenser",
    cell: ({ row }) => (
      <span className="max-w-[120px] truncate text-sm text-slate-700">
        {row.original.dispenser?.name ?? "—"}
      </span>
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
    accessorKey: "supplied",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original
      const ok = isDelivered(s)
      const sold = !isOpenSupply(s)
      const unlimited = isUnlimitedSupply(s)
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
      if (!isDelivered(row.original)) return <span className="text-slate-400">—</span>
      const raw = row.getValue("delivered_at")
      const date = new Date(raw)
      if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
      return <span className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</span>
    },
  },
]

// eslint-disable-next-line react/prop-types
const SupplierSupplyTable = ({ data = [], businessId, emptyHint }) => {
  const [reversedArray, setReversedArray] = useState([])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedSupply, setSelectedSupply] = useState(null)

  useEffect(() => {
    setReversedArray([...data].reverse())
  }, [data])

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

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
    globalFilterFn: (row, _columnId, filterValue) => {
      if (filterValue == null || String(filterValue).trim() === "") return true
      const original = row.original
      const q = String(filterValue).toLowerCase()
      const loc = (original.location?.name ?? "").toLowerCase()
      const disp = (original.dispenser?.name ?? "").toLowerCase()
      return loc.includes(q) || disp.includes(q)
    },
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
  })

  const filteredTotal = useMemo(() => {
    const rows = table.getFilteredRowModel().rows
    let kg = 0
    let spend = 0
    for (const row of rows) {
      const s = row.original
      if (isUnlimitedSupply(s) && isOpenSupply(s)) continue
      kg += Number(s.quantity) || 0
      spend += Number(s.amount) || 0
    }
    return { kg, spend }
  }, [table, reversedArray, globalFilter])

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className="w-full space-y-4">
      <SupplyDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        supply={selectedSupply}
        businessId={businessId}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            placeholder="Search location or dispenser…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
          />
        </div>
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
                    onClick={() => {
                      setSelectedSupply(row.original)
                      setDetailsOpen(true)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3 align-middle text-sm">
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
                      <p className="text-sm font-medium text-slate-700">No supply records</p>
                      <p className="max-w-sm text-sm text-slate-500">
                        {emptyHint ?? "This supplier has no linked supply orders yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalRows > 0 ? (
          <div className="grid gap-3 border-t border-slate-100 bg-slate-50/80 px-4 py-3 sm:grid-cols-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Filtered kg</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {formatCurrency(filteredTotal.kg)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Filtered spend</span>
              <span className="font-semibold tabular-nums text-slate-900">
                ₦{formatCurrency(filteredTotal.spend)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

export default SupplierSupplyTable
