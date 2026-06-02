import { useEffect, useState } from "react"
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
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarDays, ListFilter, Search, Tag } from "lucide-react"

function isActivePrice(row) {
  const v = row.getValue("active")
  return v === true || v === "true" || v === 1 || v === "1"
}

const COLUMN_LABELS = {
  rowNum: "#",
  price: "Price",
  active: "Status",
  created_at: "Start date",
  updated_at: "End date",
  duration: "Duration",
}

const columns = [
  {
    id: "rowNum",
    header: "#",
    cell: ({ row }) => <span className="text-xs font-medium tabular-nums text-slate-400">{row.index + 1}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          <Tag className="h-3.5 w-3.5" aria-hidden />
        </span>
        <span className="font-semibold tabular-nums text-slate-900">
          ₦{formatCurrency(row.getValue("price"))}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) =>
      isActivePrice(row) ? (
        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
          Active
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          Inactive
        </span>
      ),
  },
  {
    accessorKey: "created_at",
    header: "Start date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
      return (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" aria-hidden />
          {format(date, "d MMM yyyy")}
        </span>
      )
    },
  },
  {
    accessorKey: "updated_at",
    header: "End date",
    cell: ({ row }) => {
      if (isActivePrice(row)) {
        return <span className="text-sm font-medium text-indigo-600">Current</span>
      }
      const date = new Date(row.getValue("updated_at"))
      if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
      return <span className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</span>
    },
  },
  {
    id: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const date1 = new Date(row.getValue("created_at"))
      let date2 = new Date(row.getValue("updated_at"))
      if (isActivePrice(row)) {
        date2 = new Date()
      }
      if (Number.isNaN(date1.getTime())) return "—"
      const ms = date2 - date1
      const days = Math.floor(ms / (1000 * 60 * 60 * 24))
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      return (
        <span className="tabular-nums text-sm text-slate-700">
          {days}d {hours}h
        </span>
      )
    },
  },
]

// eslint-disable-next-line react/prop-types
const PriceTable = ({ data = [], isLoading = false, emptyHint }) => {
  const [reversedArray, setReversedArray] = useState([])

  useEffect(() => {
    setReversedArray([...data].reverse())
  }, [data])

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())
  const priceColumn = table.getColumn("price")
  const empty = !isLoading && reversedArray.length === 0

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <p className="mt-4 text-sm text-slate-500">Loading price history…</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            placeholder="Filter by price value…"
            value={priceColumn?.getFilterValue() ?? ""}
            onChange={(event) => priceColumn?.setFilterValue(event.target.value)}
            className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
            disabled={empty}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-200 shadow-sm" disabled={empty}>
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
              {empty ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-36 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6">
                      <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400">
                        <Tag className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-sm font-medium text-slate-700">No price history</p>
                      <p className="max-w-sm text-sm text-slate-500">
                        {emptyHint ?? "Set a price for this location to start building a history."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow
                    key={row.id}
                    className={`border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                    data-state={row.getIsSelected() && "selected"}
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
                  <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-slate-500">
                    No rows match your filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
            disabled={!table.getCanPreviousPage() || empty}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-200"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || empty}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PriceTable
