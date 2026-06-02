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
import { CheckCircle2, Loader2, Plus, RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"

const AddDispenserForBusiness = ({
  business_id,
  locations = [],
  defaultLocationId = null,
  onSuccess,
  triggerClassName,
}) => {
  const token = useSelector((state) => state.authentication.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location_id: defaultLocationId ? String(defaultLocationId) : locations[0] ? String(locations[0].id) : "",
    },
  })

  useEffect(() => {
    if (defaultLocationId) {
      setValue("location_id", String(defaultLocationId))
    }
  }, [defaultLocationId, setValue])

  const resetForm = () => {
    setSuccess(false)
    setError(null)
    reset({
      location_id: defaultLocationId ? String(defaultLocationId) : locations[0] ? String(locations[0].id) : "",
      name: "",
      capacity: "",
    })
  }

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) resetForm()
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

      if (res.status === 200) {
        setSuccess(true)
        onSuccess?.()
      } else {
        setError("Could not add dispenser. Please try again.")
      }
    } catch {
      setError("Could not add dispenser. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className={`gap-2 shadow-sm ${triggerClassName ?? ""}`}>
          <Plus className="h-4 w-4" aria-hidden />
          Add dispenser
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add dispenser</DialogTitle>
          <DialogDescription>Create a new tank at one of your locations.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="font-medium text-emerald-900">Dispenser added</p>
                <p className="mt-1 text-sm text-emerald-800">The new tank is ready to configure.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={resetForm} className="gap-2">
                <RotateCcw className="h-4 w-4" aria-hidden />
                Add another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="add-disp-loc">Location</Label>
              <select
                id="add-disp-loc"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                {...register("location_id", { required: true })}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-disp-name">Name</Label>
              <Input
                id="add-disp-name"
                {...register("name", { required: true })}
                type="text"
                autoComplete="off"
                placeholder="e.g. Tank A"
                className="border-slate-200"
              />
              {errors.name ? <p className="text-xs text-rose-600">Name is required.</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-disp-cap">Capacity (kg)</Label>
              <Input
                id="add-disp-cap"
                {...register("capacity", { required: true, min: 0.01 })}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="border-slate-200"
              />
              {errors.capacity ? <p className="text-xs text-rose-600">Capacity is required.</p> : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Save dispenser
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddDispenserForBusiness
