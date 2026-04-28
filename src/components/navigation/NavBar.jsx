import React, { useEffect, useMemo, useRef, useState } from "react"
import { Bell, Menu, Search, Settings, LogOut, X } from "lucide-react"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import avater from "../../assets/avater.png"

const pathToCrumb = (pathname) => {
  const normalized = pathname.replace(/\/$/, "") || "/dashboard"
  if (normalized === "/dashboard") {
    return { primary: "Dashboard", secondary: "Overview" }
  }
  const rest = normalized.replace(/^\/dashboard\/?/, "")
  const segments = rest.split("/").filter(Boolean)
  const labelMap = {
    analytics: "Analytics",
    suppliers: "Suppliers",
    supplies: "Supplies",
    prices: "Prices",
    cost: "Operation Cost",
    employees: "Users",
    settings: "Settings",
    location: "Location",
  }
  const secondary =
    segments[0] === "location" && segments[1]
      ? "Location detail"
      : labelMap[segments[0]] ||
        (segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : "Overview")
  return { primary: "Dashboard", secondary }
}

const NavBar = ({ mobileMenuOpen = false, onToggleMobileMenu }) => {
  const user = useSelector((state) => state.authentication.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [openDropdown, setOpenDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const crumbs = useMemo(() => pathToCrumb(location.pathname), [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const signOut = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/"
  }

  const displayName = user?.name || "User"
  const displayEmail = user?.email || ""

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-100 lg:hidden"
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <nav className="hidden min-w-0 text-sm sm:block" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-slate-500">
            <li className="font-medium text-slate-900">{crumbs.primary}</li>
            <li className="text-slate-300" aria-hidden>
              /
            </li>
            <li className="truncate text-slate-600">{crumbs.secondary}</li>
          </ol>
        </nav>
      </div>

      <div className="relative mx-2 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search locations, sales…"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <div ref={dropdownRef} className="relative flex items-center gap-2 pl-1">
          <button
            type="button"
            onClick={() => setOpenDropdown((o) => !o)}
            className="flex items-center gap-2 rounded-lg py-1 pr-1 hover:bg-slate-50"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200">
              <img src={avater} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="max-w-[140px] truncate text-xs text-slate-500">
                {displayEmail || "Administrator"}
              </p>
            </div>
          </button>

          {openDropdown ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{displayName}</p>
                {displayEmail ? <p className="truncate text-xs text-slate-500">{displayEmail}</p> : null}
              </div>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setOpenDropdown(false)
                  navigate("/dashboard/settings")
                }}
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 text-slate-400" />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default NavBar
