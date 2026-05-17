import { TIPS } from '../data'

export default function InterviewTips() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-3">
            🔑 Officer Secrets
          </span>
          <h2 className="text-3xl font-extrabold text-[#0f0c29] mb-2">Before You Enter The Room</h2>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
            Top officers reveal what they really look for
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="relative rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden">
              {/* Teal left accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-l-2xl" />
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tip.icon}</div>
              <h3 className="text-sm font-bold text-[#0f0c29] mb-1.5">{tip.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{tip.body}</p>
            </div>
          ))}

          {/* 5th card spans full width on sm */}
          <div className="relative rounded-2xl border border-teal-100 bg-teal-50 px-6 py-5 shadow-sm sm:col-span-2 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-l-2xl" />
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-sm font-bold text-[#0f0c29] mb-1.5">STAR Method Answers</h3>
            <p className="text-sm text-teal-700 leading-relaxed">
              <strong>Situation → Task → Action → Result.</strong> Short, specific, honest answers always win. Officers have heard every lie — authenticity cuts through.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
