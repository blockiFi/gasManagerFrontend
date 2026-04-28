import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import { Loader2, Power, PowerOff } from "lucide-react"
import { useState } from "react"
import { useSelector } from "react-redux"
import { useRevalidator } from "react-router"
import { toast } from "react-toastify"

export function isDispenserActive(d) {
  if (!d) return false
  return d.active === 1 || d.active === true || String(d.active) === "1" || d.active === "true"
}

const DispenserActiveButtons = ({ dispenser, businessId }) => {
  const token = useSelector((state) => state.authentication.token)
  const revalidator = useRevalidator()
  const [loading, setLoading] = useState(false)
  const active = isDispenserActive(dispenser)

  const setActive = async (next) => {
    if (!dispenser?.id || !businessId) return
    setLoading(true)
    try {
      const res = await axios.post(
        "api/business/update_dispenser/active",
        {
          business_id: businessId,
          dispenser_id: dispenser.id,
          active: next ? 1 : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.status === 200) {
        toast.success(res.data?.message ?? (next ? "Dispenser activated" : "Dispenser deactivated"))
        revalidator.revalidate()
      } else {
        toast.error("Could not update dispenser status")
      }
    } catch (e) {
      const msg = e.response?.data?.errors?.[0] ?? e.response?.data?.message ?? "Could not update dispenser status"
      toast.error(typeof msg === "string" ? msg : "Could not update dispenser status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-amber-200 text-amber-800 hover:bg-amber-50"
          disabled={loading}
          onClick={() => setActive(false)}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <PowerOff className="h-3.5 w-3.5" aria-hidden />}
          <span className="ml-1">Deactivate</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
          disabled={loading}
          onClick={() => setActive(true)}
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Power className="h-3.5 w-3.5" aria-hidden />}
          <span className="ml-1">Activate</span>
        </Button>
      )}
    </div>
  )
}

export default DispenserActiveButtons
