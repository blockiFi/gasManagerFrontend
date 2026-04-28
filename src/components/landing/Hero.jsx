import { Link } from "react-router-dom"
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import Tank from "@/components/dispenser/TankPage"

const demoDispenser = {
  name: "Pump 1",
  capacity: 5000,
  current_level: 3850,
}

const buttonPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-white/5 pb-16 pt-12 sm:pb-24 sm:pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 motion-safe:opacity-100">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:6s]" />
        <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:7s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-inset ring-white/10">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
            Operations platform for LPG &amp; retail gas
          </div>
          <h1
            id="hero-heading"
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[2.75rem] lg:leading-[1.1]"
          >
            Run every station on a{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              single dashboard
            </span>
            .
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            Live tank levels, sales, supplies, and profit across all your locations &mdash; in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" className={buttonPrimaryClass}>
              Get started
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/login" className={buttonSecondaryClass}>
              Sign in
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400/90" aria-hidden />
              <span>Role-based access for owners and managers</span>
            </div>
            <span className="hidden h-4 w-px bg-white/15 sm:block" aria-hidden />
            <span>Built for multi-site teams</span>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-950/50 ring-1 ring-inset ring-white/5 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Live preview</p>
                <p className="text-sm font-semibold text-white">{demoDispenser.name}</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                Online
              </span>
            </div>
            <div className="flex justify-center rounded-2xl bg-slate-900/40 p-4 ring-1 ring-inset ring-white/5">
              <Tank dispenser={demoDispenser} />
            </div>
            <p className="mt-4 text-center text-xs text-slate-500">
              Same tank widget you use in the app &mdash; animated fill, levels, and alerts.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
