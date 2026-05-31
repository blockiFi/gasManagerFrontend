import { redirect } from "react-router-dom"
import store from "@/store/index"
import { AuthenticateUser } from "@/lib/request"
import { can, canForLocation } from "@/lib/permissions"

export async function requireRouteCapability(capabilityKey) {
  await AuthenticateUser()
  const permissions = store.getState().authentication.permissions
  if (!can(permissions, capabilityKey)) {
    return redirect("/dashboard?denied=1")
  }
  return null
}

export async function requireLocationDetailCapability(locationId) {
  await AuthenticateUser()
  const permissions = store.getState().authentication.permissions
  if (!canForLocation(permissions, "view.location_detail", locationId)) {
    return redirect("/dashboard?denied=1")
  }
  return null
}
