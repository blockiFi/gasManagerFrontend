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
import { format } from "date-fns"
import AddSupplier from "../supplier/AddSupplier"
import UpdateSupplier from "../supplier/UpdateSupplier"

const columns = [
  {
    id: "select",
    header: "#",
    cell: ({ row }) => <div className="tabular-nums text-slate-500">{row.index + 1}</div>,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[220px] truncate text-sm text-slate-600">{row.getValue("address")}</div>
    ),
  },
  {
    accessorKey: "contact_person_name",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm text-slate-800">{row.getValue("contact_person_name")}</div>
    ),
  },
  {
    accessorKey: "contact_person_number",
    header: "Phone",
    cell: ({ row }) => (
      <div className="tabular-nums text-sm text-slate-700">{row.getValue("contact_person_number")}</div>
    ),
  },
  {
    accessorKey: "account_number",
    header: "Account no.",
    cell: ({ row }) => (
      <span className="inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-800">
        {row.getValue("account_number")}
      </span>
    ),
  },
  {
    accessorKey: "account_name",
    header: "Account name",
    cell: ({ row }) => (
      <div className="max-w-[160px] truncate text-sm text-slate-600">{row.getValue("account_name")}</div>
    ),
  },
  {
    accessorKey: "bank_name",
    header: "Bank",
    cell: ({ row }) => (
      <div className="text-sm text-slate-700">{row.getValue("bank_name")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Added",
    cell: ({ row }) => {
      const raw = row.getValue("created_at")
      const date = new Date(raw)
      if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>
      return <div className="text-sm text-slate-600">{format(date, "d MMM yyyy")}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UpdateSupplier supplier={row.original} />,
  },
]

const SupplierTable = ({ data = [], business_id }) => {
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

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Input
          placeholder="Filter by supplier name…"
          value={(table.getColumn("name")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm border-slate-200 bg-slate-50/50 focus-visible:ring-indigo-500/20"
        />
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
          <AddSupplier business_id={business_id} />
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
                <TableCell colSpan={columns.length} className="h-28 text-center text-sm text-slate-500">
                  No suppliers match your filter.
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

export default SupplierTable
