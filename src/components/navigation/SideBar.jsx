import React from "react"
import { useNavigate } from "react-router-dom"
import { X, LogOut } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { setActiveMenu } from "@/store/MenuSlice"
import { getMenuIconComponent } from "@/lib/menuIcons"
import BrandLogo from "@/components/brand/BrandLogo"

const SideBar = ({ handleClose }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const menu = useSelector((state) => state.menu.menu)
  const activeMenu = useSelector((state) => state.menu.activeMenu)
  const user = useSelector((state) => state.authentication.user)

  const routeTo = (route) => {
    dispatch(setActiveMenu(route.name))
    navigate(route.route)
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    window.location.href = "/"
  }

  const displayName = user?.name || "Account"
  const displayRole = user?.email ? "Signed in" : "Member"

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
        <BrandLogo size="md" showTagline />
        {handleClose ? (
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <p className="px-4 pb-2 pt-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">
        Overview
      </p>
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="space-y-0.5">
          {menu.map((item) => {
            const Icon = getMenuIconComponent(item.icon)
            const active = activeMenu === item.name
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => routeTo(item)}
                className={`
                  flex w-full items-center rounded-lg border-l-4 py-2.5 pl-2.5 pr-3 text-left text-sm font-medium transition-colors
                  ${
                    active
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <Icon
                  className={`mr-3 h-5 w-5 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`}
                />
                {item.name}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-semibold text-indigo-600 ring-1 ring-slate-200">
            {(displayName[0] || "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{displayRole}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default SideBar
