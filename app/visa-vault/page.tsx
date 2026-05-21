'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── SEO Metadata (exported separately for Next.js) ──────────────────────────
// See: app/visa-vault/metadata.ts

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileData {
  // Personal
  fullName: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  nationality: string
  placeOfBirth: string
  religion: string
  maritalStatus: string
  // Passport
  passportNumber: string
  passportIssueDate: string
  passportExpiryDate: string
  passportIssueCountry: string
  passportIssueAuthority: string
  // Contact
  email: string
  phone: string
  whatsapp: string
  address: string
  city: string
  state: string
  postalCode: string
  countryOfResidence: string
  // Professional
  occupation: string
  employer: string
  companyAddress: string
  monthlyIncome: string
  employmentStatus: string
  // Travel
  countriesVisited: string[]
  hasRejection: string
  rejectionDetails: string
  // Emergency
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  emergencyAddress: string
  // Meta
  savedAt: string
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const VAULT_KEY = 'visitplane_vault'

const saveProfile = (data: ProfileData) => {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))))
  localStorage.setItem(VAULT_KEY, encoded)
}

const loadProfile = (): ProfileData | null => {
  const stored = localStorage.getItem(VAULT_KEY)
  if (!stored) return null
  try {
    return JSON.parse(decodeURIComponent(escape(atob(stored))))
  } catch {
    try { return JSON.parse(atob(stored)) } catch { return null }
  }
}

const hasVault = () => !!localStorage.getItem(VAULT_KEY)

// ─── Constants ────────────────────────────────────────────────────────────────
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Brazil',
  'Bulgaria','Cambodia','Cameroon','Canada','Chile','China','Colombia',
  'Croatia','Cuba','Czech Republic','Denmark','Ecuador','Egypt','Ethiopia',
  'Finland','France','Georgia','Germany','Ghana','Greece','Hungary','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Japan','Jordan',
  'Kazakhstan','Kenya','Kuwait','Lebanon','Libya','Malaysia','Mexico',
  'Morocco','Nepal','Netherlands','New Zealand','Nigeria','Norway','Oman',
  'Pakistan','Palestine','Panama','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia','Singapore',
  'Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden',
  'Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia','Turkey',
  'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uzbekistan','Venezuela','Vietnam','Yemen','Zimbabwe',
]

const NATIONALITY_FLAGS: Record<string, string> = {
  'Pakistan':'🇵🇰','India':'🇮🇳','Bangladesh':'🇧🇩','Nigeria':'🇳🇬',
  'United States':'🇺🇸','United Kingdom':'🇬🇧','Saudi Arabia':'🇸🇦',
  'United Arab Emirates':'🇦🇪','Germany':'🇩🇪','France':'🇫🇷',
  'Canada':'🇨🇦','Australia':'🇦🇺','Japan':'🇯🇵','China':'🇨🇳',
  'Egypt':'🇪🇬','Turkey':'🇹🇷','Indonesia':'🇮🇩','Philippines':'🇵🇭',
  'Malaysia':'🇲🇾','South Africa':'🇿🇦','Kenya':'🇰🇪','Ghana':'🇬🇭',
  'Morocco':'🇲🇦','Iran':'🇮🇷','Iraq':'🇮🇶','Afghanistan':'🇦🇫',
  'Sri Lanka':'🇱🇰','Nepal':'🇳🇵','Brazil':'🇧🇷','Mexico':'🇲🇽',
  'Argentina':'🇦🇷','Italy':'🇮🇹','Spain':'🇪🇸','Netherlands':'🇳🇱',
  'Sweden':'🇸🇪','Norway':'🇳🇴','Denmark':'🇩🇰','Finland':'🇫🇮',
  'Poland':'🇵🇱','Russia':'🇷🇺','Ukraine':'🇺🇦','Vietnam':'🇻🇳',
  'Thailand':'🇹🇭','Singapore':'🇸🇬','South Korea':'🇰🇷','Qatar':'🇶🇦',
  'Kuwait':'🇰🇼','Bahrain':'🇧🇭','Oman':'🇴🇲','Jordan':'🇯🇴',
  'Algeria':'🇩🇿','Tunisia':'🇹🇳','Libya':'🇱🇾','Sudan':'🇸🇩',
  'Ethiopia':'🇪🇹','Somalia':'🇸🇴','Tanzania':'🇹🇿','Uganda':'🇺🇬',
  'Ireland':'🇮🇪','Israel':'🇮🇱','Portugal':'🇵🇹','Greece':'🇬🇷',
  'Romania':'🇷🇴','Bulgaria':'🇧🇬','Czech Republic':'🇨🇿','Hungary':'🇭🇺',
  'Serbia':'🇷🇸','Croatia':'🇭🇷','New Zealand':'🇳🇿','Austria':'🇦🇹',
  'Belgium':'🇧🇪','Switzerland':'🇨🇭','Venezuela':'🇻🇪','Colombia':'🇨🇴',
  'Peru':'🇵🇪','Chile':'🇨🇱','Ecuador':'🇪🇨',
}

