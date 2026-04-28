import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const btnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"

export default function FinalCTA() {
  return (
    <section
      id="cta"
      className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-indigo-600 to-cyan-600 p-10 sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
          <div className="relative max-w-2xl">
            <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Run your stations on data, not gut.
            </h2>
            <p className="mt-4 text-lg text-indigo-100/95">
              Sign in to your workspace or get started and invite your team. Same app your managers already use for
              sales and supplies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className={btnClass}>
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
