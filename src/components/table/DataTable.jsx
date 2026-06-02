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
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { ListFilter, Search } from "lucide-react"
import AddSalesMenu from "../sales/AddSalesMenu"
import ConfirmPayment from "../sales/ConfirmPayment"
import EditSaleDate from "../sales/EditSaleDate"
import ReverseLatestSale from "../sales/ReverseLatestSale"
import UploadReciept from "../sales/UploadReciept"
import ViewReciept from "../sales/ViewReciept"
import Can from "@/components/Auth/Can"
import { CAPABILITIES } from "@/lib/permissions"

const money = (n) => `₦${formatCurrency(n)}`

const numCell = (children) => (
  <span className="tabular-nums text-slate-800">{children}</span>
)

const moneyPill = (n) => (
  <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold tabular-nums text-slate-800 ring-1 ring-slate-200/80">
    {money(n)}
  </span>
)

const moneyAccent = (n) => (
  <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold tabular-nums text-emerald-900 ring-1 ring-emerald-100">
    {money(n)}
  </span>
)

const statusStyles = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirming: "bg-sky-50 text-sky-800 ring-sky-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
}

const COLUMN_LABELS = {
  select: "#",
  dispenser: "Dispenser",
  opening_sales: "Opening (₦)",
  closing_sales: "Closing (₦)",
  opening_kg: "Open kg",
  closing_kg: "Close kg",
  price: "Price",
  average_price: "Avg price",
  kg_quantity: "Qty (kg)",
  amount: "Amount",
  expected_sales_amount: "Expected",
  profit: "Profit",
  uploaded_by: "Uploaded by",
  status: "Status",
  sales_date: "Date",
  Action: "Actions",
}

