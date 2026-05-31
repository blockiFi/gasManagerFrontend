import { useCallback } from "react"
import { useSelector } from "react-redux"
import { can, canForLocation } from "@/lib/permissions"

export default function usePermissions() {
  const permissions = useSelector((state) => state.authentication.permissions)

  const check = useCallback(
    (capabilityKey) => can(permissions, capabilityKey),
    [permissions]
  )

  const checkForLocation = useCallback(
    (capabilityKey, locationId) => canForLocation(permissions, capabilityKey, locationId),
    [permissions]
  )

  return {
    permissions,
    role: permissions?.role ?? "none",
    isOwner: permissions?.is_owner === true,
    managedLocationIds: permissions?.managed_location_ids ?? [],
    can: check,
    canForLocation: checkForLocation,
  }
}
