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
import { useState } from "react"
import { Loader2 } from "lucide-react"
import axios from "@/lib/axios"
import { useSelector } from "react-redux"

const CloseSupply = ({ supply, onSuccess }) => {
  const token = useSelector((state) => state.authentication.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState()
  const [error, setError] = useState()

  const handleClose = async () => {
    setLoading(true)
    setError(undefined)
    try {
      const payload = {
        business_id: supply.business_id,
        supply_id: supply.id,
        location_id: supply.location_id,
      }
      const res = await axios.post(
        "api/business/supply/close_business_supply",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setLoading(false)
      if (res.status === 200 && res.data?.code === 200) {
        setSuccess(res.data?.message ?? "Supply closed.")
        onSuccess?.()
        setTimeout(() => {
          setOpen(false)
          setSuccess(undefined)
          if (!onSuccess) window.location.reload()
        }, 1200)
      } else {
        setError("Could not close supply.")
      }
    } catch (e) {
      setLoading(false)
      const msg =
        e?.response?.data?.errors?.[0] ??
        e?.response?.data?.message ??
        "Could not close supply."
      setError(msg)
    }
  }

  const remaining = supply.available_quantity ?? 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          Close supply
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Close supply</DialogTitle>
          <DialogDescription>
            This marks the supply batch as finished. If there is unsold quantity
            ({remaining} kg), it will be recorded as negative surplus (excess kg)
            for reporting and deducted from the current dispenser level.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="rounded-lg bg-green-600 px-4 py-3 text-white">{success}</p>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handleClose} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Close supply
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CloseSupply