const VISA_CARDS = [
  { flag:'🇸🇦', country:'Saudi Arabia',   type:'Work Visa',       href:'/checklist/saudi-arabia'   },
  { flag:'🇦🇪', country:'UAE',             type:'Tourist/Work Visa', href:'/checklist/uae'           },
  { flag:'🇬🇧', country:'United Kingdom', type:'Tourist Visa',    href:'/checklist/united-kingdom' },
  { flag:'🇺🇸', country:'USA',             type:'B1/B2 Visa',      href:'/checklist/usa'            },
  { flag:'🇩🇪', country:'Schengen',        type:'Tourist Visa',    href:'/checklist/germany'        },
  { flag:'🇨🇦', country:'Canada',          type:'Tourist Visa',    href:'/checklist/canada'         },
  { flag:'🇦🇺', country:'Australia',       type:'Tourist Visa',    href:'/checklist/australia'      },
  { flag:'🇯🇵', country:'Japan',           type:'Tourist Visa',    href:'/checklist/japan'          },
]

const DEFAULT_PROFILE: ProfileData = {
  fullName:'', firstName:'', lastName:'',
  dateOfBirth:'', gender:'', nationality:'', placeOfBirth:'', religion:'', maritalStatus:'',
  passportNumber:'', passportIssueDate:'', passportExpiryDate:'',
  passportIssueCountry:'', passportIssueAuthority:'',
  email:'', phone:'', whatsapp:'', address:'', city:'', state:'', postalCode:'', countryOfResidence:'',
  occupation:'', employer:'', companyAddress:'', monthlyIncome:'', employmentStatus:'',
  countriesVisited:[], hasRejection:'No', rejectionDetails:'',
  emergencyName:'', emergencyRelationship:'', emergencyPhone:'', emergencyAddress:'',
  savedAt:'',
}

const STEPS = [
  { num:1, label:'Personal',     icon:'👤' },
  { num:2, label:'Passport',     icon:'🛂' },
  { num:3, label:'Contact',      icon:'📱' },
  { num:4, label:'Professional', icon:'💼' },
  { num:5, label:'Travel',       icon:'✈️' },
  { num:6, label:'Emergency',    icon:'🆘' },
]

// ─── Reusable field wrapper ───────────────────────────────────────────────────
const Field = ({ label, required=false, children }: { label:string; required?:boolean; children:React.ReactNode }) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
      {label}{required && <span className="ml-1 text-red-400">*</span>}
    </label>
    {children}
  </div>
)

const iCls = "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 transition focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 placeholder:text-gray-300"
const sCls = "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-800 transition focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20 appearance-none cursor-pointer"

// ─── Security Section ─────────────────────────────────────────────────────────
function SecuritySection() {
  const items = [
    { icon:'🖥️', title:'Stored only on YOUR device', desc:"We never send your data to any server. It lives in your browser's localStorage." },
    { icon:'🔑', title:'Base64 encoded storage',     desc:'Your data is encoded before saving — protected from casual snooping.' },
    { icon:'🗑️', title:'Clear anytime',               desc:'Delete your entire vault with a single click. Gone instantly, no trace.' },
    { icon:'👤', title:'No account needed',           desc:'Completely anonymous — no signup, no email, no tracking.' },
  ]
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#0f0c29]">🔐 How We Protect Your Data</h2>
          <p className="mt-2 text-sm text-gray-500">Your privacy is non-negotiable</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-teal-100 bg-teal-50/40 p-5">
              <div className="mb-3 text-2xl">{icon}</div>
              <p className="mb-1 text-sm font-bold text-[#0f0c29]">{title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Auto-Fill Modal ──────────────────────────────────────────────────────────
function AutoFillModal({ visa, profile, onClose }: {
  visa: typeof VISA_CARDS[0]
  profile: ProfileData
  onClose: () => void
}) {
  const [travelPurpose, setTravelPurpose]       = useState('')
  const [arrivalDate, setArrivalDate]           = useState('')
  const [departureDate, setDepartureDate]       = useState('')
  const [accommodation, setAccommodation]       = useState('')
  const [sponsorName, setSponsorName]           = useState('')
  const [bankBalance, setBankBalance]           = useState('')
  const [copied, setCopied] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const vaultField = (value: string) => (
    <div className="rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-sm font-medium text-teal-800">
      {value || '—'} <span className="ml-1 text-[10px] font-normal text-teal-500">✅ from vault</span>
    </div>
  )

  const copyAll = () => {
    const text = [
      `=== ${visa.flag} ${visa.country} — ${visa.type} ===`,
      ``,
      `PERSONAL DETAILS`,
      `Full Name: ${profile.fullName}`,
      `Date of Birth: ${profile.dateOfBirth}`,
      `Gender: ${profile.gender}`,
      `Nationality: ${profile.nationality}`,
      `Place of Birth: ${profile.placeOfBirth}`,
      `Marital Status: ${profile.maritalStatus}`,
      ``,
      `PASSPORT`,
      `Passport Number: ${profile.passportNumber}`,
      `Issue Date: ${profile.passportIssueDate}`,
      `Expiry Date: ${profile.passportExpiryDate}`,
      `Issue Country: ${profile.passportIssueCountry}`,
      `Issue Authority: ${profile.passportIssueAuthority}`,
      ``,
      `CONTACT`,
      `Email: ${profile.email}`,
      `Phone: ${profile.phone}`,
      `Address: ${profile.address}, ${profile.city}, ${profile.state} ${profile.postalCode}`,
      `Country of Residence: ${profile.countryOfResidence}`,
      ``,
      `PROFESSIONAL`,
      `Occupation: ${profile.occupation}`,
      `Employer: ${profile.employer}`,
      `Employment Status: ${profile.employmentStatus}`,
      ``,
      `TRAVEL DETAILS`,
      `Purpose: ${travelPurpose}`,
      `Arrival Date: ${arrivalDate}`,
      `Departure Date: ${departureDate}`,
      `Accommodation: ${accommodation}`,
      `Sponsor: ${sponsorName}`,
      `Bank Balance: ${bankBalance}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPDF = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden" ref={printRef}>
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{visa.flag}</span>
                <div>
                  <h2 className="text-lg font-bold text-white">{visa.country} — {visa.type}</h2>
                  <p className="text-teal-100 text-xs">Auto-filled from your vault • Complete the remaining fields</p>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none font-light">×</button>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full bg-teal-600/50 px-3 py-1 text-[10px] font-bold text-teal-100">🟢 Teal = From Vault</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white">⬜ White = Fill In</span>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Personal */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">👤 Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Full Name</label>{vaultField(profile.fullName)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Date of Birth</label>{vaultField(profile.dateOfBirth)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Gender</label>{vaultField(profile.gender)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Nationality</label>{vaultField(profile.nationality)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Place of Birth</label>{vaultField(profile.placeOfBirth)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Marital Status</label>{vaultField(profile.maritalStatus)}</div>
            </div>
          </div>

          {/* Passport */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">🛂 Passport Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Passport Number</label>{vaultField(profile.passportNumber)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Issue Date</label>{vaultField(profile.passportIssueDate)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Expiry Date</label>{vaultField(profile.passportExpiryDate)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Issue Country</label>{vaultField(profile.passportIssueCountry)}</div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-600">📱 Contact Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Email</label>{vaultField(profile.email)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Phone</label>{vaultField(profile.phone)}</div>
              <div className="col-span-2"><label className="mb-1 block text-[11px] font-semibold text-gray-500">Address</label>{vaultField(`${profile.address}, ${profile.city}, ${profile.state} ${profile.postalCode}`.replace(/^,\s*|,\s*$/, '').replace(/,\s*,/g,','))}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Country of Residence</label>{vaultField(profile.countryOfResidence)}</div>
              <div><label className="mb-1 block text-[11px] font-semibold text-gray-500">Occupation</label>{vaultField(profile.occupation)}</div>
            </div>
          </div>

          {/* Travel Details — user fills */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">✈️ Travel Details (Fill In)</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purpose of Travel">
                <input value={travelPurpose} onChange={e=>setTravelPurpose(e.target.value)} placeholder="Tourism / Business / Work..." className={iCls} />
              </Field>
              <Field label="Arrival Date">
                <input type="date" value={arrivalDate} onChange={e=>setArrivalDate(e.target.value)} className={iCls} />
              </Field>
              <Field label="Departure Date">
                <input type="date" value={departureDate} onChange={e=>setDepartureDate(e.target.value)} className={iCls} />
              </Field>
              <Field label="Accommodation (Hotel / Address)">
                <input value={accommodation} onChange={e=>setAccommodation(e.target.value)} placeholder="Hotel name or address" className={iCls} />
              </Field>
              <Field label="Sponsor / Inviting Party">
                <input value={sponsorName} onChange={e=>setSponsorName(e.target.value)} placeholder="Name (if applicable)" className={iCls} />
              </Field>
              <Field label="Bank Balance (Approx.)">
                <input value={bankBalance} onChange={e=>setBankBalance(e.target.value)} placeholder="e.g. $5,000" className={iCls} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-wrap gap-3">
          <button onClick={copyAll} className="flex-1 rounded-xl bg-teal-500 py-2.5 text-sm font-bold text-white transition hover:bg-teal-600">
            {copied ? '✅ Copied!' : '📋 Copy All Data'}
          </button>
          <button onClick={downloadPDF} className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
            📄 Print / Save PDF
          </button>
          <Link
            href={visa.href}
            className="flex-1 rounded-xl border border-indigo-200 bg-white py-2.5 text-center text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            📋 Full Checklist →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Profile Form Section ─────────────────────────────────────────────────────
function ProfileFormSection({
  profile, update, step, setStep, onSave, saved,
}: {
  profile: ProfileData
  update: (f: keyof ProfileData, v: string | string[]) => void
  step: number
  setStep: (n: number) => void
  onSave: () => void
  saved: boolean
}) {
  const toggleCountry = (c: string) => {
    const visited = profile.countriesVisited
    update('countriesVisited', visited.includes(c) ? visited.filter(x => x !== c) : [...visited, c])
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-[#0f0c29]">📋 Create Your Vault Profile</h2>
          <span className="text-sm font-semibold text-gray-400">Step {step} of 6</span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className="flex-1 group relative"
            >
              <div className={`h-2 rounded-full transition-all ${step >= s.num ? 'bg-teal-500' : 'bg-gray-200'}`} />
              <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap hidden sm:block ${step === s.num ? 'text-teal-600' : 'text-gray-400'}`}>
                {s.icon} {s.label}
              </span>
            </button>
          ))}
        </div>
        <div className="h-6 sm:h-8" />
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className={`px-6 py-4 bg-gradient-to-r ${
          step === 1 ? 'from-teal-500 to-cyan-500' :
          step === 2 ? 'from-indigo-500 to-blue-500' :
          step === 3 ? 'from-purple-500 to-violet-500' :
          step === 4 ? 'from-orange-500 to-amber-500' :
          step === 5 ? 'from-sky-500 to-cyan-600' :
          'from-red-500 to-rose-500'
        }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">
              {STEPS[step - 1].icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Passport Information'}
                {step === 3 && 'Contact Details'}
                {step === 4 && 'Professional Details'}
                {step === 5 && 'Travel History'}
                {step === 6 && 'Emergency Contact'}
              </h3>
              <p className="text-white/70 text-xs">
                {step === 1 && 'As it appears in your passport'}
                {step === 2 && 'Your passport details'}
                {step === 3 && 'How to reach you'}
                {step === 4 && 'Work & employment info'}
                {step === 5 && 'Countries visited & visa history'}
                {step === 6 && 'Someone to contact in an emergency'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* STEP 1 — Personal */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First Name" required>
                  <input value={profile.firstName} onChange={e => update('firstName', e.target.value)} placeholder="e.g. Muhammad" className={iCls} />
                </Field>
                <Field label="Last Name" required>
                  <input value={profile.lastName} onChange={e => update('lastName', e.target.value)} placeholder="e.g. Ahmed" className={iCls} />
                </Field>
              </div>
              <Field label="Full Name (as in passport)" required>
                <input value={profile.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Auto-filled from above" className={iCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date of Birth" required>
                  <input type="date" value={profile.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className={iCls} />
                </Field>
                <Field label="Gender" required>
                  <select value={profile.gender} onChange={e => update('gender', e.target.value)} className={sCls}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nationality" required>
                  <select value={profile.nationality} onChange={e => update('nationality', e.target.value)} className={sCls}>
                    <option value="">Select nationality</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Place of Birth">
                  <input value={profile.placeOfBirth} onChange={e => update('placeOfBirth', e.target.value)} placeholder="City, Country" className={iCls} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Religion (optional)">
                  <select value={profile.religion} onChange={e => update('religion', e.target.value)} className={sCls}>
                    <option value="">Select (optional)</option>
                    <option>Islam</option>
                    <option>Christianity</option>
                    <option>Hinduism</option>
                    <option>Buddhism</option>
                    <option>Judaism</option>
                    <option>Sikhism</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="Marital Status">
                  <select value={profile.maritalStatus} onChange={e => update('maritalStatus', e.target.value)} className={sCls}>
                    <option value="">Select status</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* STEP 2 — Passport */}
          {step === 2 && (
            <>
              <Field label="Passport Number" required>
                <input value={profile.passportNumber} onChange={e => update('passportNumber', e.target.value.toUpperCase())} placeholder="e.g. AB1234567" className={iCls} style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Issue Date" required>
                  <input type="date" value={profile.passportIssueDate} onChange={e => update('passportIssueDate', e.target.value)} className={iCls} />
                </Field>
                <Field label="Expiry Date" required>
                  <input type="date" value={profile.passportExpiryDate} onChange={e => update('passportExpiryDate', e.target.value)} className={iCls} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Issue Country">
                  <select value={profile.passportIssueCountry} onChange={e => update('passportIssueCountry', e.target.value)} className={sCls}>
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Issue City / Authority">
                  <input value={profile.passportIssueAuthority} onChange={e => update('passportIssueAuthority', e.target.value)} placeholder="e.g. Islamabad / NADRA" className={iCls} />
                </Field>
              </div>
              <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📷</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-teal-700">Have your passport handy?</p>
                    <p className="text-xs text-teal-600/70">Use our Passport Scanner to auto-fill the fields above instantly.</p>
                  </div>
                  <Link
                    href="/passport-scanner"
                    className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-teal-600 whitespace-nowrap"
                  >
                    Scan Passport →
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* STEP 3 — Contact */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email Address" required>
                  <input type="email" value={profile.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" className={iCls} />
                </Field>
                <Field label="Phone Number (with country code)" required>
                  <input type="tel" value={profile.phone} onChange={e => update('phone', e.target.value)} placeholder="+92 300 0000000" className={iCls} />
                </Field>
              </div>
              <Field label="WhatsApp Number (optional)">
                <input type="tel" value={profile.whatsapp} onChange={e => update('whatsapp', e.target.value)} placeholder="+92 300 0000000" className={iCls} />
              </Field>
              <Field label="Current Address (full)" required>
                <input value={profile.address} onChange={e => update('address', e.target.value)} placeholder="Street address, building, apartment..." className={iCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="City">
                  <input value={profile.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Karachi" className={iCls} />
                </Field>
                <Field label="State / Province">
                  <input value={profile.state} onChange={e => update('state', e.target.value)} placeholder="e.g. Sindh" className={iCls} />
                </Field>
                <Field label="Postal Code">
                  <input value={profile.postalCode} onChange={e => update('postalCode', e.target.value)} placeholder="e.g. 75500" className={iCls} />
                </Field>
              </div>
              <Field label="Country of Residence" required>
                <select value={profile.countryOfResidence} onChange={e => update('countryOfResidence', e.target.value)} className={sCls}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </>
          )}

          {/* STEP 4 — Professional */}
          {step === 4 && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Occupation / Job Title">
                  <input value={profile.occupation} onChange={e => update('occupation', e.target.value)} placeholder="e.g. Software Engineer" className={iCls} />
                </Field>
                <Field label="Employer / Company Name">
                  <input value={profile.employer} onChange={e => update('employer', e.target.value)} placeholder="e.g. Tech Corp Ltd." className={iCls} />
                </Field>
              </div>
              <Field label="Company Address">
                <input value={profile.companyAddress} onChange={e => update('companyAddress', e.target.value)} placeholder="Full address of employer" className={iCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Monthly Income (approximate)">
                  <input value={profile.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} placeholder="e.g. $2,500" className={iCls} />
                </Field>
                <Field label="Employment Status">
                  <select value={profile.employmentStatus} onChange={e => update('employmentStatus', e.target.value)} className={sCls}>
                    <option value="">Select status</option>
                    <option>Employed</option>
                    <option>Self-Employed</option>
                    <option>Student</option>
                    <option>Retired</option>
                    <option>Unemployed</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {/* STEP 5 — Travel History */}
          {step === 5 && (
            <>
              <Field label="Countries Visited (select all that apply)">
                <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50/40 p-3">
                  <div className="flex flex-wrap gap-2">
                    {COUNTRIES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleCountry(c)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          profile.countriesVisited.includes(c)
                            ? 'border-teal-400 bg-teal-500 text-white'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300'
                        }`}
                      >
                        {NATIONALITY_FLAGS[c] || ''} {c}
                      </button>
                    ))}
                  </div>
                </div>
                {profile.countriesVisited.length > 0 && (
                  <p className="mt-2 text-xs text-teal-600 font-semibold">{profile.countriesVisited.length} countries selected ✓</p>
                )}
              </Field>
              <Field label="Previous Visa Rejections?">
                <select value={profile.hasRejection} onChange={e => update('hasRejection', e.target.value)} className={sCls}>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </Field>
              {profile.hasRejection === 'Yes' && (
                <Field label="Which country & reason?">
                  <textarea
                    value={profile.rejectionDetails}
                    onChange={e => update('rejectionDetails', e.target.value)}
                    placeholder="e.g. USA visa refused in 2022 — insufficient ties to home country"
                    className={`${iCls} resize-none h-20`}
                  />
                </Field>
              )}
            </>
          )}

          {/* STEP 6 — Emergency Contact */}
          {step === 6 && (
            <>
              <Field label="Emergency Contact Name" required>
                <input value={profile.emergencyName} onChange={e => update('emergencyName', e.target.value)} placeholder="Full name" className={iCls} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Relationship">
                  <select value={profile.emergencyRelationship} onChange={e => update('emergencyRelationship', e.target.value)} className={sCls}>
                    <option value="">Select relationship</option>
                    <option>Parent</option>
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Sibling</option>
                    <option>Friend</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Phone Number">
                  <input type="tel" value={profile.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} placeholder="+92 300 0000000" className={iCls} />
                </Field>
              </div>
              <Field label="Address">
                <input value={profile.emergencyAddress} onChange={e => update('emergencyAddress', e.target.value)} placeholder="Full address" className={iCls} />
              </Field>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1">
            {STEPS.map(s => (
              <div key={s.num} className={`h-2 w-2 rounded-full transition-all ${step === s.num ? 'w-5 bg-teal-500' : step > s.num ? 'bg-teal-300' : 'bg-gray-200'}`} />
            ))}
          </div>

          {step < 6 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onSave}
              className="rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:bg-teal-600 hover:-translate-y-px flex items-center gap-2"
            >
              {saved ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Saved!
                </>
              ) : (
                '🔐 Save My Vault'
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VisaVaultPage() {
  const [mounted, setMounted]           = useState(false)
  const [view, setView]                 = useState<'hero' | 'form' | 'dashboard'>('hero')
  const [step, setStep]                 = useState(1)
  const [profile, setProfile]           = useState<ProfileData>(DEFAULT_PROFILE)
  const [savedProfile, setSavedProfile] = useState<ProfileData | null>(null)
  const [selectedVisa, setSelectedVisa] = useState<typeof VISA_CARDS[0] | null>(null)
  const [showModal, setShowModal]       = useState(false)
  const [showExport, setShowExport]     = useState(false)
  const [exportCode, setExportCode]     = useState('')
  const [importCode, setImportCode]     = useState('')
  const [importError, setImportError]   = useState('')
  const [saved, setSaved]               = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    if (hasVault()) {
      const p = loadProfile()
      if (p) { setSavedProfile(p); setView('dashboard') }
    }
  }, [])

  // ── Hooks must all be called before any conditional return (Rules of Hooks) ──
  const update = useCallback((field: keyof ProfileData, value: string | string[]) => {
    setProfile(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'firstName' || field === 'lastName') {
        next.fullName = `${field === 'firstName' ? value : prev.firstName} ${field === 'lastName' ? value : prev.lastName}`.trim() as string
      }
      return next
    })
  }, [])

  const handleSave = useCallback(() => {
    const toSave = { ...profile, savedAt: new Date().toISOString() }
    saveProfile(toSave)
    setSavedProfile(toSave)
    setSaved(true)
    setTimeout(() => { setSaved(false); setView('dashboard') }, 1200)
  }, [profile])

  if (!mounted) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="flex items-center gap-2 text-teal-600">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-sm font-semibold">Loading vault...</span>
      </div>
    </div>
  )

  const handleClearVault = () => {
    if (window.confirm('Are you sure you want to delete your vault? This cannot be undone.')) {
      localStorage.removeItem(VAULT_KEY)
      setSavedProfile(null)
      setProfile(DEFAULT_PROFILE)
      setStep(1)
      setView('hero')
    }
  }

  const handleEdit = () => {
    if (savedProfile) { setProfile(savedProfile); setStep(1); setView('form') }
  }

  const handleExport = () => {
    const stored = localStorage.getItem(VAULT_KEY)
    if (stored) { setExportCode(stored); setShowExport(true) }
  }

  const handleImport = () => {
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(importCode.trim()))))
      saveProfile(decoded); setSavedProfile(decoded)
      setImportError(''); setImportCode(''); setShowExport(false); setView('dashboard')
    } catch {
      try {
        const decoded = JSON.parse(atob(importCode.trim()))
        saveProfile(decoded); setSavedProfile(decoded)
        setImportError(''); setImportCode(''); setShowExport(false); setView('dashboard')
      } catch {
        setImportError('Invalid vault code. Please check and try again.')
      }
    }
  }

  const isPassportExpiringSoon = (d: string) => {
    if (!d) return false
    const exp = new Date(d), soon = new Date()
    soon.setMonth(soon.getMonth() + 6)
    return exp < soon
  }

  const scrollToForm = () => {
    setView('form')
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  if (view === 'dashboard' && savedProfile) {
    const flag = NATIONALITY_FLAGS[savedProfile.nationality || ''] || '🌍'
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">

          {/* Dashboard Header */}
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1.5 text-xs font-bold text-green-700">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              ✅ Your Vault is Ready!
            </div>
            <h1 className="text-4xl font-extrabold text-[#0f0c29]">
              {flag} {savedProfile.fullName || 'Traveler'}
            </h1>
            <p className="mt-1.5 text-sm text-gray-400">
              Nationality: <span className="font-semibold text-gray-600">{savedProfile.nationality || '—'}</span>
              {' · '}
              Last updated:{' '}
              <span className="font-semibold text-gray-600">
                {savedProfile.savedAt
                  ? new Date(savedProfile.savedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
                  : '—'}
              </span>
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button onClick={handleEdit}
                className="rounded-xl border border-teal-200 bg-white px-5 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 hover:shadow-sm">
                ✏️ Edit Profile
              </button>
              <button onClick={handleExport}
                className="rounded-xl border border-indigo-200 bg-white px-5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 hover:shadow-sm">
                📤 Export Vault
              </button>
              <button onClick={handleClearVault}
                className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:shadow-sm">
                🗑️ Clear Vault
              </button>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon:'👤', title:'Personal', color:'teal',
                lines:[
                  { text: savedProfile.fullName || '—', bold: true },
                  { text: savedProfile.dateOfBirth ? `Born: ${savedProfile.dateOfBirth}` : '', bold: false },
                  { text: savedProfile.maritalStatus || '', bold: false },
                ],
                badge: null,
              },
              {
                icon:'🛂', title:'Passport', color:'indigo',
                lines:[
                  { text: savedProfile.passportNumber ? `#${savedProfile.passportNumber}` : '—', bold: true },
                  { text: savedProfile.passportExpiryDate ? `Exp: ${savedProfile.passportExpiryDate}` : '', bold: false },
                  { text: savedProfile.passportIssueCountry || '', bold: false },
                ],
                badge: savedProfile.passportExpiryDate
                  ? (isPassportExpiringSoon(savedProfile.passportExpiryDate)
                    ? { text:'⚠️ Expiring Soon', cls:'bg-red-100 text-red-600' }
                    : { text:'✅ Valid', cls:'bg-green-100 text-green-600' })
                  : null,
              },
              {
                icon:'📍', title:'Location', color:'purple',
                lines:[
                  { text: [savedProfile.city, savedProfile.countryOfResidence].filter(Boolean).join(', ') || '—', bold: true },
                  { text: savedProfile.state || '', bold: false },
                  { text: savedProfile.postalCode ? `ZIP: ${savedProfile.postalCode}` : '', bold: false },
                ],
                badge: null,
              },
              {
                icon:'💼', title:'Professional', color:'orange',
                lines:[
                  { text: savedProfile.occupation || '—', bold: true },
                  { text: savedProfile.employer || '', bold: false },
                  { text: savedProfile.employmentStatus || '', bold: false },
                ],
                badge: null,
              },
            ].map(({ icon, title, color, lines, badge }) => (
              <div key={title} className={`rounded-2xl border p-5 bg-white shadow-sm ${
                color==='teal'?'border-teal-100':color==='indigo'?'border-indigo-100':color==='purple'?'border-purple-100':'border-orange-100'
              }`}>
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-xl">{icon}</span>
                  {badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.text}</span>
                  )}
                </div>
                <p className={`mb-2 text-[10px] font-bold uppercase tracking-widest ${
                  color==='teal'?'text-teal-600':color==='indigo'?'text-indigo-600':color==='purple'?'text-purple-600':'text-orange-600'
                }`}>{title}</p>
                {lines.filter(l => l.text).map((l, i) => (
                  <p key={i} className={`text-sm leading-snug ${l.bold ? 'font-bold text-[#0f0c29]' : 'text-gray-500'}`}>{l.text}</p>
                ))}
              </div>
            ))}
          </div>

          {/* Quick Apply */}
          <div className="mb-12">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-extrabold text-[#0f0c29]">Apply Using Your Vault</h2>
              <p className="mt-1 text-sm text-gray-500">Your data auto-fills these popular visa applications</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {VISA_CARDS.map((card) => (
                <button
                  key={card.country}
                  onClick={() => { setSelectedVisa(card); setShowModal(true) }}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-teal-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{card.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-[#0f0c29]">{card.country}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{card.type}</p>
                  </div>
                  <span className="mt-auto rounded-full bg-teal-500 px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-teal-600 group-hover:shadow-md">
                    Auto-Fill →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <SecuritySection />

          {/* Export/Import */}
          <section className="mt-12 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-xl font-extrabold text-[#0f0c29]">📲 Transfer Vault to Another Device</h2>
            <p className="mb-5 text-sm text-gray-500">Generate a code to restore your vault on a different browser or device.</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExport}
                className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
              >
                📤 Export Vault Code
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                📥 Import Vault Code
              </button>
            </div>
          </section>
        </section>

        {/* Auto-fill Modal */}
        {showModal && selectedVisa && (
          <AutoFillModal visa={selectedVisa} profile={savedProfile} onClose={() => setShowModal(false)} />
        )}

        {/* Export/Import Modal */}
        {showExport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">📱 Transfer Your Vault</h3>
                  <button onClick={() => setShowExport(false)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
                </div>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {exportCode && (
                  <div>
                    <p className="mb-1 text-sm font-bold text-gray-800">Your Export Code</p>
                    <p className="mb-3 text-xs text-gray-500">Copy and paste this on your other device to restore your vault.</p>
                    <textarea readOnly value={exportCode} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-mono text-gray-600 resize-none h-28" />
                    <button onClick={() => { navigator.clipboard.writeText(exportCode); setCopiedExport(true); setTimeout(() => setCopiedExport(false), 2000) }}
                      className="mt-2 w-full rounded-xl bg-indigo-500 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600">
                      {copiedExport ? '✅ Copied to Clipboard!' : '📋 Copy Vault Code'}
                    </button>
                  </div>
                )}
                <div className={exportCode ? 'border-t border-gray-100 pt-5' : ''}>
                  <p className="mb-1 text-sm font-bold text-gray-800">Import from Another Device</p>
                  <p className="mb-3 text-xs text-gray-500">Paste a vault code from another device to restore your profile here.</p>
                  <textarea
                    value={importCode}
                    onChange={e => setImportCode(e.target.value)}
                    placeholder="Paste vault code here..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-mono text-gray-600 resize-none h-28 placeholder:text-gray-300 focus:border-indigo-400 focus:outline-none"
                  />
                  {importError && <p className="mt-1 text-xs text-red-500">⚠️ {importError}</p>}
                  <button onClick={handleImport} disabled={!importCode.trim()}
                    className="mt-2 w-full rounded-xl bg-purple-500 py-2.5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-50">
                    📥 Import & Restore Vault
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── HERO + FORM ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">

      {/* Hero */}
      {view === 'hero' && (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA] pt-16 pb-8 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.1),transparent_60%)]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 backdrop-blur-sm">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
              🔐 Visa Vault
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              <span className="text-[#0f0c29]">Save Once.</span>
              <br />
              <span className="bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Apply Everywhere.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 sm:text-lg leading-relaxed">
              Store your travel profile securely in your browser.
              Auto-fill any visa application in seconds.
              No more filling the same form twice.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {['🔒 Stored Locally on Your Device', '⚡ 30-Second Applications', '🌍 Works for All Countries'].map(t => (
                <div key={t} className="flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700">
                  {t}
                </div>
              ))}
            </div>
            <button
              onClick={scrollToForm}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 hover:-translate-y-0.5 hover:shadow-teal-500/40"
            >
              Create My Vault →
            </button>

            {/* How it works mini-strip */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-left">
              {[
                { step:'01', icon:'📝', title:'Fill Profile Once', desc:'Enter your passport, contact & work details' },
                { step:'02', icon:'💾', title:'Saved Securely', desc:'Stored privately in your browser only' },
                { step:'03', icon:'⚡', title:'Auto-Fill Any Visa', desc:'One click fills any application form' },
              ].map(({ step, icon, title, desc }) => (
                <div key={step} className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="absolute top-3 right-3 text-3xl font-black text-gray-100">{step}</div>
                  <div className="mb-2 text-2xl">{icon}</div>
                  <p className="text-sm font-bold text-[#0f0c29]">{title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Profile Form */}
      <div ref={formRef}>
        <ProfileFormSection
          profile={profile}
          update={update}
          step={step}
          setStep={setStep}
          onSave={handleSave}
          saved={saved}
        />
      </div>

      <SecuritySection />

      {/* Export/Import section for new users */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-xl font-extrabold text-[#0f0c29] mb-2">📲 Already Have a Vault on Another Device?</h2>
          <p className="text-sm text-gray-500 mb-5">Import your vault code from another browser or device to restore your saved profile instantly.</p>
          <button onClick={() => setShowExport(true)}
            className="rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600">
            📥 Import Vault Code
          </button>
        </div>
      </section>

      {/* Import Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">📥 Import Vault Code</h3>
                <button onClick={() => setShowExport(false)} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-3 text-xs text-gray-500">Paste the vault code from your other device below.</p>
              <textarea
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
                placeholder="Paste vault code here..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-mono text-gray-600 resize-none h-28 placeholder:text-gray-300 focus:border-indigo-400 focus:outline-none"
              />
              {importError && <p className="mt-1 text-xs text-red-500">⚠️ {importError}</p>}
              <button onClick={handleImport} disabled={!importCode.trim()}
                className="mt-3 w-full rounded-xl bg-purple-500 py-2.5 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-50">
                📥 Restore My Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
