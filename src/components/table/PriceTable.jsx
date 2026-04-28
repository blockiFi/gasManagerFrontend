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

function isActivePrice(row) {
  const v = row.getValue("active")
  return v === true || v === "true" || v === 1 || v === "1"
}

const columns = [
  {
    id: "rowNum",
    header: "#",
    cell: ({ row }) => <span className="tabular-nums text-slate-500">{row.index + 1}</span>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums text-slate-900">₦{formatCurrency(row.getValue("price"))}</span>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) =>
      isActivePrice(row) ? (
        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
          Active
        </span>
      ) : (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
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
      return <span className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</span>
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

const PriceTable = ({ data = [] }) => {
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

  const empty = reversedArray.length === 0

  return (
    <div className="w-full rounded-xl border border-slate-100 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter by price value…"
          value={(table.getColumn("price")?.getFilterValue() ?? "")}
          onChange={(event) => table.getColumn("price")?.setFilterValue(event.target.value)}
          className="max-w-sm border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20"
          disabled={empty}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-200 shrink-0" disabled={empty}>
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
      </div>

      <div className="overflow-x-auto px-1">
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
            {empty ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-slate-500">
                  No history loaded yet. Use &quot;View history&quot; on a location card above.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-slate-100 transition-colors hover:bg-slate-50/80"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-middle text-sm">
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

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <p className="text-sm text-slate-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
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
