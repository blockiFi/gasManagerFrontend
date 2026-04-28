import DoubleLineChart from "@/components/charts/DoubleLineChart"
import ObtionSelector from "@/components/ObtionSelector"
import AnalyticsKpiStrip from "@/components/analytic/AnalyticsKpiStrip"
import { getSalesByGroup } from "@/lib/request"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { Flame, TrendingUp, Scale } from "lucide-react"
import { toast } from "react-toastify"
import { projectedValues } from "@/lib/utils"

const METRIC_OPTIONS = [
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "kg", label: "Kg", icon: Scale },
  { id: "profit", label: "Profit", icon: TrendingUp },
  { id: "excess_kg", label: "Excess kg", icon: Flame },
  { id: "excess_profit", label: "Excess profit", icon: TrendingUp },
  { id: "total_profit", label: "Total profit", icon: TrendingUp },
]

const TIMEFRAMES = ["weekly", "monthly", "quarterly", "yearly"]

function capitalizeTf(tf) {
  if (!tf) return ""
  return tf.charAt(0).toUpperCase() + tf.slice(1).toLowerCase()
}

function metricLabel(display) {
  const map = {
    sales: "Sales amount",
    kg: "Sales volume (kg)",
    profit: "Profit",
    excess_kg: "Excess kg",
    excess_profit: "Profit from excess kg",
    total_profit: "Total profit",
  }
  return map[display] ?? "Sales amount"
}

function kpiHighlightKey(display) {
  switch (display) {
    case "sales":
      return "sales"
    case "kg":
      return "kg"
    case "profit":
    case "total_profit":
      return "profit"
    case "excess_profit":
      return "excess_profit"
    default:
      return null
  }
}

const Analytic = ({ locations }) => {
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)

  const [display, setDisplay] = useState("sales")
  const [timeframe, setTimeframe] = useState("weekly")
  const [salesDataState, setSalesDataState] = useState(() => locations.data[0]?.salesData ?? [])
  const [activeLocation, setActiveLocation] = useState(() =>
    locations.data.length > 0 ? locations.data[0] : null
  )

  const processRecord = useCallback(async (data) => {
    if (!data || data.length === 0) return []
    if (data.length === 1) {
      return [
        {
          ...data[0],
          connection: null,
          projected_ExcessKgProfit: null,
          projected_profit: null,
          projected_totalExcessKg: null,
          projected_totalProfit: null,
          projected_totalSalesAmount: null,
          projected_totalSalesKg: null,
        },
      ]
    }
    const TempData = [...data]
    const lastItem = TempData.pop()
    const projectedSales = await projectedValues(TempData)

    const newData = TempData.map((row) => ({
      ...row,
      connection: null,
      projected_ExcessKgProfit: null,
      projected_profit: null,
      projected_totalExcessKg: null,
      projected_totalProfit: null,
      projected_totalSalesAmount: null,
      projected_totalSalesKg: null,
    }))

    const proj = projectedSales?.projections
    const newLast = {
      ...lastItem,
      connection: null,
      projected_ExcessKgProfit: proj ? proj.ExcessKgProfit : null,
      projected_profit: proj ? proj.profit : null,
      projected_totalExcessKg: proj ? proj.totalExcessKg : null,
      projected_totalProfit: proj ? proj.totalProfit : null,
      projected_totalSalesAmount: proj ? proj.totalSalesAmount : null,
      projected_totalSalesKg: proj ? proj.totalSalesKg : null,
    }
    newData.push(newLast)
    return newData
  }, [])

  useEffect(() => {
    const first = locations?.data?.[0]?.salesData
    if (!first?.length) return
    ;(async () => {
      const data = await processRecord(first)
      setSalesDataState(data)
    })()
  }, [locations, processRecord])

  const handleChange = async (parameter) => {
    const tf = String(parameter).toLowerCase()
    setTimeframe(tf)

    let all = false
    let id = null

    if (activeLocation?.id === 0 || activeLocation?.id === "0") {
      all = true
      id = locations.data[0].id
    } else {
      id = activeLocation.id
    }

    const response = await getSalesByGroup(token, business.id, id, tf, all)
    if (response.success) {
      const data = await processRecord(response.data)
      setSalesDataState(data)
    } else {
      toast.error(`Could not load ${capitalizeTf(tf)} data`)
    }
  }

  const handleDisplayChange = (value) => {
    setDisplay(value)
  }

  const handleLocationChange = async (rawId) => {
    const isAll = rawId === "0" || rawId === 0 || rawId === "all"
    const tf = timeframe

    if (isAll) {
      setActiveLocation({ id: 0, name: business.name })
      const firstId = locations.data[0].id
      const response = await getSalesByGroup(token, business.id, firstId, tf, true)
      if (response.success) {
        const data = await processRecord(response.data)
        setSalesDataState(data)
      } else {
        toast.error("Could not load business-wide data")
      }
      return
    }

    const selectedLocation = locations.data.find((loc) => String(loc.id) === String(rawId))
    if (!selectedLocation) return

    setActiveLocation(selectedLocation)
    const response = await getSalesByGroup(token, business.id, selectedLocation.id, tf, false)
    if (response.success) {
      const data = await processRecord(response.data)
      setSalesDataState(data)
    } else {
      toast.error("Could not load location data")
    }
  }

  const load = async (location) => {
    const tf = timeframe
    const response = await getSalesByGroup(token, business.id, location.id, tf, true)
    if (response.success) {
      const filteredData = response.data.filter((item) => {
        const itemDate = new Date(item.group)
        const now = new Date()
        return (
          itemDate.getFullYear() !== now.getFullYear() || itemDate.getMonth() !== now.getMonth()
        )
      })
      await projectedValues(filteredData)
    }
  }

  const loadAllLocations = async () => {
    try {
      await Promise.all(locations.data.map((location) => load(location)))
      toast.success("Finished loading all locations (projections refreshed in background)")
    } catch {
      toast.error("Some locations failed to load")
    }
  }

  const chartBlock = useMemo(() => {
    const common = {
      _SalesData: salesDataState,
      xKey: "group",
    }
    switch (display) {
      case "sales":
        return (
          <DoubleLineChart
            {...common}
            y1Key="totalSalesAmount"
            projected="projected_totalSalesAmount"
            toolTipTitle="Sales: ₦"
            name="Sales amount"
          />
        )
      case "kg":
        return (
          <DoubleLineChart
            {...common}
            stroke="#db2777"
            y1Key="totalSalesKg"
            projected="projected_totalSalesKg"
            toolTipTitle="Kg: "
            name="Sales (kg)"
          />
        )
      case "profit":
        return (
          <DoubleLineChart
            {...common}
            stroke="#059669"
            y1Key="profit"
            projected="projected_profit"
            toolTipTitle="Profit: ₦"
            name="Profit"
          />
        )
      case "excess_kg":
        return (
          <DoubleLineChart
            {...common}
            y1Key="totalExcessKg"
            projected="projected_totalExcessKg"
            toolTipTitle="Excess kg: "
            name="Excess kg"
          />
        )
      case "excess_profit":
        return (
          <DoubleLineChart
            {...common}
            y1Key="ExcessKgProfit"
            projected="projected_ExcessKgProfit"
            toolTipTitle="Excess profit: ₦"
            name="Excess profit"
          />
        )
      case "total_profit":
        return (
          <DoubleLineChart
            {...common}
            y1Key="totalProfit"
            projected="projected_totalProfit"
            toolTipTitle="Total profit: ₦"
            name="Total profit"
          />
        )
      default:
        return (
          <DoubleLineChart
            {...common}
            y1Key="totalSalesAmount"
            projected="projected_totalSalesAmount"
            toolTipTitle="Sales: ₦"
            name="Sales amount"
          />
        )
    }
  }, [display, salesDataState])

  if (!activeLocation) {
    return null
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sales, volume and profit trends with projected values
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={activeLocation.id}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              <option value={0}>All locations</option>
              {locations.data.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadAllLocations()}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Load all locations
            </button>
          </div>
        </div>

        <div className="mt-5 inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => handleChange(tf)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                timeframe === tf
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {capitalizeTf(tf)}
            </button>
          ))}
        </div>
      </div>

      <ObtionSelector value={display} handleChange={handleDisplayChange} options={METRIC_OPTIONS} />

      <AnalyticsKpiStrip data={salesDataState} activeMetric={kpiHighlightKey(display)} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">{metricLabel(display)}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeLocation.name} · {capitalizeTf(timeframe)} view · Dashed connector and point show
            projection
          </p>
        </div>
        <div className="h-[380px] w-full">{chartBlock}</div>
      </div>
    </section>
  )
}

export default Analytic
