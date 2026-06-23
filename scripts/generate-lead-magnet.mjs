// Generates the VisitPlane "Ultimate Visa Application Checklist" lead-magnet PDF.
// Run: node scripts/generate-lead-magnet.mjs  (needs pdfkit available on NODE_PATH)
// Output: public/lead-magnets/ultimate-visa-application-checklist.pdf
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

// pdfkit is resolved from a throwaway install dir (PDFKIT_BASE) so it never
// becomes a repo dependency. Falls back to local resolution if present.
const require = createRequire(process.env.PDFKIT_BASE ?? import.meta.url)
const PDFDocument = require('pdfkit')

const TEAL = '#0d9488'
const TEAL_DK = '#0f766e'
const INK = '#111827'
const GREY = '#6b7280'
const LIGHT = '#9ca3af'
const HAIRLINE = '#e5e7eb'
const BG_SOFT = '#f0fdf9'

const OUT = path.join(process.cwd(), 'public', 'lead-magnets', 'ultimate-visa-application-checklist.pdf')

const doc = new PDFDocument({ size: 'A4', margin: 54, bufferPages: true })
doc.pipe(fs.createWriteStream(OUT))

const PAGE_W = doc.page.width
const M = doc.page.margins.left
const CONTENT_W = PAGE_W - M * 2

function checkRow(label, sub) {
  const startX = M
  const boxY = doc.y + 1
  doc.lineWidth(1.2).roundedRect(startX, boxY, 12, 12, 3).stroke(TEAL)
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(10.5)
  doc.text(label, startX + 22, doc.y, { width: CONTENT_W - 22 })
  if (sub) {
    doc.fillColor(LIGHT).font('Helvetica').fontSize(8.5)
    doc.text(sub, startX + 22, doc.y + 1, { width: CONTENT_W - 22 })
  }
  doc.moveDown(0.55)
}

function sectionHeader(num, title) {
  if (doc.y > doc.page.height - 160) doc.addPage()
  doc.moveDown(0.4)
  const y = doc.y
  doc.rect(M, y, 4, 18).fill(TEAL)
  doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(13)
  doc.text(`${num}.  ${title}`, M + 14, y + 1)
  doc.moveDown(0.7)
}

function bodyNote(text) {
  doc.fillColor(GREY).font('Helvetica').fontSize(9.5)
  doc.text(text, M, doc.y, { width: CONTENT_W, lineGap: 1.5 })
  doc.moveDown(0.5)
}

// ─── COVER ───────────────────────────────────────────────────────────────────
doc.rect(0, 0, PAGE_W, doc.page.height).fill('#ffffff')
doc.rect(0, 0, PAGE_W, 230).fill(TEAL)
// Vector airplane mark (Helvetica has no ✈ glyph, so draw it)
doc.save()
doc.translate(M + 4, 80).scale(0.9)
doc.path('M2 12 L20 7 L20 10 L9 14 L9 19 L6 20 L5 15 L2 16 Z')
  .fill('#ffffff')
doc.restore()
doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26)
doc.text('VisitPlane', M + 34, 70)
doc.font('Helvetica').fontSize(11).fillColor('#d1fae5')
doc.text('Free visa intelligence for travellers', M + 34, 104)

doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(34)
doc.text('The Ultimate', M, 140)
doc.text('Visa Application Checklist', M, 178, { width: CONTENT_W })

doc.fillColor(INK).font('Helvetica').fontSize(12)
doc.text(
  'Everything you need to prepare a complete, rejection-proof visa application — the documents, the money trail, the timeline, and the mistakes that get people refused.',
  M, 270, { width: CONTENT_W, lineGap: 3 },
)