export const columns = [
  {
    id: "select",
    header: "#",
    cell: ({ row }) => (
      <span className="text-xs font-medium tabular-nums text-slate-400">{row.index + 1}</span>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "dispenser",
    header: "Dispenser",
    cell: ({ row }) => (
      <span className="font-medium text-slate-900">{row.getValue("dispenser").name}</span>
    ),
  },
  {
    accessorKey: "opening_sales",
    header: "Opening (₦)",
    cell: ({ row }) => moneyPill(row.getValue("opening_sales")),
  },
  {
    accessorKey: "closing_sales",
    header: "Closing (₦)",
    cell: ({ row }) => moneyPill(row.getValue("closing_sales")),
  },
  {
    accessorKey: "opening_kg",
    header: "Open kg",
    cell: ({ row }) => numCell(row.getValue("opening_kg")),
  },
  {
    accessorKey: "closing_kg",
    header: "Close kg",
    cell: ({ row }) => numCell(row.getValue("closing_kg")),
  },
  {
    accessorKey: "price",
    header: "Sales price",
    cell: ({ row }) => moneyPill(row.getValue("price").price),
  },
  {
    accessorKey: "average_price",
    header: "Avg price",
    cell: ({ row }) => moneyPill(row.getValue("average_price")),
  },
  {
    accessorKey: "kg_quantity",
    header: "Qty (kg)",
    cell: ({ row }) => numCell(row.getValue("kg_quantity")),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => moneyAccent(row.getValue("amount")),
  },
  {
    accessorKey: "expected_sales_amount",
    header: "Expected",
    cell: ({ row }) => moneyAccent(row.getValue("expected_sales_amount")),
  },
  {
    accessorKey: "profit",
    header: "Profit",
    cell: ({ row }) => moneyAccent(row.getValue("profit")),
  },
  {
    accessorKey: "uploaded_by",
    header: "Uploaded by",
    cell: ({ row }) => <span className="text-slate-600">{row.getValue("uploaded_by")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status")
      const ring = statusStyles[s] ?? "bg-slate-50 text-slate-700 ring-slate-200"
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${ring}`}
        >
          {s}
        </span>
      )
    },
  },
  {
    accessorKey: "sales_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("sales_date"))
      const formattedDate = format(date, "do MMMM, yyyy")
      return <span className="whitespace-nowrap text-slate-700">{formattedDate}</span>
    },
  },
  {
    accessorKey: "Action",
    header: "Actions",
    cell: ({ row, table }) => {
      const latestIdsByDispenser = table?.options?.meta?.latestIdsByDispenser ?? {}
      const did = String(row.original.dispenser?.id ?? row.original.dispenser_id)
      const latestId = latestIdsByDispenser[did]
      const isLatestForDispenser = String(row.original.id) === String(latestId)

      const locationId = row.original.location_id

      return (
        <div className="flex max-w-[220px] flex-wrap gap-1.5">
          <Can capability={CAPABILITIES.SALES_EDIT_DATE} locationId={locationId}>
            <EditSaleDate sale={row.original} />
          </Can>
          {isLatestForDispenser ? (
            <Can capability={CAPABILITIES.SALES_REVERSE} locationId={locationId}>
              <ReverseLatestSale sale={row.original} />
            </Can>
          ) : null}
          {row.getValue("status") === "pending" && (
            <Can capability={CAPABILITIES.SALES_UPLOAD_RECEIPT} locationId={locationId}>
              <UploadReciept
                salesID={row.original.id}
                businessID={row.original.business_id}
                locationID={row.original.location_id}
              />
            </Can>
          )}
          {row.getValue("status") === "confirming" && (
            <>
              <ViewReciept
                salesID={row.original.id}
                businessID={row.original.business_id}
                LocationID={row.original.location_id}
              />
              <Can capability={CAPABILITIES.SALES_CONFIRM_PAYMENT}>
                <ConfirmPayment
                  salesID={row.original.id}
                  businessID={row.original.business_id}
                  locationID={row.original.location_id}
                />
              </Can>
            </>
          )}
          {row.getValue("status") === "confirmed" && (
            <ViewReciept
              salesID={row.original.id}
              businessID={row.original.business_id}
              locationID={row.original.location_id}
            />
          )}
        </div>
      )
    },
  },
]

export default function DataTable({ data = [], dispensers, business: _business, locationId }) {
  const [reversedArray, setReversedArray] = useState([])

  useEffect(() => {
    setReversedArray([...data].reverse())
  }, [data])

  const latestIdsByDispenser = useMemo(() => {
    const m = {}
    for (const s of data) {
      const did = String(s.dispenser?.id ?? s.dispenser_id)
      if (!(did in m) || Number(s.id) > Number(m[did])) {
        m[did] = s.id
      }
    }
    return m
  }, [data])

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: reversedArray,
    columns,
    meta: { latestIdsByDispenser },
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
  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            placeholder="Filter by date…"
            value={table.getColumn("sales_date")?.getFilterValue() ?? ""}
            onChange={(event) => table.getColumn("sales_date")?.setFilterValue(event.target.value)}
            className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Can capability={CAPABILITIES.SALES_ADD} locationId={locationId}>
            <AddSalesMenu dispensers={dispensers} />
          </Can>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-slate-200 shadow-sm">
                <ListFilter className="mr-1.5 h-4 w-4 text-slate-500" aria-hidden />
                Columns
                <ChevronDownIcon className="ml-1.5 h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
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
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[min(70vh,720px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm [&_tr]:border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-slate-200 hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
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
                    data-state={row.getIsSelected() && "selected"}
                    className={`border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-2.5 align-middle text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-sm text-slate-500">
                    No sales match your filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{selectedCount}</span> of{" "}
          <span className="font-medium text-slate-700">{totalRows}</span> row(s) selected
          <span className="mx-2 text-slate-300">·</span>
          Page <span className="font-medium text-slate-700">{pageIndex + 1}</span> of{" "}
          <span className="font-medium text-slate-700">{pageCount}</span>
        </p>
        <div className="flex items-center gap-2">
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
