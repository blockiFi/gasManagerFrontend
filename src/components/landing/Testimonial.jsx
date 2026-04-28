import { Quote } from "lucide-react"

export default function Testimonial() {
  return (
    <section className="border-b border-white/5 py-20 sm:py-24" aria-labelledby="testimonial-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 id="testimonial-heading" className="sr-only">
          Customer story
        </h2>
        <figure className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10 ring-1 ring-inset ring-white/5">
          <Quote className="h-10 w-10 text-indigo-400/80" aria-hidden />
          <blockquote className="mt-4 text-lg leading-relaxed text-slate-200 sm:text-xl">
            We went from spreadsheets and phone calls to one view of every tank and every sale. Closing the month used
            to take two days; now we have numbers the same evening.
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <div
              className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white"
              aria-hidden
            >
              AK
            </div>
            <div>
              <p className="font-semibold text-white">Amina K.</p>
              <p className="text-sm text-slate-500">Operations lead, independent LPG chain</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
