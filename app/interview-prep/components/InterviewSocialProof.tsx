const TESTIMONIALS = [
  {
    stars: 5,
    text: "The glass bunker simulation made me feel like I was really there. Got my US visa first attempt!",
    name: "Ayesha K.",
    route: "Pakistan → USA",
    status: "✅ Approved",
  },
  {
    stars: 5,
    text: "Practiced 3 times before my UK interview. The officer literally asked the same questions!",
    name: "Rohan M.",
    route: "India → UK",
    status: "✅ Approved",
  },
  {
    stars: 5,
    text: "Showed my wife the 'never say this' section. We both got our Canada visas approved!",
    name: "Sara B.",
    route: "Pakistan → Canada",
    status: "✅ Approved",
  },
]

export default function InterviewSocialProof() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-3">
            🌟 Success Stories
          </span>
          <h2 className="text-3xl font-extrabold text-[#0f0c29]">Travelers Who Prepared Here</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <span key={s} className="text-amber-400 text-base">⭐</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-700 leading-relaxed mb-5 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm font-bold text-[#0f0c29]">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.route}</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA nudge */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            Join <span className="font-bold text-[#0f0c29]">225,000+</span> travelers who prepared with VisitPlane
          </p>
        </div>
      </div>
    </section>
  )
}
