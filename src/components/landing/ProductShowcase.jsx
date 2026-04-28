export default function ProductShowcase() {
  return (
    <section
      id="showcase"
      className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24"
      aria-labelledby="showcase-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="showcase-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          What you will see in the dashboard
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          A quick peek at the kind of surfaces your team uses every shift — clean numbers, not noise.
        </p>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 ring-1 ring-inset ring-white/5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">This month</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-white">₦12.4M</p>
            <p className="mt-1 text-sm text-emerald-400">+8.2% vs last month</p>
            <div className="mt-6 h-24">
              <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
                <defs>
                  <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 60 L40 45 L80 55 L120 30 L160 40 L200 25 L200 80 L0 80 Z"
                  fill="url(#spark)"
                />
                <path
                  d="M0 60 L40 45 L80 55 L120 30 L160 40 L200 25"
                  fill="none"
                  stroke="rgb(129 140 248)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-inset ring-white/5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Supplies</p>
                <p className="mt-1 text-lg font-semibold text-white">Recent batches</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                Live
              </span>
            </div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3 ring-1 ring-white/5">
                <span className="font-medium text-slate-200">Dispenser A</span>
                <span className="tabular-nums text-slate-400">2,400 kg available</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3 ring-1 ring-white/5">
                <span className="font-medium text-slate-200">Dispenser B</span>
                <span className="tabular-nums text-slate-400">1,120 kg available</span>
              </li>
              <li className="flex items-center justify-between rounded-xl bg-slate-900/50 px-4 py-3 ring-1 ring-white/5">
                <span className="font-medium text-slate-200">Transfer pending</span>
                <span className="text-indigo-300">Review</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-indigo-500/30 bg-indigo-500/5 p-6 ring-1 ring-inset ring-indigo-500/10 lg:col-span-3">
            <p className="text-sm font-medium text-indigo-200">Tip</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              Open any location to see dispensers, tank snapshots, and month-to-date analytics side by side. Drill
              into supplies for sales tied to each batch.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
