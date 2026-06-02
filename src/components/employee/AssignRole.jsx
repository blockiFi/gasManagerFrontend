import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "react-toastify"
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
import { Label } from "@/components/ui/label"
import { Loader2, UserCog } from "lucide-react"
import { assignUserRole, getBusinessRoles, getBusinessLocations } from "@/lib/request"

export default function AssignRole({ user, businessId }) {
  const token = useSelector((state) => state.authentication.token)
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [roles, setRoles] = useState([])
  const [locations, setLocations] = useState([])
  const [roleId, setRoleId] = useState("")
  const [locationId, setLocationId] = useState("")

  const loadOptions = async () => {
    setFetching(true)
    const [rolesRes, locRes] = await Promise.all([
      getBusinessRoles(token, businessId),
      getBusinessLocations(token, businessId),
    ])
    setFetching(false)
    if (rolesRes.success) setRoles(rolesRes.data ?? [])
    else toast.error(rolesRes.error)
    if (locRes.success) setLocations(locRes.data ?? [])
  }

  const handleOpen = (isOpen) => {
    setOpen(isOpen)
    if (isOpen) {
      setRoleId("")
      setLocationId("")
      loadOptions()
    }
  }

  const handleAssign = async () => {
    if (!roleId) {
      toast.warn("Select a role.")
      return
    }
    setLoading(true)
    const payload = {
      business_id: businessId,
      role_id: Number(roleId),
    }
    if (locationId) payload.location_id = locationId

    const res = await assignUserRole(token, user.user_id, payload)
    setLoading(false)
    if (res.success) {
      toast.success(res.message ?? "Role assigned.")
      setOpen(false)
      navigate(location.pathname, { replace: true })
    } else {
      toast.error(res.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200">
          <UserCog className="mr-1.5 h-4 w-4" />
          Assign role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign role</DialogTitle>
          <DialogDescription>
            Give {user.user?.name ?? "this user"} a role. Optionally limit it to one location.
          </DialogDescription>
        </DialogHeader>
        {fetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="assign-role">Role</Label>
              <select
                id="assign-role"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">Select role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assign-location">Location scope (optional)</Label>
              <select
                id="assign-location"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">All locations (business-wide)</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={loading || fetching} onClick={handleAssign}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
