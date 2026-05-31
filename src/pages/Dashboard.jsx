import { Suspense, useState } from "react"
import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"
import RouteFallback from "@/components/layout/RouteFallback"
import SideBar from "@/components/navigation/SideBar"
import NavBar from "@/components/navigation/NavBar"
import MiniSideBar from "@/components/navigation/MiniSideBar"
import { Link } from "react-router-dom"

const Dashboard = () => {
  const [sideBarOpen, setSideBarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const subscription = useSelector((state) => state.authentication.subscription)

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-50">
      {sideBarOpen ? (
        <div className="fixed z-20 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
          <SideBar handleClose={() => setSideBarOpen(false)} />
        </div>
      ) : null}

      <div className="lg:hidden">
        <MiniSideBar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      </div>

      <div className={`flex min-h-screen min-w-0 flex-1 flex-col ${sideBarOpen ? "lg:ml-64" : ""}`}>
        <NavBar
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        />
        {subscription?.on_trial ? (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900 lg:px-8">
            Free trial: {subscription.trial_days_left} day(s) remaining.{" "}
            <Link to="/dashboard/subscribe" className="font-semibold underline hover:text-amber-950">
              View plans
            </Link>
          </div>
        ) : null}
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
