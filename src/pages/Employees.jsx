import AddEmployee from "@/components/employee/AddEmployee"
import EmployeeTable from "@/components/table/EmployeeTable"
import HeaderCard from "@/components/HeaderCard"
import { setActiveMenu } from "@/store/MenuSlice"
import { Users } from "lucide-react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLoaderData, useLocation } from "react-router-dom"

const Employees = () => {
  const business = useSelector((state) => state.authentication.business)
  const { users } = useLoaderData()
  const location = useLocation()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  const list = users?.success && Array.isArray(users.data) ? users.data : []

  return (
    <div className="flex flex-col gap-8">
      <HeaderCard name="Team" address={business?.address}>
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <div className="flex items-start gap-2 text-left text-sm text-slate-600 sm:text-right">
            <Users className="mt-0.5 hidden h-4 w-4 shrink-0 text-slate-400 sm:block" aria-hidden />
            <span>Invite staff and manage who can access this business.</span>
          </div>
          <AddEmployee business_id={business.id} />
        </div>
      </HeaderCard>

      {!users?.success ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {users?.error ?? "Could not load users."}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-500">
            {list.length} team member{list.length === 1 ? "" : "s"} · reset passwords from the actions column
          </p>
        </div>
        <div className="p-4 sm:p-6">
          <EmployeeTable data={list} />
        </div>
      </section>
    </div>
  )
}

export default Employees
