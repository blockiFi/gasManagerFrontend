import { Link } from "react-router-dom"
import { ArrowLeftRight, Gauge, LineChart, MapPin, Receipt, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Gauge,
    title: "Live tank monitoring",
    body: "Animated tank levels with headroom and low-fuel alerts so you always know what is in every pump.",
  },
  {
    icon: LineChart,
    title: "Sales analytics & profit",
    body: "Monthly and period views for revenue, kg sold, margins, and excess — tied to real supply batches.",
  },
  {
    icon: MapPin,
    title: "Multi-location control",
    body: "One business, many stations. Switch locations, compare performance, and keep managers in their lane.",
  },
  {
    icon: ArrowLeftRight,
    title: "Gas transfers between tanks",
    body: "Move stock between dispensers with pro-rated cost. Source closes automatically when fully drained.",
    extra: (
      <Link
        to="/login"
        className="mt-3 inline-flex text-sm font-semibold text-indigo-400 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Open app to transfer
      </Link>
    ),
  },
  {
    icon: Receipt,
    title: "Pricing & receipts",
    body: "Location prices, sales receipts, and operational costs in one place for cleaner closing and audit trails.",
  },
  {
    icon: ShieldCheck,
    title: "Roles & access",
    body: "Owners get full scope; location managers see only what they need. API access secured with tokens.",
  },
]

export default function FeatureGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 id="features-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to run the floor
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Pump Master is built for day-to-day retail gas operations, not generic inventory spreadsheets.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <li
                key={f.title}
                className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-inset ring-white/5 transition hover:border-indigo-500/30 hover:bg-white/[0.05]"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/80 to-cyan-500/50 shadow-lg shadow-indigo-900/40">
                  <Icon className="h-5 w-5 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{f.body}</p>
                {f.extra}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
