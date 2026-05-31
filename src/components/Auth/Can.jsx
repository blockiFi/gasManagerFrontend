import usePermissions from "@/hooks/usePermissions"

/**
 * Renders children only when the user has the given capability.
 * Pass locationId for location-scoped capabilities (sales, cost, etc.).
 */
export default function Can({ capability, locationId, children, fallback = null }) {
  const { can, canForLocation } = usePermissions()

  const allowed =
    locationId != null && locationId !== ""
      ? canForLocation(capability, locationId)
      : can(capability)

  if (!allowed) return fallback
  return children
}
