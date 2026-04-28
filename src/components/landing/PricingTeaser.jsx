import { Link } from "react-router-dom"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Starter",
    blurb: "Single location, core operations.",
    price: "Free",
    period: "to try",
    features: ["1 location", "Supplies & sales", "Tank levels", "Email support"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    blurb: "Growing networks that need depth.",
    price: "Custom",
    period: "per org / year",
    features: [
      "Unlimited locations",
      "Analytics & exports",
      "Transfers & batch history",
      "Priority support",
    ],
    cta: "Talk to us",
    highlight: true,
  },
  {
    name: "Enterprise",
    blurb: "Compliance, SSO, and SLAs.",
    price: "Custom",
    period: "contract",
    features: ["Dedicated success", "Custom integrations", "Audit logs", "Uptime SLA"],
    cta: "Contact sales",
    highlight: false,
  },
]

const btnBase =
  "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

export default function PricingTeaser() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="pricing-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Simple pricing that scales with you
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          Teaser tiers for planning conversations. We will align to your size, locations, and support needs.
        </p>

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <li
              key={t.name}
              className={
                t.highlight
                  ? "relative flex flex-col rounded-2xl border-2 border-indigo-500/50 bg-indigo-500/10 p-6 shadow-xl shadow-indigo-950/40 ring-1 ring-inset ring-indigo-500/20"
                  : "flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-inset ring-white/5"
              }
            >
              {t.highlight ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                  Popular
                </span>
              ) : null}
              <h3 className="text-lg font-semibold text-white">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.blurb}</p>
              <p className="mt-6">
                <span className="text-3xl font-bold text-white">{t.price}</span>
                <span className="ml-1 text-sm text-slate-500">{t.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                className={
                  t.highlight
                    ? `${btnBase} mt-8 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500`
                    : `${btnBase} mt-8 border border-white/15 bg-white/10 text-white hover:bg-white/20`
                }
              >
                {t.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
