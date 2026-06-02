import { useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { useLoaderData, useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { setActiveMenu } from "@/store/MenuSlice"
import { createRole, deleteRole, updateRole } from "@/lib/request"
import { permissionLabel } from "@/lib/permissions"
import { RoleFormFields } from "@/components/roles/RolePermissionPicker"
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react"
import { useEffect } from "react"

export default function RolesPage() {
  const { roles } = useLoaderData()
  const business = useSelector((state) => state.authentication.business)
  const token = useSelector((state) => state.authentication.token)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const menu = useSelector((state) => state.menu.menu)

  const [list, setList] = useState(roles?.success ? roles.data ?? [] : [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [permissions, setPermissions] = useState([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const hit = menu.find((item) => item.route === location.pathname)
    if (hit) dispatch(setActiveMenu(hit.name))
  }, [location.pathname, menu, dispatch])

  useEffect(() => {
    if (roles?.success) setList(roles.data ?? [])
  }, [roles])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setDescription("")
    setPermissions([])
    setDialogOpen(true)
  }

  const openEdit = (role) => {
    setEditing(role)
    setName(role.name)
    setDescription(role.description ?? "")
    setPermissions(role.permissions ?? [])
    setDialogOpen(true)
  }

  const refresh = () => navigate(location.pathname, { replace: true })

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warn("Role name is required.")
      return
    }
    if (permissions.length === 0) {
      toast.warn("Select at least one permission.")
      return
    }
    setSaving(true)
    const payload = {
      business_id: business.id,
      name: name.trim(),
      description: description.trim() || null,
      permissions,
    }
    const res = editing
      ? await updateRole(token, editing.id, payload)
      : await createRole(token, payload)
    setSaving(false)
    if (res.success) {
      toast.success(res.message ?? "Role saved.")
      setDialogOpen(false)
      refresh()
    } else {
      toast.error(res.error)
    }
  }

  const handleDelete = async (role) => {
    if (role.is_system) {
      toast.warn("System roles cannot be deleted.")
      return
    }
    if (!window.confirm(`Delete role "${role.name}"?`)) return
    setDeletingId(role.id)
    const res = await deleteRole(token, business.id, role.id)
    setDeletingId(null)
    if (res.success) {
      toast.success(res.message ?? "Role deleted.")
      refresh()
    } else {
      toast.error(res.error)
    }
  }

  const sorted = useMemo(
    () => [...list].sort((a, b) => a.name.localeCompare(b.name)),
    [list]
  )

  if (!roles?.success) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-800">
        {roles?.error ?? "Could not load roles."}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Roles & permissions</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Create custom roles and choose exactly what each role can view and do.
              </p>
            </div>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create role
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {sorted.map((role) => (
          <article
            key={role.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{role.name}</h2>
                  {role.is_system ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      System
                    </span>
                  ) : null}
                </div>
                {role.description ? (
                  <p className="mt-1 text-sm text-slate-600">{role.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(role.permissions ?? []).map((p) => (
                    <span
                      key={p}
                      className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 ring-1 ring-indigo-100"
                    >
                      {permissionLabel(p)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(role)}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
                {!role.is_system ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    disabled={deletingId === role.id}
                    onClick={() => handleDelete(role)}
                  >
                    {deletingId === role.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit role" : "Create role"}</DialogTitle>
          </DialogHeader>
          <RoleFormFields
            name={name}
            description={description}
            permissions={permissions}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onPermissionsChange={setPermissions}
            disabled={saving}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editing ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
