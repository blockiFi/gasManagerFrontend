"use client"
import { Button } from "@/components/ui/button"
import {
    CaretSortIcon,
    ChevronDownIcon,
    DotsHorizontalIcon,
  } from "@radix-ui/react-icons"
  import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
  } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useState } from "react"


export const columns = [
    {
      id: "select",
      header: "S/n",
      cell: ({ row }) => (
          <div >{row.index + 1}</div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
        header: "Name",
        id: "Name",
      accessorFn: row => row.user.name   ,
     
      cell: ({ row }) => (
        <div >{row.original.user.name} </div>
      ),
    },
    {
        accessorFn: row => row.user.email ,
        header: "Email",
        id: "Email",
        cell: ({ row }) => ( <div> {row.original.user.email}</div>
        ),
      },
      {
        accessorFn: row => row.user.created_at ,
        header: "Date",
        id: "Date",
        cell: ({ row }) => {
            var date = new Date(row.original.user.created_at);
            var formattedDate = format(date, "do MMMM, yyyy");
            return  <div>{formattedDate}</div>
        },
      },
    
      {
        accessorKey: "",
        header: "Action",
        cell: ({ row }) =>
        {
            return  <div>
                {/* <ResetPassword user={row.original} /> */}
                </div>
        }
       
      }
    
  ]
const UsersTable = ({data}) => {
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] =useState(
      []
    )
    const [columnVisibility, setColumnVisibility] =
     useState({})
    const [rowSelection, setRowSelection] =useState({})
      
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
    
      return (
        <div className="w-full">
            <div className=" flex justify-end w-full">
            <div className="flex justify-end mb-4"></div>
            </div>
          <div className="flex items-center py-4">
            <Input
              placeholder="Filter name..."
              value={(table.getColumn("Name")?.getFilterValue()) ?? ""}
              onChange={(event) =>
                table.getColumn("Name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-500 text-white">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="text-white">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                    className="bg-white"
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
             
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
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

export default UsersTable