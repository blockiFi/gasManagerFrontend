import { Link } from "react-router-dom"
import BrandLogo from "@/components/brand/BrandLogo"
import { BRAND_NAME } from "@/lib/brand"

const year = new Date().getFullYear()

const linkClass =
  "text-sm text-slate-500 transition hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"

export default function LandingFooter() {
  return (
    <footer className="bg-slate-950 py-16 text-slate-400" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo dark />
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Operations and analytics for modern gas retail. Built for owners and on-site teams.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#features" className={linkClass}>
                  Features
                </a>
              </li>
              <li>
                <a href="#showcase" className={linkClass}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#pricing" className={linkClass}>
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#how-it-works" className={linkClass}>
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className={linkClass}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Legal &amp; access</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="text-sm text-slate-600">Terms and privacy: configure for your org.</span>
              </li>
              <li>
                <Link to="/login" className={linkClass}>
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-slate-600">
          &copy; {year} {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
