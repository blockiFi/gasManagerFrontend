import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "@/lib/axios"
import { Loader2, Package, Plus, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const todayYmd = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

const selectClass =
  "flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"

const AddSupply = ({ business_id, locations, suppliers }) => {
  const token = useSelector((state) => state.authentication.token)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      purchased_at: todayYmd(),
      unlimited: false,
    },
  })
  const isUnlimited = watch("unlimited")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState()
  const [error, setError] = useState()
  const [dispensers, setDispensers] = useState([])

  const locList = locations?.data ?? []
  const supList = suppliers?.data ?? []

  useEffect(() => {
    if (locList.length > 0) {
      const first = locList[0]
      setValue("location_id", String(first.id))
      setDispensers(first.dispensers ?? [])
      if (first.dispensers?.[0]) {
        setValue("dispenser_id", String(first.dispensers[0].id))
      }
    }
  }, [locList, setValue])

  const onLocationChange = (e) => {
    const id = e.target.value
    const loc = locList.find((l) => String(l.id) === String(id))
    setDispensers(loc?.dispensers ?? [])
    if (loc?.dispensers?.[0]) {
      setValue("dispenser_id", String(loc.dispensers[0].id))
    } else {
      setValue("dispenser_id", "")
    }
  }

  const refresh = () => {
    setSuccess(null)
    setError(undefined)
  }

  const locationField = register("location_id", { required: true })

  const onSubmit = async (data) => {
    data.business_id = business_id
    data.unlimited = Boolean(data.unlimited)
    if (data.unlimited) {
      delete data.quantity
      delete data.amount
    } else {
      delete data.unit_cost
    }
    setLoading(true)
    setError(undefined)
    try {
      const response = await axios.post("api/business/supply/add_business_supply", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (response.status === 200 || response.status === 201) {
        setSuccess("Supply added successfully.")
        navigate(location.pathname, { replace: true })
      } else {
        setError("Could not add supply. Check your data and try again.")
      }
    } catch {
      setLoading(false)
      setError("Could not add supply. Check your data and try again.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add supply
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" aria-hidden />
            Add supply
          </DialogTitle>
          <DialogDescription>
            Link this purchase to a location, dispenser, and supplier.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-emerald-900">
              <p className="text-sm font-medium">{success}</p>
              <Button type="button" variant="ghost" size="icon" onClick={refresh} aria-label="Add another">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="supply-location">Location</Label>
                <select
                  id="supply-location"
                  className={selectClass}
                  {...locationField}
                  onChange={(e) => {
                    locationField.onChange(e)
                    onLocationChange(e)
                  }}
                >
                  {locList.map((loc) => (
                    <option value={loc.id} key={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                {errors.location_id?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Location is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply-dispenser">Dispenser</Label>
                <select id="supply-dispenser" className={selectClass} {...register("dispenser_id", { required: true })}>
                  {(dispensers ?? []).map((d) => (
                    <option value={d.id} key={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.dispenser_id?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Dispenser is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="supply-supplier">Supplier</Label>
                <select id="supply-supplier" className={selectClass} {...register("supplier_id", { required: true })}>
                  {supList.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {errors.supplier_id?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Supplier is required
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <input
                  id="supply-unlimited"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  {...register("unlimited")}
                />
                <Label htmlFor="supply-unlimited" className="cursor-pointer text-sm font-normal text-slate-700">
                  Unlimited supply (quantity unknown)
                </Label>
              </div>
              {!isUnlimited ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="supply-qty">Quantity (kg)</Label>
                    <Input
                      id="supply-qty"
                      type="number"
                      inputMode="decimal"
                      {...register("quantity", { required: !isUnlimited })}
                      aria-invalid={errors.quantity ? "true" : "false"}
                    />
                    {errors.quantity?.type === "required" && (
                      <p className="text-xs text-red-600" role="alert">
                        Quantity is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supply-amount">Amount paid (₦)</Label>
                    <Input
                      id="supply-amount"
                      type="number"
                      inputMode="decimal"
                      {...register("amount", { required: !isUnlimited })}
                      aria-invalid={errors.amount ? "true" : "false"}
                    />
                    {errors.amount?.type === "required" && (
                      <p className="text-xs text-red-600" role="alert">
                        Amount is required
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="supply-unit-cost">Cost price per kg (₦)</Label>
                  <Input
                    id="supply-unit-cost"
                    type="number"
                    inputMode="decimal"
                    step="any"
                    {...register("unit_cost", { required: isUnlimited })}
                    aria-invalid={errors.unit_cost ? "true" : "false"}
                  />
                  {errors.unit_cost?.type === "required" && (
                    <p className="text-xs text-red-600" role="alert">
                      Cost price per kg is required
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Total quantity and amount will be calculated from sales when this supply is closed.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="supply-purchased">Purchase date</Label>
                <Input id="supply-purchased" type="date" {...register("purchased_at", { required: true })} />
                {errors.purchased_at?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Purchase date is required
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save supply
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSupply
