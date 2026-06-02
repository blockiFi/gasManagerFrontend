/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useState } from "react"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { useForm } from "react-hook-form"
import { CheckCircle2, Loader2, Plus, RotateCcw } from "lucide-react"
import axios from "@/lib/axios"
import { useSelector } from "react-redux"

const AddCost = ({ location, onSuccess, triggerClassName }) => {
  const token = useSelector((state) => state.authentication.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [date, setDate] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const resetForm = () => {
    setSuccess(false)
    setError(null)
    setDate(null)
    reset()
  }

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) {
      resetForm()
    }
  }

  const onSubmit = async (data) => {
    setError(null)
    setLoading(true)

    const payload = {
      ...data,
      business_id: location.business_id,
      location_id: location.id,
      paid_at: date ?? new Date(),
    }

    try {
      const response = await axios.post("api/business/location/add_operational_cost", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.status === 200) {
        setSuccess(true)
        onSuccess?.()
      } else {
        setError("Could not add this cost entry. Please try again.")
      }
    } catch {
      setError("Could not add this cost entry. Please try again.")
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
          className={`gap-2 shadow-sm ${triggerClassName ?? ""}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add cost
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add operational cost</DialogTitle>
          <DialogDescription>
            Record an expense for <span className="font-medium text-slate-700">{location.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="font-medium text-emerald-900">Cost recorded</p>
                <p className="mt-1 text-sm text-emerald-800">
                  The entry has been saved to this location.
                </p>
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
              <Label htmlFor="cost-title">Title</Label>
              <Input
                id="cost-title"
                {...register("title", { required: true })}
                placeholder="e.g. Generator fuel"
                className="border-slate-200"
              />
              {errors.title ? (
                <p className="text-xs text-rose-600">Title is required.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-amount">Amount (₦)</Label>
              <Input
                id="cost-amount"
                {...register("amount", { required: true, min: 0.01 })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="border-slate-200"
              />
              {errors.amount ? (
                <p className="text-xs text-rose-600">A valid amount is required.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-description">Description</Label>
              <Textarea
                id="cost-description"
                {...register("description", { required: true })}
                placeholder="What was this expense for?"
                className="min-h-[88px] border-slate-200"
              />
              {errors.description ? (
                <p className="text-xs text-rose-600">Description is required.</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Paid date</Label>
              <DatePickerField value={date} onChange={setDate} placeholder="Select paid date" />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Save cost
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddCost
