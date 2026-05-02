/* eslint-disable react/prop-types -- internal shell UI */
export default function NavigationProgress({ busy }) {
  return (
    <div
      className={`pointer-events-none fixed left-0 right-0 top-0 z-[100] h-1 overflow-hidden bg-slate-200/70 transition-opacity duration-300 dark:bg-slate-700/70 ${
        busy ? "opacity-100" : "opacity-0"
      }`}
      aria-busy={busy}
      aria-live="polite"
      role="progressbar"
      aria-valuetext={busy ? "Loading" : undefined}
    >
      {busy ? (
        <div className="h-full w-[38%] animate-nav-progress bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.55)]" />
      ) : null}
    </div>
  )
}