// Cover highlights
const highlights = [
  'Core documents every applicant needs',
  'Financial proof that satisfies consular officers',
  'Document lists for Tourist, Business, Student & Work visas',
  'A week-by-week application timeline',
  'The 10 mistakes that cause most rejections',
]
doc.y = 350
doc.rect(M, doc.y, CONTENT_W, 6).fill(TEAL)
doc.moveDown(1.1)
highlights.forEach((h) => {
  const yy = doc.y
  // Vector check-tick bullet (no ✓ glyph in Helvetica)
  doc.save()
  doc.lineWidth(1.8).lineCap('round')
  doc.moveTo(M + 1, yy + 7).lineTo(M + 5, yy + 11).lineTo(M + 12, yy + 3).stroke(TEAL)
  doc.restore()
  doc.fillColor(INK).font('Helvetica').fontSize(11).text(h, M + 20, yy, { width: CONTENT_W - 20 })
  doc.moveDown(0.55)
})

doc.y = doc.page.height - 120
doc.rect(M, doc.y, CONTENT_W, 56).fill(BG_SOFT)
doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(9.5)
doc.text('IMPORTANT — ALWAYS VERIFY WITH OFFICIAL SOURCES', M + 14, doc.y + 12)
doc.fillColor(GREY).font('Helvetica').fontSize(8.5)
doc.text(
  'Visa requirements change without notice. This checklist is a planning aid — confirm every requirement with the official embassy, consulate, or government visa portal before you apply.',
  M + 14, doc.y + 4, { width: CONTENT_W - 28, lineGap: 1.5 },
)

// ─── PAGE 2: CORE + FINANCIAL ────────────────────────────────────────────────
doc.addPage()
sectionHeader(1, 'Core Documents — Every Applicant')
bodyNote('These are required for almost every visa category. Prepare originals plus at least one photocopy of each.')
;[
  ['Passport', 'Valid at least 6 months beyond your return date, with 2+ blank pages'],
  ['Old / previous passports', 'Shows travel history — strengthens a genuine-traveller case'],
  ['Completed visa application form', 'Signed, dated, every field filled — no blanks (write "N/A" instead)'],
  ['Passport-size photos', 'Recent, correct dimensions & background per that country\'s spec (usually 2)'],
  ['Cover letter', 'Explains who you are, why you\'re travelling, dates, and that you will return'],
  ['Visa fee payment proof', 'Receipt or payment confirmation in the accepted method'],
].forEach(([a, b]) => checkRow(a, b))

sectionHeader(2, 'Proof of Funds & Financial Ties')
bodyNote('Consular officers reject more applications for weak financial evidence than any other reason. Show you can fund the trip and that you have reasons to come home.')
;[
  ['Bank statements (last 3–6 months)', 'Stamped/official; steady balance, no suspicious last-minute deposits'],
  ['Salary slips or proof of income', 'Last 3 months, matching the bank deposits'],
  ['Income tax returns', 'Last 1–2 years where applicable'],
  ['Employment letter / NOC', 'On company letterhead, stating role, salary, approved leave dates'],
  ['Proof of assets or property', 'Optional but strengthens ties to your home country'],
  ['Sponsor documents (if sponsored)', 'Sponsor\'s bank proof, ID, and a signed sponsorship/invitation letter'],
].forEach(([a, b]) => checkRow(a, b))

// ─── PAGE 3: TRAVEL + BY TYPE ────────────────────────────────────────────────
doc.addPage()
sectionHeader(3, 'Travel & Accommodation')
;[
  ['Round-trip flight reservation', 'A booking/itinerary — do not buy the full ticket until the visa is approved'],
  ['Hotel bookings or invitation', 'Covering your whole stay; or a host invitation letter + their ID/address proof'],
  ['Day-by-day travel itinerary', 'Realistic plan matching your booked dates and cities'],
  ['Travel medical insurance', 'Meets the destination minimum (e.g. €30,000 for Schengen)'],
].forEach(([a, b]) => checkRow(a, b))

sectionHeader(4, 'Extra Documents by Visa Type')
doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(10).text('Tourist / Visit', M); doc.moveDown(0.3)
;[
  ['Proof of leave from employer / school', ''],
  ['Relationship proof if visiting family/friends', 'Invitation + their legal status in the country'],
].forEach(([a, b]) => checkRow(a, b))

doc.moveDown(0.2)
doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(10).text('Business', M); doc.moveDown(0.3)
;[
  ['Invitation letter from host company', 'On letterhead, with dates and purpose'],
  ['Your company registration / trade licence', ''],
  ['Conference / meeting confirmation', 'If attending an event'],
].forEach(([a, b]) => checkRow(a, b))

doc.moveDown(0.2)
doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(10).text('Student', M); doc.moveDown(0.3)
;[
  ['University acceptance / enrolment letter', ''],
  ['Proof of tuition payment & living funds', ''],
  ['Academic transcripts & language test (IELTS/TOEFL)', ''],
].forEach(([a, b]) => checkRow(a, b))

doc.moveDown(0.2)
doc.fillColor(TEAL_DK).font('Helvetica-Bold').fontSize(10).text('Work', M); doc.moveDown(0.3)
;[
  ['Signed job offer / employment contract', ''],
  ['Work permit or approval from the destination authority', ''],
  ['Degree, experience letters & police clearance', ''],
].forEach(([a, b]) => checkRow(a, b))

// ─── PAGE 4: TIMELINE + MISTAKES ─────────────────────────────────────────────
doc.addPage()
sectionHeader(5, 'Application Timeline')
const timeline = [
  ['8–12 weeks before', 'Check the visa type, fee, and processing time on the official portal. Start saving the bank-balance trail.'],
  ['6 weeks before', 'Gather documents. Book an appointment if biometrics/interview is required (these slots fill fast).'],
  ['4 weeks before', 'Get insurance, flight reservation and hotel bookings. Write your cover letter and itinerary.'],
  ['3 weeks before', 'Submit the application. Keep copies of everything you hand in.'],
  ['After submission', 'Track the application. Do not buy non-refundable tickets until you hold the approved visa.'],
]
timeline.forEach(([when, what]) => {
  const yy = doc.y
  doc.fillColor(TEAL).font('Helvetica-Bold').fontSize(9.5).text(when, M, yy, { width: 120 })
  doc.fillColor(GREY).font('Helvetica').fontSize(9.5).text(what, M + 130, yy, { width: CONTENT_W - 130, lineGap: 1.5 })
  doc.moveDown(0.7)
})

sectionHeader(6, 'Top 10 Mistakes That Cause Rejection')
const mistakes = [
  'Passport expiring within 6 months of travel.',
  'Bank statement with a large unexplained deposit right before applying.',
  'Booking and paying for flights before the visa is approved.',
  'Insurance below the required coverage amount.',
  'Blank fields or inconsistent dates on the application form.',
  'No clear proof of ties to your home country (job, family, property).',
  'Itinerary that doesn\'t match the booked hotel/flight dates.',
  'Photos in the wrong size, background, or older than 6 months.',
  'Applying too late for the processing window.',
  'Using an unofficial agent site and overpaying or missing documents.',
]
mistakes.forEach((m, i) => {
  const yy = doc.y
  doc.fillColor(TEAL).font('Helvetica-Bold').fontSize(10).text(`${i + 1}.`, M, yy, { width: 20 })
  doc.fillColor(INK).font('Helvetica').fontSize(10).text(m, M + 22, yy, { width: CONTENT_W - 22, lineGap: 1.5 })
  doc.moveDown(0.45)
})

// ─── FOOTER on every page ────────────────────────────────────────────────────
const range = doc.bufferedPageRange()
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i)
  doc.page.margins.bottom = 0 // allow drawing in the footer band without auto-paging
  const fy = doc.page.height - 38
  doc.lineWidth(0.5).moveTo(M, fy).lineTo(PAGE_W - M, fy).stroke(HAIRLINE)
  doc.fillColor(LIGHT).font('Helvetica').fontSize(8)
  doc.text('© VisitPlane · visitplane.com — verify every requirement with the official embassy before applying.', M, fy + 8, { width: CONTENT_W - 60, lineBreak: false })
  if (i > 0) doc.text(`${i + 1}`, PAGE_W - M - 20, fy + 8, { width: 20, align: 'right' })
}

doc.end()
console.log('Wrote', OUT)
