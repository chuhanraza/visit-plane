import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import LetterBuilder from './LetterBuilder'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'
import Link from 'next/link'
import { faqPage } from '@/lib/seo/schema'
import { TYPE_GUIDES, CONTENT_REVIEWED, SITE, destPath, destinationsWithPage, typePath } from '@/lib/letters/seo'
import { FaqList, JsonLd } from './_components/GuideParts'
import { corridorPath } from './_components/CorridorPage'
import { liveCorridors } from '@/lib/letters/corridors'

const FAQS = [
  { q: 'Is the visa support letter generator really free?', a: 'Yes. There is no sign-up and no payment. You fill in a form, check the live preview, and download a PDF or Word file.' },
  { q: 'Is my information stored?', a: 'The letter is built in your browser. Your answers stay on your device for the session and are not sent to our servers.' },
  { q: 'Does it work for applicants outside Pakistan?', a: 'Yes. Choose where you are applying from (Pakistan, India or another country) at the top of the form. It changes the example IDs, tax documents and currency, and the letter text follows what you enter.' },
  { q: 'Which letters can I make?', a: 'A visa cover letter, an employer NOC letter (including a version for business owners), an invitation letter from a host, and a sponsor support letter.' },
  { q: 'Will a support letter get my visa approved?', a: 'No letter can guarantee a visa. A letter explains your documents. The decision depends on the documents, your ties to home and the officer.' },
  { q: 'Does every country need a cover letter?', a: 'No. Some consulates list one, others do not. The UK and the US, for example, do not require it. Check the official page for your destination before you apply.' },
  { q: 'Can I edit the letter after I download it?', a: 'Yes. Download the Word file to edit it, or the PDF to print and sign. Change nothing after a signed NOC is stamped; print a new one instead.' },
]

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'VisitPlane support letter generator',
  url: `${SITE}/support-letter`,
  description: 'Free generator for visa cover letters, employer NOC letters, invitation letters and sponsor letters. PDF and Word download.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires a modern web browser',
  inLanguage: 'en',
  dateModified: CONTENT_REVIEWED,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: ['Visa cover letter', 'Employer NOC letter', 'Invitation letter', 'Sponsor support letter', 'PDF download', 'Word download'],
}

export default function SupportLetterPage() {
  return (
    <>
      <JsonLd data={appSchema} />
      <JsonLd data={faqPage(FAQS)} />
      <ToolBreadcrumb toolName="Support Letter Generator" toolEmoji="✉️" />
      <div className="bg-[#FAFAFA] text-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Visa support letter generator</h1>
        <p className="mt-3 max-w-2xl text-base text-gray-600">
          Choose a letter (cover letter, employer NOC, invitation or sponsor), fill in facts on the left, and watch it appear on the right as you type. Free, no sign-up. Facts, not stories: officers read these in minutes.
        </p>

        <div className="mt-8">
          <LetterBuilder />
        </div>

        <div className="mt-12">
          <BlogEmailCapture
            capturedFrom="support-letter"
            variant="inline"
            title="Get free visa updates"
            subtitle="Optional. Rule changes and checklists for the countries you apply to. The letter tool stays free either way."
          />
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

        <section className="mt-14 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Letter guides and samples</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">Worked samples, checklists and common mistakes for each letter, with versions by destination.</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TYPE_GUIDES.map((g) => (
              <div key={g.type}>
                <h3 className="text-sm font-bold text-gray-900"><Link href={typePath(g.type)} className="hover:text-emerald-800 hover:underline">{g.label}</Link></h3>
                {g.type !== 'noc' && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {destinationsWithPage(g.type).slice(0, 6).map((d) => (
                      <li key={d.slug}><Link href={destPath(g.type, d)} className="text-gray-600 hover:text-emerald-800 hover:underline">{d.name}</Link></li>
                    ))}
                    <li><Link href={typePath(g.type)} className="font-medium text-emerald-800 hover:underline">All destinations</Link></li>
                  </ul>
                )}
                {liveCorridors().some((c) => c.type === g.type) && (
                  <ul className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-sm">
                    {liveCorridors().filter((c) => c.type === g.type).map((c) => (
                      <li key={c.slug}>
                        <Link href={corridorPath(c)} className="text-gray-600 hover:text-emerald-800 hover:underline">
                          {c.h1.replace(/\s*\(applying from [^)]+\)/i, '')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Frequently asked questions</h2>
          <div className="mt-4 max-w-3xl"><FaqList faqs={FAQS} /></div>
        </section>

        <p className="mt-8 text-xs text-gray-500">
          Check the exact requirements on the official embassy or consulate page for your destination before you apply.
        </p>
      </main>
      </div>
    </>
  )
}
