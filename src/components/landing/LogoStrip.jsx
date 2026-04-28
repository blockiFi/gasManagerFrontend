const marks = ["Northfield Energy", "Sahel Gas Co.", "Metro LPG", "BlueFlame Retail", "Coastline Fuels"]

const stats = [
  { label: "Locations supported", value: "500+" },
  { label: "Kg tracked", value: "12M+" },
  { label: "Platform uptime", value: "99.9%" },
  { label: "Avg. setup time", value: "< 1 day" },
]

export default function LogoStrip() {
  return (
    <section
      className="border-b border-white/5 bg-slate-950 py-16 sm:py-20"
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="trust-heading" className="sr-only">
          Trust and scale
        </h2>
        <p className="text-center text-sm font-medium text-slate-400">
          Trusted by fuel retailers and LPG operators across growing station networks
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {marks.map((name) => (
            <li key={name}>
              <span className="text-sm font-semibold tracking-tight text-slate-500">{name}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <li
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center ring-1 ring-inset ring-white/5"
            >
              <p className="text-2xl font-semibold tabular-nums text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
