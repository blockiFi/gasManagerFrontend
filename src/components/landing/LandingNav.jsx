import { Link } from "react-router-dom"
import BrandLogo from "@/components/brand/BrandLogo"

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

const buttonSecondaryClass =
  "inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

const buttonPrimaryClass =
  "inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <BrandLogo dark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          <a href="#features" className={navLinkClass}>
            Features
          </a>
          <a href="#how-it-works" className={navLinkClass}>
            How it works
          </a>
          <a href="#showcase" className={navLinkClass}>
            Product
          </a>
          <a href="#pricing" className={navLinkClass}>
            Pricing
          </a>
          <a href="#faq" className={navLinkClass}>
            FAQ
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/login" className={buttonSecondaryClass}>
            Sign in
          </Link>
          <Link to="/login" className={`${buttonPrimaryClass} hidden sm:inline-flex`}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
