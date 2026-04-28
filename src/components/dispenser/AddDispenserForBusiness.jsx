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
import { Loader2, Plus, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"

const AddDispenserForBusiness = ({ business_id, locations = [] }) => {
  const token = useSelector((state) => state.authentication.token)
  const navigate = useNavigate()
  const routerLocation = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { location_id: locations[0] ? String(locations[0].id) : "" },
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState()
  const [error, setError] = useState()

  const refresh = () => {
    setSuccess(null)
  }

  const onSubmit = async (data) => {
    setError(null)
    setLoading(true)
    const payload = {
      business_id,
      location_id: Number(data.location_id),
      name: data.name,
      capacity: data.capacity,
    }
    try {
      const res = await axios.post("api/business/add_dispenser", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (res.status === 200) {
        setSuccess("Dispenser added successfully.")
        navigate(routerLocation.pathname, { replace: true })
      } else {
        setError("Could not add dispenser.")
      }
    } catch (e) {
      console.log(e)
      setLoading(false)
      setError("Could not add dispenser.")
    }
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Add dispenser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add dispenser</DialogTitle>
          <DialogDescription>
            Create a new tank at a location. {error && <span className="text-rose-600">{error}</span>}
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-600 px-4 py-4 text-white">
            <p className="text-sm font-medium">{success}</p>
            <button type="button" className="rounded p-1 hover:bg-emerald-700" onClick={refresh}>
              <RefreshCcw className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-disp-loc">Location</Label>
                <select
                  id="add-disp-loc"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  {...register("location_id", { required: true })}
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={String(loc.id)}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-disp-name">Name</Label>
                <Input id="add-disp-name" {...register("name", { required: true })} type="text" autoComplete="off" />
                {errors.name?.type === "required" && (
                  <p role="alert" className="text-xs text-rose-500">
                    Name is required
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="add-disp-cap">Capacity (kg)</Label>
                <Input
                  id="add-disp-cap"
                  {...register("capacity", { required: true })}
                  type="number"
                  min="0"
                  step="0.01"
                />
                {errors.capacity?.type === "required" && (
                  <p role="alert" className="text-xs text-rose-500">
                    Capacity is required
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Add dispenser
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddDispenserForBusiness
