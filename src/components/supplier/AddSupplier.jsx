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
import { Loader2, Plus, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const AddSupplier = ({ business_id }) => {
  const navigate = useNavigate()
  const location = useLocation()
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
    data.business_id = business_id
    setLoading(true)
    setError(undefined)
    try {
      const response = await axios.post("api/business/supplier/add_business_supplier", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (response.status === 200 || response.status === 201) {
        setSuccess("Supplier added successfully.")
        navigate(location.pathname, { replace: true })
      } else {
        setError("Could not add supplier. Check your data and try again.")
      }
    } catch {
      setLoading(false)
      setError("Could not add supplier. Check your data and try again.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add supplier</DialogTitle>
          <DialogDescription>
            Bank details are used for payouts and reconciliation.
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
                <Label htmlFor="add-supplier-name">Supplier name</Label>
                <Input
                  id="add-supplier-name"
                  {...register("name", { required: true })}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Name is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-supplier-address">Address</Label>
                <Input
                  id="add-supplier-address"
                  {...register("address", { required: true })}
                  aria-invalid={errors.address ? "true" : "false"}
                />
                {errors.address?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Address is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-contact-name">Contact person</Label>
                <Input
                  id="add-contact-name"
                  {...register("contact_person_name", { required: true })}
                  aria-invalid={errors.contact_person_name ? "true" : "false"}
                />
                {errors.contact_person_name?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Contact name is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-contact-phone">Phone</Label>
                <Input
                  id="add-contact-phone"
                  type="tel"
                  inputMode="numeric"
                  {...register("contact_person_number", { required: true })}
                  aria-invalid={errors.contact_person_number ? "true" : "false"}
                />
                {errors.contact_person_number?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Phone is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-bank-name">Bank name</Label>
                <Input
                  id="add-bank-name"
                  {...register("bank_name", { required: true })}
                  aria-invalid={errors.bank_name ? "true" : "false"}
                />
                {errors.bank_name?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Bank name is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-account-number">Account number</Label>
                <Input
                  id="add-account-number"
                  inputMode="numeric"
                  {...register("account_number", { required: true })}
                  aria-invalid={errors.account_number ? "true" : "false"}
                />
                {errors.account_number?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Account number is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-account-name">Account name</Label>
                <Input
                  id="add-account-name"
                  {...register("account_name", { required: true })}
                  aria-invalid={errors.account_name ? "true" : "false"}
                />
                {errors.account_name?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Account name is required
                  </p>
                )}
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save supplier
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSupplier
