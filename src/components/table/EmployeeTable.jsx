"use client"

import ResetPassword from "@/components/employee/ResetPassword"
import AssignRole from "@/components/employee/AssignRole"
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
import { format } from "date-fns"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ListFilter, Search, X } from "lucide-react"
import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { revokeUserRole } from "@/lib/request"

const COLUMN_LABELS = {
  select: "#",
  Name: "Name",
  Email: "Email",
  Roles: "Roles",
  Date: "Joined",
  Action: "Actions",
}

function RoleBadges({ assignments = [], onRevoke, revokingId }) {
  if (!assignments.length) {
    return <span className="text-sm text-slate-400">No roles assigned</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {assignments.map((a) => (
        <span
          key={a.assignment_id}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
        >
          {a.name}
          {a.location_name ? ` · ${a.location_name}` : a.location_id ? ` · Loc #${a.location_id}` : " · All"}
          {onRevoke ? (
            <button
              type="button"
              className="rounded p-0.5 hover:bg-slate-200"
              disabled={revokingId === a.assignment_id}
              onClick={() => onRevoke(a)}
              aria-label="Remove role"
            >
              <X className="h-3 w-3" />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  )
}

// eslint-disable-next-line react/prop-types
const EmployeeTable = ({ data = [], businessId, isOwner = false }) => {
  const token = useSelector((state) => state.authentication.token)
  const navigate = useNavigate()
  const location = useLocation()
  const [revokingId, setRevokingId] = useState(null)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const handleRevoke = async (userId, assignment) => {
    if (!window.confirm(`Remove "${assignment.name}" from this user?`)) return
    setRevokingId(assignment.assignment_id)
    const res = await revokeUserRole(token, userId, assignment.assignment_id, businessId)
    setRevokingId(null)
    if (res.success) {
      toast.success(res.message ?? "Role removed.")
      navigate(location.pathname, { replace: true })
    } else {
      toast.error(res.error)
    }
  }

  const columns = useMemo(
    () => [
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
        header: "Name",
        id: "Name",
        accessorFn: (row) => row.user.name,
        cell: ({ row }) => (
          <span className="font-medium text-slate-900">{row.original.user.name}</span>
        ),
      },
      {
        accessorFn: (row) => row.user.email,
        header: "Email",
        id: "Email",
        cell: ({ row }) => <span className="text-slate-600">{row.original.user.email}</span>,
      },
      {
        id: "Roles",
        header: "Roles",
        cell: ({ row }) => (
          <RoleBadges
            assignments={row.original.role_assignments ?? []}
            onRevoke={
              isOwner
                ? (a) => handleRevoke(row.original.user_id, a)
                : null
            }
            revokingId={revokingId}
          />
        ),
      },
      {
        accessorFn: (row) => row.user.created_at,
        header: "Joined",
        id: "Date",
        cell: ({ row }) => {
          const date = new Date(row.original.user.created_at)
          const formattedDate = format(date, "do MMMM, yyyy")
          return <span className="whitespace-nowrap text-slate-700">{formattedDate}</span>
        },
      },
      {
        accessorKey: "action",
        id: "Action",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Can capability={CAPABILITIES.EMPLOYEE_MANAGE}>
              <AssignRole user={row.original} businessId={businessId} />
              <ResetPassword user={row.original} />
            </Can>
          </div>
        ),
      },
    ],
    [businessId, isOwner, revokingId, token, location.pathname, navigate]
  )

  const table = useReactTable({
    data,
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

  const nameCol = table.getColumn("Name")
  const totalRows = table.getFilteredRowModel().rows.length
  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = Math.max(1, table.getPageCount())

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            placeholder="Filter by name…"
            value={nameCol?.getFilterValue() ?? ""}
            onChange={(e) => nameCol?.setFilterValue(e.target.value)}
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50/80">
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
                  No team members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {totalRows} member{totalRows === 1 ? "" : "s"}
        </span>
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
          <span className="tabular-nums text-xs">
            Page {pageIndex + 1} of {pageCount}
          </span>
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

export default EmployeeTable
