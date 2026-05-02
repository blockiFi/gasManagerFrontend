import { Suspense } from "react"
import { Outlet, useNavigation } from "react-router-dom"
import NavigationProgress from "./NavigationProgress"
import RouteFallback from "./RouteFallback"

export default function AppShell() {
  const navigation = useNavigation()
  const busy = navigation.state !== "idle"

  return (
    <>
      <NavigationProgress busy={busy} />
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </>
  )
}
