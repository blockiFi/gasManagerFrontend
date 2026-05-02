export default function RouteFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-6 py-16"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <div className="h-3 animate-pulse rounded-md bg-slate-200" />
        <div className="h-3 w-4/5 animate-pulse rounded-md bg-slate-100" />
        <div className="h-3 w-3/5 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
