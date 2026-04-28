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
import { Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const UpdateSupplier = ({ supplier }) => {
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

  const onSubmit = async (data) => {
    data.business_id = supplier.business_id
    data.supplier_id = supplier.id
    setLoading(true)
    setError(undefined)
    try {
      const response = await axios.post("api/business/supplier/update_business_supplier", data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLoading(false)
      if (response.status === 200 || response.status === 201) {
        setSuccess("Supplier updated successfully.")
        setTimeout(() => {
          navigate(location.pathname, { replace: true })
          setSuccess(null)
        }, 400)
      } else {
        setError("Could not update supplier.")
      }
    } catch {
      setLoading(false)
      setError("Could not update supplier.")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit supplier</DialogTitle>
          <DialogDescription>Update contact or bank details for {supplier.name}.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-900">{success}</p>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor={`upd-name-${supplier.id}`}>Supplier name</Label>
                <Input
                  id={`upd-name-${supplier.id}`}
                  defaultValue={supplier.name}
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
                <Label htmlFor={`upd-addr-${supplier.id}`}>Address</Label>
                <Input
                  id={`upd-addr-${supplier.id}`}
                  defaultValue={supplier.address}
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
                <Label htmlFor={`upd-cname-${supplier.id}`}>Contact person</Label>
                <Input
                  id={`upd-cname-${supplier.id}`}
                  defaultValue={supplier.contact_person_name}
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
                <Label htmlFor={`upd-cnum-${supplier.id}`}>Phone</Label>
                <Input
                  id={`upd-cnum-${supplier.id}`}
                  type="tel"
                  inputMode="numeric"
                  defaultValue={supplier.contact_person_number}
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
                <Label htmlFor={`upd-bank-${supplier.id}`}>Bank name</Label>
                <Input
                  id={`upd-bank-${supplier.id}`}
                  defaultValue={supplier.bank_name}
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
                <Label htmlFor={`upd-acctn-${supplier.id}`}>Account number</Label>
                <Input
                  id={`upd-acctn-${supplier.id}`}
                  inputMode="numeric"
                  defaultValue={supplier.account_number}
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
                <Label htmlFor={`upd-acctname-${supplier.id}`}>Account name</Label>
                <Input
                  id={`upd-acctname-${supplier.id}`}
                  defaultValue={supplier.account_name}
                  {...register("account_name", { required: true })}
                  aria-invalid={errors.account_name ? "true" : "false"}
                />
                {errors.account_name?.type === "required" && (
                  <p className="text-xs text-red-600" role="alert">
                    Account name is required
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateSupplier
