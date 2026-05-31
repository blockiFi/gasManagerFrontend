import { ChevronDown } from "lucide-react"

const items = [
  {
    q: "Is Pump Master only for LPG?",
    a: "It is designed for retail gas and LPG operations with tank-style dispensers, supplies, and kg-based sales, but you can use it anywhere you track batches and sell by weight or volume in similar units.",
  },
  {
    q: "How does authentication work?",
    a: "You sign in with email and password. The app issues a secure API token (Passport) stored locally for your session. Unauthenticated users are sent to the sign-in page.",
  },
  {
    q: "Can I move gas between two pumps?",
    a: "Yes. Transfers pro-rate the purchase cost, update both tank levels, and can close the source supply when the full remaining quantity is moved. A new supply record is created on the destination dispenser.",
  },
  {
    q: "Who can see my data?",
    a: "Business owners and members you add can access the business. Location managers are scoped to the locations they manage. Access is enforced on every API request.",
  },
  {
    q: "Do I need new hardware?",
    a: "No special hardware is required. Pump Master runs in the browser. You record sales and supplies as you operate today, with richer reporting on top.",
  },
  {
    q: "Where is my data stored?",
    a: "Data lives in your deployment backend and database. For production, use HTTPS, strong passwords, and regular backups as you would for any business system.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Frequently asked questions
        </h2>
        <p className="mt-4 text-lg text-slate-400">Straight answers for operators evaluating Pump Master.</p>

        <div className="mt-10 space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ring-1 ring-inset ring-white/5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-white transition hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="border-t border-white/5 px-5 pb-4 pt-0 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
