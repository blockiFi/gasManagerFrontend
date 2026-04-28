"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "@/lib/axios"
import { cn } from "@/lib/utils"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { Fuel, Loader2, PlusCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const selectClass = cn(
  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-50"
)

function fieldBlock(label, hint, error, children) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium text-slate-700">{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

// eslint-disable-next-line react/prop-types -- API payload `{ success, data }` from parent
const AddSales = ({ dispensers = {} }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = useSelector((state) => state.authentication.token)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  const [startDate, setStartDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const list = Array.isArray(dispensers?.data) ? dispensers.data : []
  const hasDispensers = dispensers?.success === true && list.length > 0

  const refresh = () => {
    setSuccess(null)
    setError(null)
    reset()
    setStartDate(new Date())
  }

  const onSubmit = async (data) => {
    if (!hasDispensers) return
    setError(null)
    data.sales_date = startDate
    data.business_id = list[0].business_id
    data.location_id = list[0].location_id
    setLoading(true)
    try {
      const responce = await axios.post("api/business/location/add_sales", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (responce.status) {
        setSuccess("Sale added successfully.")
        navigate(location.pathname, { replace: true })
      } else {
        setError("Could not add sale. Check the values and try again.")
      }
    } catch {
      setLoading(false)
      setError("Could not add sale. Check the values and try again.")
    }
  }

  if (!hasDispensers) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center">
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Fuel className="h-6 w-6" aria-hidden />
        </div>
        <p className="text-sm font-medium text-slate-800">No dispensers for this location</p>
        <p className="mt-1 max-w-xs text-xs text-slate-500">
          Add an active dispenser first, then you can record sales here.
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-900">{success}</p>
            <p className="mt-1 text-xs text-emerald-800/90">The list will refresh with the latest data.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refresh}
            className="shrink-0 border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Add another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {fieldBlock(
          "Dispenser",
          "Which pump does this sale belong to?",
          errors.dispenser_id?.type === "required" ? "Select a dispenser" : null,
          <select {...register("dispenser_id", { required: true })} className={selectClass}>
            {list.map((dispenser) => (
              <option value={dispenser.id} key={dispenser.id}>
                {dispenser.name}
              </option>
            ))}
          </select>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {fieldBlock(
            "Opening sales (₦)",
            null,
            errors.opening_sales?.type === "required" ? "Required" : null,
            <Input
              type="number"
              step="0.0001"
              className="border-slate-200 shadow-sm"
              {...register("opening_sales", { required: true })}
              aria-invalid={errors.opening_sales ? "true" : "false"}
            />
          )}
          {fieldBlock(
            "Closing sales (₦)",
            null,
            errors.closing_sales?.type === "required" ? "Required" : null,
            <Input
              type="number"
              step="0.0001"
              className="border-slate-200 shadow-sm"
              {...register("closing_sales", { required: true })}
              aria-invalid={errors.closing_sales ? "true" : "false"}
            />
          )}
          {fieldBlock(
            "Opening kg",
            null,
            errors.opening_kg?.type === "required" ? "Required" : null,
            <Input
              type="number"
              step="0.0001"
              className="border-slate-200 shadow-sm"
              {...register("opening_kg", { required: true })}
              aria-invalid={errors.opening_kg ? "true" : "false"}
            />
          )}
          {fieldBlock(
            "Closing kg",
            null,
            errors.closing_kg?.type === "required" ? "Required" : null,
            <Input
              type="number"
              step="0.0001"
              className="border-slate-200 shadow-sm"
              {...register("closing_kg", { required: true })}
              aria-invalid={errors.closing_kg ? "true" : "false"}
            />
          )}
        </div>

        {fieldBlock(
          "Sales date",
          "The business day this sale is for.",
          null,
          <DatePickerField
            value={startDate}
            onChange={(d) => d && setStartDate(d)}
            placeholder="Select sales date"
          />
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={loading} className="min-w-[140px] gap-2 bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <PlusCircle className="h-4 w-4" aria-hidden />}
            {loading ? "Saving…" : "Save sale"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddSales
