'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ToolBreadcrumb from '@/components/ToolBreadcrumb'
import {
  searchAirports,
  formatAirport,
  AIRPORTS,
  NATIONALITIES,
  AIRLINES,
  type Airport,
} from '@/utils/airports'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generatePNR = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

const generateBookingRef = (): string => {
  const prefix = 'BK'
  const num = Math.floor(Math.random() * 9000000) + 1000000
  return `${prefix}${num}`
}

const generateHotelRef = (): string => {
  const num = Math.floor(Math.random() * 9000000) + 1000000
  return `HTL${num}`
}

const generateConfirmation = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

const generateTxnId = (): string => {
  return 'TXN' + Math.floor(Math.random() * 9000000000 + 1000000000)
}

const todayStr = (): string => new Date().toISOString().split('T')[0]

const daysAgoStr = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const formatDateNice = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
}

const calcDuration = (dep: string, arr: string): string => {
  if (!dep || !arr) return ''
  const [dh, dm] = dep.split(':').map(Number)
  const [ah, am] = arr.split(':').map(Number)
  let diff = (ah * 60 + am) - (dh * 60 + dm)
  if (diff < 0) diff += 24 * 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return `${h}h ${m.toString().padStart(2, '0')}m`
}

const calcNights = (checkin: string, checkout: string): number => {
  if (!checkin || !checkout) return 0
  return Math.max(0, Math.round((new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000))
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlightData {
  // passenger
  passengerName: string
  passportNo: string
  nationality: string
  dob: string
  // outbound
  fromCode: string
  toCode: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  airlineCode: string
  airlineName: string
  flightNumber: string
  travelClass: string
  // return
  hasReturn: boolean
  retDepartureDate: string
  retDepartureTime: string
  retArrivalDate: string
  retArrivalTime: string
  retFlightNumber: string
  // auto
  pnr: string
  bookingRef: string
  issueDate: string
  bookingDate: string
  txnId: string
}

interface HotelData {
  // guest
  guestName: string
  passportNo: string
  nationality: string
  // hotel
  hotelName: string
  hotelAddress: string
  hotelCity: string
  hotelCountry: string
  checkin: string
  checkout: string
  roomType: string
  guests: string
  // auto
  bookingRef: string
  confirmationNo: string
}

// ─── AirportSearchInput component ────────────────────────────────────────────

function AirportSearchInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (code: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState(value ? formatAirport(value) : '')
  const [results, setResults] = useState<Airport[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value && AIRPORTS[value]) {
      setQuery(formatAirport(value))
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (q: string) => {
    setQuery(q)
    if (q.length >= 1) {
      setResults(searchAirports(q))
      setOpen(true)
    } else {
      setResults([])
      setOpen(false)
      onChange('')
    }
  }

  const select = (a: Airport) => {
    setQuery(formatAirport(a.code))
    onChange(a.code)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => query.length >= 1 && setOpen(true)}
        placeholder={placeholder || 'Search city or airport…'}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition"
      />
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {results.map(a => (
            <button
              key={a.code}
              type="button"
              onMouseDown={() => select(a)}
              className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition text-sm"
            >
              <span className="font-bold text-[#0f0c29]">{a.code}</span>
              <span className="text-gray-500"> — {a.name}</span>
              <span className="text-xs text-gray-400 ml-1">({a.country})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition'

const selectCls =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition appearance-none'

// ─── FlightPreview ─────────────────────────────────────────────────────────────

function FlightPreview({ f }: { f: FlightData }) {
  const fromCity = f.fromCode && AIRPORTS[f.fromCode]?.city || f.fromCode
  const toCity   = f.toCode   && AIRPORTS[f.toCode]?.city   || f.toCode

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden font-[system-ui] text-[#0f0c29] text-[13px]">
      {/* Header */}
      <div className="bg-[#0f0c29] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-lg tracking-wide">
            {f.airlineName || 'AIRLINE'}
          </div>
          <div className="text-white/60 text-xs mt-0.5">FLIGHT ITINERARY / E-TICKET CONFIRMATION</div>
        </div>
        <div className="text-right">
          <div className="text-teal-400 font-bold text-base tracking-widest">{f.pnr || 'XXXXXX'}</div>
          <div className="text-white/50 text-xs mt-0.5">PNR</div>
        </div>
      </div>

      {/* Issue bar */}
      <div className="bg-teal-500/10 border-b border-teal-100 px-6 py-2 flex gap-6 text-xs text-gray-500">
        <span><b className="text-gray-700">Issue Date:</b> {formatDateNice(f.issueDate) || '—'}</span>
        <span><b className="text-gray-700">Booking Ref:</b> {f.bookingRef || '—'}</span>
        <span><b className="text-gray-700">Booking Date:</b> {formatDateNice(f.bookingDate) || '—'}</span>
      </div>

      {/* Passenger */}
      <div className="bg-gray-50 mx-4 mt-4 rounded-xl p-4 border border-gray-200">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Passenger Details</div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
          <span><b>Name:</b> {f.passengerName?.toUpperCase() || '—'}</span>
          <span><b>Nationality:</b> {f.nationality || '—'}</span>
          <span><b>Passport:</b> {f.passportNo || '—'}</span>
          <span><b>DOB:</b> {f.dob || '—'}</span>
        </div>
      </div>

      {/* Outbound flight */}
      <div className="mx-4 mt-3">
        <div className="bg-teal-500 rounded-t-xl px-4 py-1.5">
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">✈ Outbound Flight</span>
        </div>
        <div className="border border-teal-100 rounded-b-xl p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <div className="text-2xl font-black text-[#0f0c29]">{f.fromCode || '—'}</div>
              <div className="text-xs text-gray-500">{fromCity || '—'}</div>
            </div>
            <div className="flex-1 text-center text-gray-300 text-xl mx-2">✈</div>
            <div className="text-center">
              <div className="text-2xl font-black text-[#0f0c29]">{f.toCode || '—'}</div>
              <div className="text-xs text-gray-500">{toCity || '—'}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <span><b>Flight:</b> {f.flightNumber || '—'}</span>
            <span><b>Date:</b> {formatDateNice(f.departureDate) || '—'}</span>
            <span><b>Class:</b> {f.travelClass || '—'}</span>
            <span><b>Departs:</b> {f.departureTime || '—'}</span>
            <span><b>Arrives:</b> {f.arrivalTime || '—'}</span>
            <span><b>Duration:</b> {calcDuration(f.departureTime, f.arrivalTime)}</span>
            <span><b>Baggage:</b> 30 KG</span>
            <span><b>Seat:</b> Not Assigned</span>
            <span>
              <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-semibold">✓ CONFIRMED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Return flight */}
      {f.hasReturn && (
        <div className="mx-4 mt-3">
          <div className="bg-indigo-500 rounded-t-xl px-4 py-1.5">
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">✈ Return Flight</span>
          </div>
          <div className="border border-indigo-100 rounded-b-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-2xl font-black text-[#0f0c29]">{f.toCode || '—'}</div>
                <div className="text-xs text-gray-500">{toCity || '—'}</div>
              </div>
              <div className="flex-1 text-center text-gray-300 text-xl mx-2">✈</div>
              <div className="text-center">
                <div className="text-2xl font-black text-[#0f0c29]">{f.fromCode || '—'}</div>
                <div className="text-xs text-gray-500">{fromCity || '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <span><b>Flight:</b> {f.retFlightNumber || '—'}</span>
              <span><b>Date:</b> {formatDateNice(f.retDepartureDate) || '—'}</span>
              <span><b>Class:</b> {f.travelClass || '—'}</span>
              <span><b>Departs:</b> {f.retDepartureTime || '—'}</span>
              <span><b>Arrives:</b> {f.retArrivalTime || '—'}</span>
              <span><b>Duration:</b> {calcDuration(f.retDepartureTime, f.retArrivalTime)}</span>
              <span>
                <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-semibold">✓ CONFIRMED</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Booking summary */}
      <div className="mx-4 mt-3 mb-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Booking Summary</div>
        <div className="grid grid-cols-2 gap-y-1 text-xs">
          <span><b>Total Passengers:</b> 1</span>
          <span><b>Payment:</b> Online Banking</span>
          <span><b>Total Fare:</b> PKR 45,200</span>
          <span><b>Taxes & Fees:</b> PKR 8,400</span>
          <span className="col-span-2 mt-1 font-bold text-sm border-t border-gray-200 pt-2">TOTAL PAID: PKR 53,600</span>
          <span><b>Transaction ID:</b> {f.txnId || '—'}</span>
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-[10px] text-gray-400 text-center">
        This is an electronic ticket. Please carry a valid photo ID and this itinerary when traveling.
        Check-in opens 3 hours before departure. — Generated by VisitPlane.com
      </div>
    </div>
  )
}

// ─── HotelPreview ─────────────────────────────────────────────────────────────

function HotelPreview({ h }: { h: HotelData }) {
  const nights = calcNights(h.checkin, h.checkout)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden text-[#0f0c29] text-[13px]">
      {/* Header */}
      <div className="bg-[#0f0c29] px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-white font-bold text-lg tracking-wide">
            {h.hotelName?.toUpperCase() || 'HOTEL NAME'}
          </div>
          <div className="text-white/60 text-xs mt-0.5">BOOKING CONFIRMATION</div>
        </div>
        <div className="text-right">
          <div className="text-teal-400 font-bold text-sm tracking-widest">{h.confirmationNo || 'XXXXXXXX'}</div>
          <div className="text-white/50 text-xs mt-0.5">Confirmation No.</div>
        </div>
      </div>

      {/* Guest */}
      <div className="bg-gray-50 mx-4 mt-4 rounded-xl p-4 border border-gray-200">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Guest Details</div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
          <span><b>Name:</b> {h.guestName?.toUpperCase() || '—'}</span>
          <span><b>Nationality:</b> {h.nationality || '—'}</span>
          <span><b>Passport:</b> {h.passportNo || '—'}</span>
        </div>
      </div>

      {/* Hotel details */}
      <div className="mx-4 mt-3">
        <div className="bg-amber-500 rounded-t-xl px-4 py-1.5">
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">🏨 Booking Details</span>
        </div>
        <div className="border border-amber-100 rounded-b-xl p-4 bg-white">
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <span className="col-span-2"><b>Hotel:</b> {h.hotelName || '—'}</span>
            <span className="col-span-2"><b>Address:</b> {h.hotelAddress || '—'}{h.hotelCity ? `, ${h.hotelCity}` : ''}{h.hotelCountry ? `, ${h.hotelCountry}` : ''}</span>
            <span><b>Check-in:</b> {formatDateNice(h.checkin) || '—'}</span>
            <span><b>Time:</b> 15:00</span>
            <span><b>Check-out:</b> {formatDateNice(h.checkout) || '—'}</span>
            <span><b>Time:</b> 12:00</span>
            <span><b>Duration:</b> {nights > 0 ? `${nights} Night${nights > 1 ? 's' : ''}` : '—'}</span>
            <span><b>Room Type:</b> {h.roomType || '—'}</span>
            <span><b>Guests:</b> {h.guests || '—'}</span>
            <span>
              <span className="inline-block bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-[10px] font-semibold">✓ CONFIRMED</span>
            </span>
          </div>
        </div>
      </div>

      {/* Booking ref + cancellation */}
      <div className="mx-4 mt-3 mb-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-2">Booking Reference</div>
        <div className="grid grid-cols-2 gap-y-1 text-xs">
          <span><b>Reference:</b> {h.bookingRef || '—'}</span>
          <span><b>Confirmation:</b> {h.confirmationNo || '—'}</span>
        </div>
        <div className="mt-3 text-[10px] text-gray-400 border-t border-gray-200 pt-2">
          ℹ️ Free cancellation until 24 hours before check-in date. For inquiries: reservations@{h.hotelName?.toLowerCase().replace(/\s+/g, '') || 'hotel'}.com
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-[10px] text-gray-400 text-center">
        This is an official booking confirmation. Please present this document at check-in.
        Generated by VisitPlane.com
      </div>
    </div>
  )
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

async function generateFlightPDF(f: FlightData) {
  const { jsPDF } = await import('jspdf')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setFont('helvetica')

  const fromCity = f.fromCode && AIRPORTS[f.fromCode]?.city || f.fromCode
  const toCity   = f.toCode   && AIRPORTS[f.toCode]?.city   || f.toCode
  const fromName = f.fromCode && AIRPORTS[f.fromCode]?.name || ''
  const toName   = f.toCode   && AIRPORTS[f.toCode]?.name   || ''

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 12, 41)
  doc.rect(0, 0, 210, 38, 'F')

  // Teal accent strip
  doc.setFillColor(20, 184, 166)
  doc.rect(0, 35, 210, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text((f.airlineName || 'AIRLINE').toUpperCase(), 15, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  doc.text('FLIGHT ITINERARY / E-TICKET CONFIRMATION', 15, 24)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20, 184, 166)
  doc.text(`PNR: ${f.pnr}`, 195, 14, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  doc.text(`Issue Date: ${formatDateNice(f.issueDate)}`, 195, 21, { align: 'right' })
  doc.text(`Booking Ref: ${f.bookingRef}`, 195, 27, { align: 'right' })
  doc.text(`Booking Date: ${formatDateNice(f.bookingDate)}`, 195, 33, { align: 'right' })

  // ── Passenger section ────────────────────────────────────────────────────
  let y = 46
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(10, y, 190, 32, 3, 3, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.roundedRect(10, y, 190, 32, 3, 3, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 160, 180)
  doc.text('PASSENGER DETAILS', 15, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 12, 41)
  doc.setFontSize(10)
  doc.text(`Name: ${(f.passengerName || '').toUpperCase()}`, 15, y + 15)
  doc.text(`Passport: ${f.passportNo || ''}`, 15, y + 22)
  doc.text(`Nationality: ${f.nationality || ''}`, 105, y + 15)
  doc.text(`Date of Birth: ${f.dob || ''}`, 105, y + 22)

  // ── Outbound flight ───────────────────────────────────────────────────────
  y += 40

  // Section header
  doc.setFillColor(20, 184, 166)
  doc.roundedRect(10, y, 190, 9, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('  ✈  OUTBOUND FLIGHT', 15, y + 6)

  y += 11
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, y, 190, 58, 2, 2, 'F')
  doc.setDrawColor(20, 184, 166)
  doc.roundedRect(10, y, 190, 58, 2, 2, 'S')

  // Route
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 12, 41)
  doc.text(f.fromCode || 'KHI', 25, y + 22)
  doc.setFontSize(16)
  doc.setTextColor(180, 190, 210)
  doc.text('──────►', 65, y + 22)
  doc.setFontSize(26)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 12, 41)
  doc.text(f.toCode || 'DXB', 150, y + 22)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 110, 130)
  doc.text(fromCity || '', 25, y + 29)
  if (fromName) doc.text(fromName, 25, y + 34)
  doc.text(toCity || '', 150, y + 29)
  if (toName) doc.text(toName, 150, y + 34)

  // Divider
  doc.setDrawColor(230, 235, 245)
  doc.line(15, y + 38, 195, y + 38)

  // Flight details row
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 12, 41)
  const details = [
    [`Flight: ${f.flightNumber || '—'}`, 20],
    [`Date: ${formatDateNice(f.departureDate) || '—'}`, 70],
    [`Class: ${f.travelClass || 'Economy'}`, 150],
  ] as [string, number][]
  details.forEach(([text, x]) => doc.text(text, x, y + 45))

  doc.setFont('helvetica', 'normal')
  doc.text(`Departs: ${f.departureTime || '—'}`, 20, y + 53)
  doc.text(`Arrives: ${f.arrivalTime || '—'}`, 80, y + 53)
  doc.text(`Duration: ${calcDuration(f.departureTime, f.arrivalTime) || '—'}`, 140, y + 53)

  // Confirmed badge
  doc.setFillColor(16, 185, 129)
  doc.roundedRect(148, y + 39, 48, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('✓  CONFIRMED', 172, y + 44.5, { align: 'center' })

  // Baggage
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 110, 130)
  doc.text('Baggage: 30 KG included   |   Seat: Not Assigned', 20, y + 60)

  // ── Return flight ──────────────────────────────────────────────────────────
  if (f.hasReturn) {
    y += 66

    doc.setFillColor(79, 70, 229)
    doc.roundedRect(10, y, 190, 9, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('  ✈  RETURN FLIGHT', 15, y + 6)

    y += 11
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(10, y, 190, 58, 2, 2, 'F')
    doc.setDrawColor(79, 70, 229)
    doc.roundedRect(10, y, 190, 58, 2, 2, 'S')

    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 12, 41)
    doc.text(f.toCode || 'DXB', 25, y + 22)
    doc.setFontSize(16)
    doc.setTextColor(180, 190, 210)
    doc.text('──────►', 65, y + 22)
    doc.setFontSize(26)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 12, 41)
    doc.text(f.fromCode || 'KHI', 150, y + 22)

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 110, 130)
    doc.text(toCity || '', 25, y + 29)
    if (toName) doc.text(toName, 25, y + 34)
    doc.text(fromCity || '', 150, y + 29)
    if (fromName) doc.text(fromName, 150, y + 34)

    doc.setDrawColor(230, 235, 245)
    doc.line(15, y + 38, 195, y + 38)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 12, 41)
    doc.text(`Flight: ${f.retFlightNumber || '—'}`, 20, y + 45)
    doc.text(`Date: ${formatDateNice(f.retDepartureDate) || '—'}`, 70, y + 45)
    doc.text(`Class: ${f.travelClass || 'Economy'}`, 150, y + 45)

    doc.setFont('helvetica', 'normal')
    doc.text(`Departs: ${f.retDepartureTime || '—'}`, 20, y + 53)
    doc.text(`Arrives: ${f.retArrivalTime || '—'}`, 80, y + 53)
    doc.text(`Duration: ${calcDuration(f.retDepartureTime, f.retArrivalTime) || '—'}`, 140, y + 53)

    doc.setFillColor(16, 185, 129)
    doc.roundedRect(148, y + 39, 48, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('✓  CONFIRMED', 172, y + 44.5, { align: 'center' })

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 110, 130)
    doc.text('Baggage: 30 KG included   |   Seat: Not Assigned', 20, y + 60)

    y += 66
  } else {
    y += 66
  }

  // ── Booking summary ────────────────────────────────────────────────────────
  y += 6
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(10, y, 190, 42, 3, 3, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.roundedRect(10, y, 190, 42, 3, 3, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 160, 180)
  doc.text('BOOKING SUMMARY', 15, y + 7)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 12, 41)
  doc.text('Total Passengers: 1', 15, y + 14)
  doc.text('Total Fare: PKR 45,200', 15, y + 21)
  doc.text('Taxes & Fees: PKR 8,400', 15, y + 28)
  doc.text('Payment Method: Online Banking', 110, y + 14)
  doc.text(`Transaction ID: ${f.txnId || '—'}`, 110, y + 21)

  doc.setDrawColor(220, 228, 240)
  doc.line(15, y + 32, 195, y + 32)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL PAID: PKR 53,600', 15, y + 39)

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 272
  doc.setFillColor(248, 250, 252)
  doc.rect(0, footerY, 210, 25, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.line(0, footerY, 210, footerY)

  doc.setTextColor(120, 130, 150)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'This is an electronic itinerary. Please present this document along with valid photo identification at check-in.',
    105, footerY + 8, { align: 'center' }
  )
  doc.text(
    'Check-in opens 3 hours before departure. This itinerary is for visa application purposes.',
    105, footerY + 14, { align: 'center' }
  )
  doc.text(
    `Generated by VisitPlane.com  |  ${new Date().toLocaleDateString()}`,
    105, footerY + 20, { align: 'center' }
  )

  doc.save(`flight-itinerary-${f.pnr}.pdf`)
}

async function generateHotelPDF(h: HotelData) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.setFont('helvetica')

  const nights = calcNights(h.checkin, h.checkout)

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 12, 41)
  doc.rect(0, 0, 210, 38, 'F')

  doc.setFillColor(245, 158, 11) // amber
  doc.rect(0, 35, 210, 3, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text((h.hotelName || 'HOTEL NAME').toUpperCase(), 15, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  doc.text('BOOKING CONFIRMATION', 15, 24)

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 158, 11)
  doc.text(h.confirmationNo || 'XXXXXXXX', 195, 14, { align: 'right' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 200, 255)
  doc.text('Confirmation Number', 195, 21, { align: 'right' })
  doc.text(`Booking Ref: ${h.bookingRef || '—'}`, 195, 28, { align: 'right' })

  // ── Guest section ─────────────────────────────────────────────────────────
  let y = 46
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(10, y, 190, 28, 3, 3, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.roundedRect(10, y, 190, 28, 3, 3, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 160, 180)
  doc.text('GUEST DETAILS', 15, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(15, 12, 41)
  doc.setFontSize(10)
  doc.text(`Name: ${(h.guestName || '').toUpperCase()}`, 15, y + 15)
  doc.text(`Passport: ${h.passportNo || ''}`, 15, y + 22)
  doc.text(`Nationality: ${h.nationality || ''}`, 105, y + 15)

  // ── Hotel details ─────────────────────────────────────────────────────────
  y += 36

  doc.setFillColor(245, 158, 11)
  doc.roundedRect(10, y, 190, 9, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('  🏨  BOOKING DETAILS', 15, y + 6)

  y += 11
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(10, y, 190, 70, 2, 2, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.roundedRect(10, y, 190, 70, 2, 2, 'S')

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 12, 41)
  doc.text(`Hotel: ${h.hotelName || '—'}`, 15, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 90, 110)
  const addr = [h.hotelAddress, h.hotelCity, h.hotelCountry].filter(Boolean).join(', ')
  doc.text(`Address: ${addr || '—'}`, 15, y + 18)

  doc.setDrawColor(230, 235, 245)
  doc.line(15, y + 24, 195, y + 24)

  doc.setTextColor(15, 12, 41)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)

  const rows = [
    ['Check-in Date:', formatDateNice(h.checkin) || '—', 'Check-in Time:', '15:00'],
    ['Check-out Date:', formatDateNice(h.checkout) || '—', 'Check-out Time:', '12:00'],
    ['Duration:', nights > 0 ? `${nights} Night${nights > 1 ? 's' : ''}` : '—', 'Room Type:', h.roomType || '—'],
    ['Number of Guests:', h.guests || '—', 'Rate/Night:', 'See invoice'],
  ]

  rows.forEach((row, i) => {
    const rowY = y + 32 + i * 9
    doc.setFont('helvetica', 'bold')
    doc.text(row[0], 15, rowY)
    doc.setFont('helvetica', 'normal')
    doc.text(row[1], 55, rowY)
    doc.setFont('helvetica', 'bold')
    doc.text(row[2], 105, rowY)
    doc.setFont('helvetica', 'normal')
    doc.text(row[3], 145, rowY)
  })

  // Status
  doc.setFillColor(16, 185, 129)
  doc.roundedRect(148, y + 61, 48, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('✓  CONFIRMED', 172, y + 66.5, { align: 'center' })

  // ── Cancellation policy ────────────────────────────────────────────────────
  y += 88
  doc.setFillColor(255, 247, 230)
  doc.roundedRect(10, y, 190, 22, 3, 3, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.roundedRect(10, y, 190, 22, 3, 3, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(150, 120, 50)
  doc.text('CANCELLATION POLICY', 15, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 60, 20)
  doc.text('Free cancellation until 24 hours before check-in date.', 15, y + 14)
  doc.text(`For inquiries: reservations@${(h.hotelName || 'hotel').toLowerCase().replace(/\s+/g, '')}.com`, 15, y + 20)

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 272
  doc.setFillColor(248, 250, 252)
  doc.rect(0, footerY, 210, 25, 'F')
  doc.setDrawColor(220, 228, 240)
  doc.line(0, footerY, 210, footerY)

  doc.setTextColor(120, 130, 150)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'This is an official booking confirmation. Please present this document at check-in.',
    105, footerY + 8, { align: 'center' }
  )
  doc.text(
    'This confirmation is for visa application purposes.',
    105, footerY + 14, { align: 'center' }
  )
  doc.text(
    `Generated by VisitPlane.com  |  ${new Date().toLocaleDateString()}`,
    105, footerY + 20, { align: 'center' }
  )

  doc.save(`hotel-booking-${h.confirmationNo}.pdf`)
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const VISA_TABLE = [
  { visa: 'Schengen (Europe)', required: true,  note: 'Mandatory' },
  { visa: 'UK Visa',           required: true,  note: 'Strongly recommended' },
  { visa: 'USA B1/B2',         required: true,  note: 'Show at interview' },
  { visa: 'Canada',            required: true,  note: 'Recommended' },
  { visa: 'UAE',               required: null,  note: 'Sometimes required' },
  { visa: 'Saudi Arabia',      required: true,  note: 'Yes for tourist' },
  { visa: 'Australia',         required: true,  note: 'Recommended' },
  { visa: 'Japan',             required: true,  note: 'Mandatory' },
]

export default function ItineraryGeneratorPage() {
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel'>('flight')
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // ── Flight state ────────────────────────────────────────────────────────────
  const [flight, setFlight] = useState<FlightData>({
    passengerName: '',
    passportNo: '',
    nationality: 'Pakistani',
    dob: '',
    fromCode: 'KHI',
    toCode: 'DXB',
    departureDate: '',
    departureTime: '08:30',
    arrivalDate: '',
    arrivalTime: '10:45',
    airlineCode: 'EK',
    airlineName: 'Emirates',
    flightNumber: 'EK-525',
    travelClass: 'Economy',
    hasReturn: false,
    retDepartureDate: '',
    retDepartureTime: '14:00',
    retArrivalDate: '',
    retArrivalTime: '17:30',
    retFlightNumber: 'EK-526',
    pnr: generatePNR(),
    bookingRef: generateBookingRef(),
    issueDate: todayStr(),
    bookingDate: daysAgoStr(3),
    txnId: generateTxnId(),
  })

  const setF = useCallback(<K extends keyof FlightData>(key: K, val: FlightData[K]) => {
    setFlight(prev => ({ ...prev, [key]: val }))
  }, [])

  // Auto-set flight number when airline changes
  const handleAirlineChange = (code: string) => {
    const airline = AIRLINES.find(a => a.code === code)
    const num = Math.floor(Math.random() * 900) + 100
    setFlight(prev => ({
      ...prev,
      airlineCode: code,
      airlineName: airline?.name.split(' – ')[0] || airline?.name || code,
      flightNumber: `${code}-${num}`,
      retFlightNumber: `${code}-${num + 1}`,
    }))
  }

  // ── Hotel state ──────────────────────────────────────────────────────────────
  const [hotel, setHotel] = useState<HotelData>({
    guestName: '',
    passportNo: '',
    nationality: 'Pakistani',
    hotelName: '',
    hotelAddress: '',
    hotelCity: '',
    hotelCountry: '',
    checkin: '',
    checkout: '',
    roomType: 'Standard',
    guests: '1',
    bookingRef: generateHotelRef(),
    confirmationNo: generateConfirmation(),
  })

  const setH = useCallback(<K extends keyof HotelData>(key: K, val: HotelData[K]) => {
    setHotel(prev => ({ ...prev, [key]: val }))
  }, [])

  const handleFlightPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateFlightPDF(flight)
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleHotelPDF = async () => {
    setGeneratingPDF(true)
    try {
      await generateHotelPDF(hotel)
    } finally {
      setGeneratingPDF(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased">
      <ToolBreadcrumb toolName="Itinerary Generator" toolEmoji="✈️" />

      {/* ─────────────────────── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.10),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600">
            ✈️ Itinerary Generator
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-[#0f0c29]">Generate Your </span>
            <span className="bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              Visa Itinerary
            </span>
            <span className="text-[#0f0c29]"> Instantly</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 leading-relaxed">
            Create professional flight and hotel itineraries for your visa application.
            Embassy-accepted format. Free &amp; instant.
          </p>

          {/* Trust pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              '✅ Embassy Accepted Format',
              '⚡ Ready in 30 Seconds',
              '📄 Professional PDF',
              '🌍 All Countries',
            ].map(pill => (
              <span
                key={pill}
                className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 shadow-sm"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── GENERATORS ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-10">
        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {([
            ['flight', '✈️ Flight Itinerary'],
            ['hotel',  '🏨 Hotel Booking'],
          ] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-6 py-3 text-sm font-bold transition-all ${
                activeTab === tab
                  ? 'bg-[#0f0c29] text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

          {/* ── Left: Form ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            {/* ─── FLIGHT FORM ─────────────────────────────────────────── */}
            {activeTab === 'flight' && (
              <div className="space-y-6">
                {/* Passenger */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    👤 Passenger Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name (as in passport)">
                      <input
                        type="text"
                        className={inputCls}
                        value={flight.passengerName}
                        onChange={e => setF('passengerName', e.target.value)}
                        placeholder="e.g. Muhammad Hamad Ashraf"
                      />
                    </Field>
                    <Field label="Passport Number">
                      <input
                        type="text"
                        className={inputCls}
                        value={flight.passportNo}
                        onChange={e => setF('passportNo', e.target.value)}
                        placeholder="e.g. HE1844311"
                      />
                    </Field>
                    <Field label="Nationality">
                      <select
                        className={selectCls}
                        value={flight.nationality}
                        onChange={e => setF('nationality', e.target.value)}
                      >
                        {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                      </select>
                    </Field>
                    <Field label="Date of Birth">
                      <input
                        type="date"
                        className={inputCls}
                        value={flight.dob}
                        onChange={e => setF('dob', e.target.value)}
                      />
                    </Field>
                  </div>
                </div>

                {/* Outbound */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    ✈️ Outbound Flight
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <AirportSearchInput
                      label="From (Departure City)"
                      value={flight.fromCode}
                      onChange={code => setF('fromCode', code)}
                      placeholder="e.g. Karachi or KHI"
                    />
                    <AirportSearchInput
                      label="To (Arrival City)"
                      value={flight.toCode}
                      onChange={code => setF('toCode', code)}
                      placeholder="e.g. Dubai or DXB"
                    />
                    <Field label="Departure Date">
                      <input
                        type="date"
                        className={inputCls}
                        value={flight.departureDate}
                        onChange={e => setF('departureDate', e.target.value)}
                      />
                    </Field>
                    <Field label="Departure Time">
                      <input
                        type="time"
                        className={inputCls}
                        value={flight.departureTime}
                        onChange={e => setF('departureTime', e.target.value)}
                      />
                    </Field>
                    <Field label="Arrival Date">
                      <input
                        type="date"
                        className={inputCls}
                        value={flight.arrivalDate}
                        onChange={e => setF('arrivalDate', e.target.value)}
                      />
                    </Field>
                    <Field label="Arrival Time">
                      <input
                        type="time"
                        className={inputCls}
                        value={flight.arrivalTime}
                        onChange={e => setF('arrivalTime', e.target.value)}
                      />
                    </Field>
                    <Field label="Airline">
                      <select
                        className={selectCls}
                        value={flight.airlineCode}
                        onChange={e => handleAirlineChange(e.target.value)}
                      >
                        {AIRLINES.map(a => (
                          <option key={a.code} value={a.code}>{a.name}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Flight Number">
                      <input
                        type="text"
                        className={inputCls}
                        value={flight.flightNumber}
                        onChange={e => setF('flightNumber', e.target.value)}
                        placeholder="e.g. EK-525 (auto-generated)"
                      />
                    </Field>
                    <Field label="Travel Class">
                      <select
                        className={selectCls}
                        value={flight.travelClass}
                        onChange={e => setF('travelClass', e.target.value)}
                      >
                        <option>Economy</option>
                        <option>Business</option>
                        <option>First</option>
                      </select>
                    </Field>
                    <div className="flex items-center gap-2 self-end pb-1">
                      <span className="text-xs font-semibold text-gray-600">PNR:</span>
                      <span className="font-mono text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                        {flight.pnr}
                      </span>
                      <button
                        type="button"
                        onClick={() => setF('pnr', generatePNR())}
                        className="text-xs text-gray-400 hover:text-teal-500 transition"
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                </div>

                {/* Return flight toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setF('hasReturn', !flight.hasReturn)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      flight.hasReturn
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    <span>{flight.hasReturn ? '✅' : '☐'}</span>
                    Add Return Flight
                  </button>

                  {flight.hasReturn && (
                    <div className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3">
                        ↩️ Return Flight
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">From (Return)</label>
                          <div className="w-full rounded-xl border border-gray-200 bg-indigo-50 px-4 py-2.5 text-sm text-gray-500">
                            {flight.toCode ? formatAirport(flight.toCode) : 'Auto (destination city)'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">To (Return)</label>
                          <div className="w-full rounded-xl border border-gray-200 bg-indigo-50 px-4 py-2.5 text-sm text-gray-500">
                            {flight.fromCode ? formatAirport(flight.fromCode) : 'Auto (origin city)'}
                          </div>
                        </div>
                        <Field label="Return Departure Date">
                          <input
                            type="date"
                            className={inputCls}
                            value={flight.retDepartureDate}
                            onChange={e => setF('retDepartureDate', e.target.value)}
                          />
                        </Field>
                        <Field label="Return Departure Time">
                          <input
                            type="time"
                            className={inputCls}
                            value={flight.retDepartureTime}
                            onChange={e => setF('retDepartureTime', e.target.value)}
                          />
                        </Field>
                        <Field label="Return Arrival Date">
                          <input
                            type="date"
                            className={inputCls}
                            value={flight.retArrivalDate}
                            onChange={e => setF('retArrivalDate', e.target.value)}
                          />
                        </Field>
                        <Field label="Return Arrival Time">
                          <input
                            type="time"
                            className={inputCls}
                            value={flight.retArrivalTime}
                            onChange={e => setF('retArrivalTime', e.target.value)}
                          />
                        </Field>
                        <Field label="Return Flight Number">
                          <input
                            type="text"
                            className={inputCls}
                            value={flight.retFlightNumber}
                            onChange={e => setF('retFlightNumber', e.target.value)}
                            placeholder="e.g. EK-526"
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate button */}
                <button
                  type="button"
                  onClick={handleFlightPDF}
                  disabled={generatingPDF}
                  className="w-full rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-emerald-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generatingPDF ? '⏳ Generating PDF…' : '📄 Generate Flight Itinerary PDF'}
                </button>
              </div>
            )}

            {/* ─── HOTEL FORM ──────────────────────────────────────────── */}
            {activeTab === 'hotel' && (
              <div className="space-y-6">
                {/* Guest */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    👤 Guest Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.guestName}
                        onChange={e => setH('guestName', e.target.value)}
                        placeholder="e.g. Muhammad Hamad Ashraf"
                      />
                    </Field>
                    <Field label="Passport Number">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.passportNo}
                        onChange={e => setH('passportNo', e.target.value)}
                        placeholder="e.g. HE1844311"
                      />
                    </Field>
                    <Field label="Nationality">
                      <select
                        className={selectCls}
                        value={hotel.nationality}
                        onChange={e => setH('nationality', e.target.value)}
                      >
                        {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Hotel details */}
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
                    🏨 Hotel Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Hotel Name">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.hotelName}
                        onChange={e => setH('hotelName', e.target.value)}
                        placeholder="e.g. Grand Hyatt Dubai"
                      />
                    </Field>
                    <Field label="Hotel Address">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.hotelAddress}
                        onChange={e => setH('hotelAddress', e.target.value)}
                        placeholder="e.g. Sheikh Zayed Road"
                      />
                    </Field>
                    <Field label="City">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.hotelCity}
                        onChange={e => setH('hotelCity', e.target.value)}
                        placeholder="e.g. Dubai"
                      />
                    </Field>
                    <Field label="Country">
                      <input
                        type="text"
                        className={inputCls}
                        value={hotel.hotelCountry}
                        onChange={e => setH('hotelCountry', e.target.value)}
                        placeholder="e.g. UAE"
                      />
                    </Field>
                    <Field label="Check-in Date">
                      <input
                        type="date"
                        className={inputCls}
                        value={hotel.checkin}
                        onChange={e => setH('checkin', e.target.value)}
                      />
                    </Field>
                    <Field label="Check-out Date">
                      <input
                        type="date"
                        className={inputCls}
                        value={hotel.checkout}
                        onChange={e => setH('checkout', e.target.value)}
                      />
                    </Field>
                    <Field label="Room Type">
                      <select
                        className={selectCls}
                        value={hotel.roomType}
                        onChange={e => setH('roomType', e.target.value)}
                      >
                        <option>Standard</option>
                        <option>Deluxe</option>
                        <option>Suite</option>
                        <option>Superior</option>
                        <option>Executive</option>
                      </select>
                    </Field>
                    <Field label="Number of Guests">
                      <select
                        className={selectCls}
                        value={hotel.guests}
                        onChange={e => setH('guests', e.target.value)}
                      >
                        {['1','2','3','4','5','6'].map(n => <option key={n}>{n}</option>)}
                      </select>
                    </Field>

                    {/* Auto refs */}
                    <div className="flex items-center gap-2 self-end pb-1">
                      <span className="text-xs font-semibold text-gray-600">Booking Ref:</span>
                      <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        {hotel.bookingRef}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-end pb-1">
                      <span className="text-xs font-semibold text-gray-600">Confirm No:</span>
                      <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        {hotel.confirmationNo}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleHotelPDF}
                  disabled={generatingPDF}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-600 hover:to-orange-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generatingPDF ? '⏳ Generating PDF…' : '📄 Generate Hotel Booking PDF'}
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-gray-700">👁 Live Preview</span>
              <span className="text-xs text-gray-400">— updates as you type</span>
            </div>
            {activeTab === 'flight'
              ? <FlightPreview f={flight} />
              : <HotelPreview h={hotel} />
            }
            <p className="text-xs text-center text-gray-400 px-2">
              The PDF will match this preview with professional formatting.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────── VISA REQUIREMENTS TABLE ───────────────── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-[#0f0c29] px-6 py-4">
            <h2 className="text-white font-bold text-lg">📋 Which Visas Need an Itinerary?</h2>
            <p className="text-white/60 text-xs mt-1">Know before you apply</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Visa Type</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Itinerary Required?</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Note</th>
                </tr>
              </thead>
              <tbody>
                {VISA_TABLE.map((row, i) => (
                  <tr key={row.visa} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-3.5 font-semibold text-[#0f0c29]">{row.visa}</td>
                    <td className="px-6 py-3.5">
                      {row.required === true
                        ? <span className="inline-flex items-center gap-1 text-green-700 font-semibold">✅ Yes</span>
                        : row.required === false
                        ? <span className="inline-flex items-center gap-1 text-red-500 font-semibold">❌ No</span>
                        : <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">⚠️ Sometimes</span>
                      }
                    </td>
                    <td className="px-6 py-3.5 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CTA inside table section */}
          <div className="border-t border-gray-100 bg-teal-50/50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Need to know your full document list?
            </p>
            <a
              href="/checklist"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600 transition"
            >
              📋 Full Document Checklist →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
