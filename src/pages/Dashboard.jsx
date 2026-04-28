import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import SideBar from "@/components/navigation/SideBar"
import NavBar from "@/components/navigation/NavBar"

const Dashboard = () => {
  const [sideBarOpen, setSideBarOpen] = useState(true)

  return (
    <div className="flex min-h-screen min-w-0 bg-slate-50">
      {sideBarOpen ? (
        <div className="fixed z-20 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
          <SideBar handleClose={() => setSideBarOpen(false)} />
        </div>
      ) : null}
      <div className={`flex min-h-screen min-w-0 flex-1 flex-col ${sideBarOpen ? "lg:ml-64" : ""}`}>
        <NavBar showmenu={sideBarOpen} handleOpen={() => setSideBarOpen(true)} />
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
