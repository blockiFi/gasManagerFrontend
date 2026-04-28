"use client"

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
import { Loader2, RefreshCcw, Tag } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const SetPrice = ({ location }) => {
  const navigate = useNavigate()
  const url = useLocation()
  const token = useSelector((state) => state.authentication.token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState()
  const [error, setError] = useState()

  const refresh = () => {
    setSuccess(null)
    setError(undefined)
  }

  const onSubmit = async (data) => {
    data.business_id = location.business_id
    data.location_id = location.id
    setLoading(true)
    setError(undefined)
    try {
      const response = await axios.post("api/business/location/set_price", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (response.status === 200 || response.status === 201) {
        setSuccess("Price updated successfully.")
        navigate(url.pathname, { replace: true })
      } else {
        setError("Could not set price. Try again.")
      }
    } catch {
      setLoading(false)
      setError("Could not set price. Try again.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700">
          <Tag className="mr-2 h-4 w-4" />
          Set price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set price · {location.name}</DialogTitle>
          <DialogDescription>This becomes the active selling price for this location.</DialogDescription>
        </DialogHeader>
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-emerald-900">
            <p className="text-sm font-medium">{success}</p>
            <Button type="button" variant="ghost" size="icon" onClick={refresh} aria-label="Set another">
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor={`set-price-${location.id}`}>New price (₦)</Label>
              <Input
                id={`set-price-${location.id}`}
                type="number"
                inputMode="decimal"
                {...register("price", { required: true })}
                aria-invalid={errors.price ? "true" : "false"}
              />
              {errors.price?.type === "required" && (
                <p className="text-xs text-red-600" role="alert">
                  Price is required
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
