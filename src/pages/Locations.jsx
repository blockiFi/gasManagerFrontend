import PCharts from "@/components/charts/PCharts"
import Addlocation from "@/components/location/Addlocation"
import Can from "@/components/Auth/Can"
import LocationOverviewCard from "@/components/location/LocationOverviewCard"
import HeaderCard from "@/components/HeaderCard"
import OverviewStats from "@/components/overview/OverviewStats"
import { CAPABILITIES } from "@/lib/permissions"
import usePermissions from "@/hooks/usePermissions"
import React, { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"
import { setActiveMenu } from "@/store/MenuSlice"
import { MapPin } from "lucide-react"

const Locations = () => {
  const business = useSelector((state) => state.authentication.business)
  const { salesData, businessUsers, locations } = useLoaderData()
  const location = useLocation()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)
  const { can } = usePermissions()
  const showDashboardMetrics = can(CAPABILITIES.VIEW_ANALYTICS)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) {
      dispatch(setActiveMenu(hit.name))
    }
  }, [location.pathname, menu, dispatch])

  const locationsById = useMemo(() => {
    const m = {}
    if (locations?.data && Array.isArray(locations.data)) {
      for (const loc of locations.data) {
        m[String(loc.id)] = loc
      }
    }
    return m
  }, [locations])

  const overviewLocations = useMemo(() => {
    if (!salesData?.success || !Array.isArray(salesData.data)) return []
    return salesData.data.map((loc) => ({
      ...loc,
      dispensers: loc.dispensers ?? locationsById[String(loc.id)]?.dispensers,
      locked: locationsById[String(loc.id)]?.locked ?? false,
    }))
  }, [salesData, locationsById])

  const { totalSales, loactionCount, totalCapacity, percentageAvailable, available, activeDispensersCount } =
    useMemo(() => {
      const totalSales =
        salesData?.data?.reduce((sum, loc) => {
          if (loc.totalSalesData && typeof loc.totalSalesData.totalSales === "number") {
            return sum + loc.totalSalesData.totalSales
          }
          return sum
        }, 0) ?? 0

      const loactionCount = locations?.data?.length ?? 0
      let totalCapacity = 0
      let available = 0
      let activeDispensersCount = 0

      if (locations?.data && Array.isArray(locations.data)) {
        locations.data.forEach((loc) => {
          if (loc.dispensers && Array.isArray(loc.dispensers)) {
            activeDispensersCount += loc.dispensers.filter((d) => d.active === 1).length
            loc.totalDispenserCapacity = loc.dispensers.reduce((sum, dispenser) => {
              if (dispenser.active === 1) {
                return sum + (Number(dispenser.capacity) || 0)
              }
              return sum
            }, 0)
            loc.tatalAvailable = loc.dispensers.reduce((sum, dispenser) => {
              if (dispenser.active === 1) {
                return sum + (Number(dispenser.current_level) || 0)
              }
              return sum
            }, 0)
          } else {
            loc.totalDispenserCapacity = 0
            loc.tatalAvailable = 0
          }
          totalCapacity += loc.totalDispenserCapacity
          available += loc.tatalAvailable
        })
      }

      let percentageAvailable = 0
      if (totalCapacity > 0) {
        percentageAvailable = Number(((available / totalCapacity) * 100).toFixed(2))
      }

      return {
        totalSales,
        loactionCount,
        totalCapacity,
        percentageAvailable,
        available: Number(available.toFixed(2)),
        activeDispensersCount,
      }
    }, [salesData, locations])

  const hasChartData = salesData?.success && overviewLocations.length > 0
  const showEmpty = salesData?.success && overviewLocations.length === 0

  return (
    <div className="flex flex-col gap-8">
      <HeaderCard name={business.name} address={business.address}>
        {businessUsers.success ? (
          <Can capability={CAPABILITIES.LOCATION_CREATE}>
            <Addlocation business_id={business.id} users={businessUsers.data} />
          </Can>
        ) : null}
      </HeaderCard>

      {showDashboardMetrics ? (
        <OverviewStats
          activeDispensersCount={activeDispensersCount}
          totalSales={totalSales}
          totalCapacity={totalCapacity}
          percentageAvailable={percentageAvailable}
          available={available}
        />
      ) : null}

      {!salesData?.success ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {salesData?.error ?? "Could not load sales data."}
        </div>
      ) : null}

      {showDashboardMetrics && hasChartData ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Total sales  @ by location</h2>
              <p className="mt-1 text-sm text-slate-500">All-time sales volume per site</p>
            </div>
            <PCharts data={overviewLocations} keyValue="totalSalesData.totalSales" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Current month sales</h2>
              <p className="mt-1 text-sm text-slate-500">This month&apos;s sales by location</p>
            </div>
            <PCharts data={overviewLocations} keyValue="currentMonthSalesData.totalSales" />
          </div>
        </div>
      ) : null}

      {showEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <MapPin className="h-7 w-7" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No locations yet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add your first location to track dispensers, sales, and inventory from this dashboard.
          </p>
          {businessUsers.success ? (
            <div className="mt-6">
              <Can capability={CAPABILITIES.LOCATION_CREATE}>
                <Addlocation business_id={business.id} users={businessUsers.data} />
              </Can>
            </div>
          ) : null}
        </div>
      ) : null}

      {!showEmpty && salesData?.success && overviewLocations.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Locations</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loactionCount} site{loactionCount === 1 ? "" : "s"}
                {showDashboardMetrics ? " · Totals and current month at a glance" : ""}
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {overviewLocations.map((loc) => (
              <LocationOverviewCard key={loc.id} location={loc} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default Locations
