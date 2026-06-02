/* eslint-disable react/prop-types */
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
import { CheckCircle2, Loader2, RotateCcw, Tag } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"

const SetPrice = ({ location, onSuccess, triggerClassName }) => {
  const token = useSelector((state) => state.authentication.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const resetForm = () => {
    setSuccess(false)
    setError(null)
    reset()
  }

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) resetForm()
  }

  const onSubmit = async (data) => {
    setError(null)
    setLoading(true)

    const payload = {
      price: data.price,
      business_id: location.business_id,
      location_id: location.id,
    }

    try {
      const response = await axios.post("api/business/location/set_price", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 200 || response.status === 201) {
        setSuccess(true)
        onSuccess?.()
      } else {
        setError("Could not set price. Please try again.")
      }
    } catch {
      setError("Could not set price. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          className={`gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 ${triggerClassName ?? ""}`}
        >
          <Tag className="h-4 w-4" aria-hidden />
          Set price
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set selling price</DialogTitle>
          <DialogDescription>
            Update the active price for <span className="font-medium text-slate-700">{location.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="font-medium text-emerald-900">Price updated</p>
                <p className="mt-1 text-sm text-emerald-800">
                  The new selling price is now active for this location.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button type="button" onClick={resetForm} className="gap-2">
                <RotateCcw className="h-4 w-4" aria-hidden />
                Set another
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {error ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {error}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={`set-price-${location.id}`}>New price (₦)</Label>
              <Input
                id={`set-price-${location.id}`}
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder={location.active_price ? String(location.active_price) : "0.00"}
                {...register("price", { required: true, min: 0.01 })}
                className="border-slate-200"
              />
              {errors.price ? (
                <p className="text-xs text-rose-600">A valid price is required.</p>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Save price
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SetPrice
