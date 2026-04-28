export default function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Connect locations",
      text: "Add stations, dispensers, and prices. Assign managers so each site sees only what matters.",
    },
    {
      n: "02",
      title: "Record supplies & sales",
      text: "Deliver batches, sell by kg, upload receipts, and watch tank levels update in real time.",
    },
    {
      n: "03",
      title: "See profit live",
      text: "Track margins by batch, month, and location. Close supplies or transfer gas without losing cost basis.",
    },
  ]

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-b border-white/5 py-20 sm:py-24"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="how-heading" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          How it works
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">
          From first login to daily operations in three steps. No heavy hardware install required.
        </p>

        <div className="relative mt-14">
          <div
            className="pointer-events-none absolute left-4 right-4 top-10 hidden h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 opacity-40 md:block"
            aria-hidden
          />
          <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-sm font-bold text-white ring-2 ring-indigo-500/50">
                {s.n}
              </div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
