import Link from 'next/link'
import Image from 'next/image'

const STEPS = [
  {
    num: 1,
    icon: '🛂',
    title: 'Select Your Passport',
    desc: 'Choose your country of citizenship from our list of 197 supported passports. We auto-detect your location to make this even faster.',
  },
  {
    num: 2,
    icon: '🌍',
    title: 'Choose Your Destination',
    desc: 'Pick the country you plan to visit. We support all 197 countries and territories with up-to-date visa information.',
  },
  {
    num: 3,
    icon: '⚡',
    title: 'Get Instant Visa Info',
    desc: 'Instantly see whether you need a visa, what type, processing times, fees, and validity — all sourced from official embassy data.',
  },
  {
    num: 4,
    icon: '📋',
    title: 'Check Document Checklist',
    desc: 'Get a complete list of every document you need for your application — no guesswork, no surprises at the border.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0f0c29] text-white antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0f0c29]/95 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-v2.png" alt="VisitPlane" width={36} height={36} className="rounded-xl" />
            <span className="text-lg font-bold">
              <span className="text-white">Visit</span>
              <span className="text-emerald-400">Plane</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/destinations" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white transition">Explore</Link>
            <Link href="/visa-requirements" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white transition">Visa Requirements</Link>
            <Link href="/blog" className="rounded-lg px-3 py-2 text-sm text-white/55 hover:text-white transition">Blog</Link>
          </nav>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition"
          >
            Check Visa →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            ⚡ Takes 10 seconds
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-white">How </span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              VisitPlane Works
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/50">
            Visa information in 4 simple steps. No account required. Always free.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-7 transition hover:border-emerald-500/30 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-extrabold text-white shadow-lg shadow-emerald-500/30">
                    {step.num}
                  </div>
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-10 text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Ready? It takes 10 seconds.</h2>
            <p className="mt-3 text-sm text-white/70">Free for everyone. No signup. Official embassy data.</p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-bold text-emerald-700 shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition"
            >
              Check My Visa Now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
