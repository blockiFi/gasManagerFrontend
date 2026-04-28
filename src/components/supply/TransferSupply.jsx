import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useSelector } from "react-redux"
import { getLocationDispensers, transferSupply } from "@/lib/request"

/* eslint-disable react/prop-types */
const TransferSupply = ({ supply }) => {
  const token = useSelector((state) => state.authentication.token)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dispensers, setDispensers] = useState([])
  const [destinationId, setDestinationId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState()
  const [success, setSuccess] = useState()

  const maxAvailable = Math.max(0, Number(supply?.available_quantity ?? 0) || 0)
  const sourceDispenserId = String(supply?.dispenser_id ?? "")

  const loadDispensers = useCallback(async () => {
    if (!token || !supply?.business_id || !supply?.location_id) return
    setLoading(true)
    setError(undefined)
    try {
      const res = await getLocationDispensers(token, supply.business_id, supply.location_id)
      if (res?.success && Array.isArray(res.data)) {
        const list = res.data.filter((d) => String(d.id) !== sourceDispenserId)
        setDispensers(list)
        if (list.length) {
          setDestinationId(String(list[0].id))
        } else {
          setDestinationId("")
        }
      } else {
        setDispensers([])
        setDestinationId("")
      }
    } catch {
      setError("Could not load dispensers.")
      setDispensers([])
    } finally {
      setLoading(false)
    }
  }, [token, supply?.business_id, supply?.location_id, sourceDispenserId])

  useEffect(() => {
    if (open) {
      setQuantity(String(maxAvailable))
      setNote("")
      setSuccess(undefined)
      setError(undefined)
      loadDispensers()
    }
  }, [open, maxAvailable, loadDispensers])

  const handleTransfer = async () => {
    const qty = Math.round(Number(quantity))
    if (!Number.isFinite(qty) || qty < 1) {
      setError("Enter a valid quantity (at least 1 kg).")
      return
    }
    if (qty > maxAvailable) {
      setError("Quantity cannot exceed available supply.")
      return
    }
    if (!destinationId) {
      setError("Select a destination tank.")
      return
    }
    setSubmitting(true)
    setError(undefined)
    const payload = {
      business_id: supply.business_id,
      supply_id: supply.id,
      destination_dispenser_id: Number(destinationId),
      quantity: qty,
      note: note.trim() || undefined,
    }
    const res = await transferSupply(token, payload)
    setSubmitting(false)
    if (res.success) {
      setSuccess(res.message ?? "Transfer complete.")
      setTimeout(() => {
        setOpen(false)
        setSuccess(undefined)
        window.location.reload()
      }, 1200)
    } else {
      setError(res.error ?? "Transfer failed.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-50">
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Transfer gas to another tank</DialogTitle>
          <DialogDescription>
            Move up to {maxAvailable} kg from this supply to another dispenser at the same location. Cost is
            pro-rated; the source supply closes if you transfer all remaining stock.
          </DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="rounded-lg bg-emerald-600 px-4 py-3 text-white" role="status">
            {success}
          </p>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading dispensers…
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {dispensers.length === 0 ? (
                  <p className="text-sm text-amber-800">
                    There is no other dispenser at this location. Add a dispenser or choose another action.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="transfer-dest">Destination dispenser</Label>
                    <select
                      id="transfer-dest"
                      className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                      value={destinationId}
                      onChange={(e) => setDestinationId(e.target.value)}
                    >
                      {dispensers.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name ?? `Dispenser #${d.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="transfer-qty">Quantity (kg)</Label>
                  <Input
                    id="transfer-qty"
                    type="number"
                    min={1}
                    max={maxAvailable}
                    step={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={dispensers.length === 0}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="transfer-note">Note (optional)</Label>
                  <Textarea
                    id="transfer-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. moved to back pump"
                    className="resize-none"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleTransfer}
                    disabled={submitting || loading || dispensers.length === 0}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Transfer
                  </Button>
                </DialogFooter>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default TransferSupply
