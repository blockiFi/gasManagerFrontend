"use client"

import { useState } from "react"
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Users,
  Menu,
  Plus,
  MoreVertical,
  Search,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"

// Import for charts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Sample data for pie charts
  const totalSalesData = [
    { name: "Sauka", value: 34402946.78 },
    { name: "Sabbo Iddo", value: 18234745.3 },
  ]

  const currentMonthData = [
    { name: "Sauka", value: 2391486.42 },
    { name: "Sabbo Iddo", value: 1262754 },
  ]

  const COLORS = ["#6366f1", "#4ade80"]

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white">
        <DesktopSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-64 hidden md:block">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>SE</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Samuel Eke</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blessed Gas</h1>
              <p className="text-gray-500">Sauka Opposite Immigration Head Quarters Abuja.</p>
            </div>
            <Button className="md:w-auto w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Location
            </Button>
          </div>

          {/* Sales Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Blessed Gas Sauka</CardTitle>
                <CardDescription>Opposite cashew Market Sauka.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sales:</span>
                    <span className="font-medium">{formatCurrency(34402946.78)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total KG:</span>
                    <span className="font-medium">26,890.75</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Profit:</span>
                    <span className="font-medium">{formatCurrency(3823534.053)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M Sales</p>
                      <p className="font-medium text-sm">{formatCurrency(2391486.42)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M KG</p>
                      <p className="font-medium text-sm">2,170.99</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M Profit</p>
                      <p className="font-medium text-sm">{formatCurrency(366464.82)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Blessed Gas Sabbo Iddo</CardTitle>
                <CardDescription>Sabbo Iddo Airport Road Abuja.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Sales:</span>
                    <span className="font-medium">{formatCurrency(18234745.3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total KG:</span>
                    <span className="font-medium">14,070.68</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Profit:</span>
                    <span className="font-medium">{formatCurrency(2203436.926)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M Sales</p>
                      <p className="font-medium text-sm">{formatCurrency(1262754)}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M KG</p>
                      <p className="font-medium text-sm">1,102.88</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground">C-M Profit</p>
                      <p className="font-medium text-sm">{formatCurrency(237075.6)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={totalSalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {totalSalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {totalSalesData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Month Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentMonthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {currentMonthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  {currentMonthData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Locations Grid */}
          <h2 className="text-xl font-semibold mb-4">Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Blessed Gas Sauka", description: "Opposite cashew Market Sauka.", manager: "Samuel Eke" },
              { title: "Blessed Gas Sabbo Iddo", description: "Sabbo Iddo Airport Road Abuja.", manager: "Samuel Eke" },
              { title: "See", description: "Ddrddd", manager: "Samuel Eke" },
              { title: "Refers", description: "Cffcc", manager: "Samuel Eke" },
              { title: "Forces", description: "Hbbvcc", manager: "Samuel Eke" },
              { title: "Shani", description: "Brunei", manager: "Samuel Eke" },
            ].map((location, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{location.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mt-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{location.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">SE</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{location.manager}</p>
                      <p className="text-xs text-muted-foreground">Manager</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

function DesktopSidebar() {
  return (
    <>
      <div className="p-4 flex items-center gap-2">
        <div className="bg-white text-slate-900 h-8 w-8 rounded-md flex items-center justify-center font-bold">B</div>
        <h1 className="font-bold text-lg">DASHBOARD</h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {[
            { name: "Dashboard", icon: BarChart3, current: true },
            { name: "Home", icon: Home, current: false },
            { name: "Suppliers", icon: ShoppingCart, current: false },
            { name: "Supplies", icon: Package, current: false },
            { name: "Prices", icon: DollarSign, current: false },
            { name: "Operation Cost", icon: BarChart3, current: false },
            { name: "Users", icon: Users, current: false },
            { name: "Settings", icon: Settings, current: false },
          ].map((item) => (
            <a
              key={item.name}
              href="#"
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${item.current ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}

function MobileSidebar() {
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="p-4 flex items-center gap-2">
        <div className="bg-white text-slate-900 h-8 w-8 rounded-md flex items-center justify-center font-bold">B</div>
        <h1 className="font-bold text-lg">DASHBOARD</h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {[
            { name: "Dashboard", icon: BarChart3, current: true },
            { name: "Home", icon: Home, current: false },
            { name: "Suppliers", icon: ShoppingCart, current: false },
            { name: "Supplies", icon: Package, current: false },
            { name: "Prices", icon: DollarSign, current: false },
            { name: "Operation Cost", icon: BarChart3, current: false },
            { name: "Users", icon: Users, current: false },
            { name: "Settings", icon: Settings, current: false },
          ].map((item) => (
            <a
              key={item.name}
              href="#"
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${item.current ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
