import DispenserActiveButtons, { isDispenserActive } from "@/components/dispenser/DispenserActiveButtons"
import ViewDispenser from "@/components/dispenser/ViewDispenser"
import Can from "@/components/Auth/Can"
import { CAPABILITIES } from "@/lib/permissions"
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
import { getDispenserFillPercent } from "@/lib/dispenserLevel"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ListFilter, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

function locationNameFor(dispenser, locationById) {
  const fromRel = dispenser.location?.name ?? dispenser.Location?.name
  if (fromRel) return fromRel
  const id = String(dispenser.location_id ?? "")
  return locationById[id]?.name ?? "—"
}

const createColumns = (locationById, businessId) => [
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
    id: "name",
    accessorFn: (row) => row.name,
    header: "Name",
    cell: ({ row }) => <span className="font-medium text-slate-900">{row.getValue("name")}</span>,
  },
  {
    id: "location",
    accessorFn: (row) => locationNameFor(row, locationById),
    header: "Location",
    cell: ({ row }) => {
      const name = locationNameFor(row.original, locationById)
      const id = row.original.location_id
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-800">{name}</span>
          {id != null ? (
            <Link
              to={`/dashboard/location/${id}`}
              className="w-fit text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Open site
            </Link>
          ) : null}
        </div>
      )
    },
  },
  {
    id: "capacity",
    accessorFn: (row) => Number(row.capacity) || 0,
    header: "Capacity (kg)",
    cell: ({ row }) => (
      <span className="tabular-nums text-slate-700">{row.getValue("capacity")}</span>
    ),
  },
  {
    id: "level",
    accessorFn: (row) => Number(row.current_level) || 0,
    header: "Level (kg)",
    cell: ({ row }) => (
      <span className="tabular-nums text-slate-700">{row.getValue("level")}</span>
    ),
  },
  {
    id: "fill",
    accessorFn: (row) => getDispenserFillPercent(row.capacity, row.current_level),
    header: "Fill",
    cell: ({ row }) => {
      const pct = row.getValue("fill")
      return (
        <div className="flex min-w-[8rem] items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs tabular-nums text-slate-600">{pct}%</span>
        </div>
      )
    },
  },
  {
    id: "active",
    accessorFn: (row) => (isDispenserActive(row) ? "active" : "inactive"),
    header: "Status",
    cell: ({ row }) => {
      const a = row.getValue("active")
      return (
        <span
          className={
            a === "active"
              ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
              : "inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
          }
        >
          {a === "active" ? "Active" : "Inactive"}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
        <Can capability={CAPABILITIES.DISPENSER_MANAGE}>
          <DispenserActiveButtons dispenser={row.original} businessId={businessId} />
          <ViewDispenser dispenser={row.original} triggerVariant="outline" />
        </Can>
      </div>
    ),
    enableSorting: false,
  },
]

const COLUMN_LABELS = {
  select: "#",
  name: "Name",
  location: "Location",
  capacity: "Capacity (kg)",
  level: "Level (kg)",
  fill: "Fill",
  active: "Status",
  actions: "Actions",
}

// eslint-disable-next-line react/prop-types
const DispenserTable = ({ data = [], locations: locationsResult = {}, businessId }) => {
  const [sorting, setSorting] = useState([{ id: "name", desc: false }])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const locationById = useMemo(() => {
    const m = {}
    const list = locationsResult?.data
    if (Array.isArray(list)) {
      for (const loc of list) {
        m[String(loc.id)] = loc
      }
    }
    return m
  }, [locationsResult])

  const columns = useMemo(() => createColumns(locationById, businessId), [locationById, businessId])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase()
      if (!q) return true
      const d = row.original
      const loc = locationNameFor(d, locationById).toLowerCase()
      const name = String(d.name ?? "").toLowerCase()
      return name.includes(q) || loc.includes(q)
    },
  })

  const nameCol = table.getColumn("name")
  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              placeholder="Search by name or location…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-10 border-slate-200 bg-white pl-9 text-sm shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>
        {nameCol ? (
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Filter by name"
              value={nameCol.getFilterValue() ?? ""}
              onChange={(e) => nameCol.setFilterValue(e.target.value)}
              className="h-9 max-w-[180px] border-dashed"
            />
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
                  .filter((c) => c.getCanHide())
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      className="capitalize"
                      checked={c.getIsVisible()}
                      onCheckedChange={(v) => c.toggleVisibility(!!v)}
                    >
                      {COLUMN_LABELS[c.id] ?? c.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="max-h-[min(56vh,520px)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur-sm [&_tr]:border-slate-200">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-slate-200 hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                    className={`border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    }`}
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
                      <p className="text-sm font-medium text-slate-700">No dispensers match your filters</p>
                      <p className="text-sm text-slate-500">Try a different search term.</p>
                    </div>
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

export default DispenserTable
