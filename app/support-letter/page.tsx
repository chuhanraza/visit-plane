import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import LetterBuilder from './LetterBuilder'

export default function SupportLetterPage() {
  return (
    <>
      <ToolBreadcrumb toolName="Support Letter Generator" toolEmoji="✉️" />
      <div className="bg-[#FAFAFA] text-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Visa support letter generator</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Choose a letter (cover letter, employer NOC, invitation or sponsor), fill in facts on the left, and watch it appear on the right as you type. Facts, not stories: officers read these in minutes.
        </p>

        <div className="mt-8">
          <LetterBuilder />
        </div>

        <section className="mt-14 grid gap-6 border-t border-gray-200 pt-10 md:grid-cols-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Write only what is true</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Every claim in your letter must match your documents. Officers compare dates, names and amounts with your bookings and bank statements.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Keep it to one page</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Short, formal and specific works best. The ties-to-home paragraph matters most for tourist and visit visas.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Sign it yourself</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Print the PDF and sign it by hand, or follow the embassy&apos;s rules on signatures. This tool drafts the wording only. It is not legal advice and cannot guarantee a visa.
            </p>
          </div>
        </section>

        <p className="mt-8 text-xs text-gray-500">
          Check the exact requirements on the official embassy or consulate page for your destination before you apply.
        </p>
      </main>
      </div>
    </>
  )
}
