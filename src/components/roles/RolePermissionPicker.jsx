import { useEffect, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PERMISSION_GROUPS, permissionLabel } from "@/lib/permissions"

export default function RolePermissionPicker({ selected = [], onChange, disabled = false }) {
  const [checked, setChecked] = useState(new Set(selected))

  useEffect(() => {
    setChecked(new Set(selected))
  }, [selected])

  const toggle = (key) => {
    if (disabled) return
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
    onChange(Array.from(next))
  }

  const toggleGroup = (keys, selectAll) => {
    if (disabled) return
    const next = new Set(checked)
    keys.forEach((key) => {
      if (selectAll) next.add(key)
      else next.delete(key)
    })
    setChecked(next)
    onChange(Array.from(next))
  }

  return (
    <div className="max-h-[min(50vh,420px)] space-y-5 overflow-y-auto pr-1">
      {PERMISSION_GROUPS.map((group) => {
        const allSelected = group.keys.every((k) => checked.has(k))
        return (
          <div key={group.label} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-900">{group.label}</p>
              <button
                type="button"
                disabled={disabled}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                onClick={() => toggleGroup(group.keys, !allSelected)}
              >
                {allSelected ? "Clear group" : "Select all"}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.keys.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200/80"
                >
                  <Checkbox
                    checked={checked.has(key)}
                    disabled={disabled}
                    onCheckedChange={() => toggle(key)}
                    className="mt-0.5"
                  />
                  <span className="text-slate-700">{permissionLabel(key)}</span>
                </label>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function RoleFormFields({ name, description, permissions, onNameChange, onDescriptionChange, onPermissionsChange, disabled }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="role-name">Role name</Label>
        <Input
          id="role-name"
          value={name}
          disabled={disabled}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Shift supervisor"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="role-description">Description</Label>
        <Input
          id="role-description"
          value={description}
          disabled={disabled}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="What can people with this role do?"
        />
      </div>
      <div>
        <Label className="mb-2 block">Permissions</Label>
        <RolePermissionPicker selected={permissions} onChange={onPermissionsChange} disabled={disabled} />
      </div>
    </div>
  )
}
