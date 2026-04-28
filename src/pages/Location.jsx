import BarChartView from "@/components/charts/BarChartView"
import DoubleLineChart from "@/components/charts/DoubleLineChart"
import AddDispenser from "@/components/dispenser/AddDispenser"
import Dispenser from "@/components/dispenser/Dispenser"
import HeaderCard from "@/components/HeaderCard"
import LocationKPIs from "@/components/location/LocationKPIs"
import DataTable from "@/components/table/DataTable"
import { Switch } from "@/components/ui/switch"
import { getSalesByGroup } from "@/lib/request"
import { ChevronRight, MapPin } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { Link, useLoaderData, useParams } from "react-router-dom"
import { toast } from "react-toastify"

const Location = () => {
  const { id } = useParams()
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const { sales, dispensers, salesData, monthAnalytics } = useLoaderData()
  const [salesDataState, setSalesDataState] = useState(salesData.data)
  const [showAmount, setShowAmount] = useState(true)
  const [isKg, setIsKg] = useState(false)
  const [activeTab, setActiveTab] = useState("Weekly")

  const tabs = ["Weekly", "Monthly", "Quarterly", "Yearly"]

  const handleChange = async (parameter) => {
    const responce = await getSalesByGroup(token, business.id, id, parameter)
    if (responce.success) {
      toast.success(`${parameter} Sales Data loaded Succesfully`)
      setSalesDataState(responce.data)
    } else {
      toast.error(`error loading ${parameter} sales Data`)
    }
  }

  const summedData = sales.data.reduce((acc, current) => {
    const date = current.sales_date
    if (!acc[date]) {
      acc[date] = {
        sales_date: date,
        total_amount: 0,
      }
    }
    acc[date].total_amount += parseFloat(current.amount)
    return acc
  }, {})

  const result = Object.values(summedData)
  const locationName = sales.location.name

  const activeDispensers =
    dispensers.success && Array.isArray(dispensers.data)
      ? [...dispensers.data]
          .filter((d) => d.active !== 0)
          .sort((a, b) => b.current_level - a.current_level)
      : []

  return (
    <div className="flex w-full flex-col gap-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-700">
          Locations
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        <span className="inline-flex min-w-0 items-center gap-1.5 text-slate-900">
          <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
          <span className="truncate font-medium">{locationName}</span>
        </span>
      </nav>

      <HeaderCard name={locationName} address={sales.location.address}>
        <AddDispenser business_id={business.id} location_id={sales.location.id} />
      </HeaderCard>

      <LocationKPIs salesRows={sales.data} dispensers={dispensers} monthAnalytics={monthAnalytics} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Last 7 days sales</h2>
              <p className="mt-1 text-sm text-slate-500">Daily totals for this location</p>
            </div>
            <div className="px-1 sm:px-2">
              <BarChartView data={result.slice(-7)} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Location performance</h2>
                <p className="mt-1 text-sm text-slate-500">Sales amount and quantity over time</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab)
                        handleChange(tab.toLowerCase())
                      }}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        activeTab === tab
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-2 sm:justify-start">
                  <span className="text-sm font-medium text-slate-600">Amount</span>
                  <Switch
                    checked={isKg}
                    onCheckedChange={(checked) => {
                      setIsKg(checked)
                      setShowAmount(!checked)
                    }}
                    aria-label="Toggle between amount and kilograms"
                  />
                  <span className="text-sm font-medium text-slate-600">Kg</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              {showAmount ? (
                <DoubleLineChart
                  _SalesData={salesDataState}
                  xKey="group"
                  y1Key="totalSalesAmount"
                  toolTipTitle="total Sales Amount: ₦"
                  name="Sales Amount"
                />
              ) : (
                <DoubleLineChart
                  stroke="#d81b60"
                  _SalesData={salesDataState}
                  xKey="group"
                  y1Key="totalSalesKg"
                  toolTipTitle="total Kg Quantity: "
                  name="Sales KG Quantity"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Dispensers</h2>
              <p className="mt-1 text-sm text-slate-500">Live tank snapshots</p>
            </div>
          </div>
          {activeDispensers.length > 0 ? (
            activeDispensers.map((dispenser) => <Dispenser dispenser={dispenser} key={dispenser.id} />)
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
              No active dispensers for this location.
            </div>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Sales records</h2>
          <p className="mt-1 text-sm text-slate-500">
            All recorded sales for {locationName}
            <span className="text-slate-400"> · </span>
            <span className="font-medium tabular-nums text-slate-600">{sales.data?.length ?? 0}</span>
            <span className="text-slate-500"> {sales.data?.length === 1 ? "entry" : "entries"}</span>
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <DataTable data={sales.data} dispensers={dispensers} business={business} />
        </div>
      </section>
    </div>
  )
}

export default Location
