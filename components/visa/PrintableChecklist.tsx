import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'
import { resolveDocumentGroups } from '@/components/visa/DocumentChecklist'
import { getOfficialRequirements } from '@/lib/data/officialRequirements'

// ─────────────────────────────────────────────────────────────────────────────
// Print-only checklist. Hidden on screen (`hidden print:block`); when the user
// hits "Download checklist" (window.print), this is the ONLY thing that prints —
// a compact, 1–2 page document checklist with the official source it's based on.
// Uses the curated official requirements when available, else the country-neutral
// baseline (clearly marked as a general guide). Designed to read with "Print
// backgrounds" OFF: borders + dark text. The rest of the page is print:hidden.
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  visaRecord: VisaRecord | null
  passportName: string
  destinationName: string
  passportFlag: string
  destinationFlag: string
}

export default function PrintableChecklist({
  visaRecord,
  passportName,
  destinationName,
  passportFlag,
  destinationFlag,
}: Props) {
  if (!visaRecord) return null

  const official = getOfficialRequirements(passportName, destinationName)
  const groups = official
    ? official.groups
    : resolveDocumentGroups(visaRecord, destinationName)
  const visaType = official?.visaType ?? (visaRecord.visa_type ?? visaRecord.type ?? 'Tourist Visa').toString()
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const tierName: Record<string, string> = {
    mandatory: 'Mandatory — everyone needs',
    conditional: 'Conditional — if it applies to you',
    recommended: 'Recommended — improves your chances',
  }

  return (
    <div id="print-checklist" className="hidden print:block" style={{ color: '#111827', fontSize: '11px', lineHeight: 1.4 }}>
      {/* Masthead */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.3px' }}>
            <span style={{ color: '#0F1419' }}>Visit</span><span style={{ color: '#16A34A' }}>Plane</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>Visa Document Checklist</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#6B7280' }}>
          <div>Generated {today}</div>
          <div>visitplane.com</div>
        </div>
      </div>

      {/* Route + visa type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '10px 0 4px', fontSize: '14px', fontWeight: 700 }}>
        <span>{passportFlag} {passportName}</span>
        <span style={{ color: '#9CA3AF' }}>→</span>
        <span>{destinationFlag} {destinationName}</span>
        <span style={{ border: '1px solid #111827', borderRadius: '4px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>{visaType}</span>
      </div>

      {/* Process note (curated) or general-guide note (fallback) */}
      {official?.processNote ? (
        <div style={{ fontSize: '10.5px', color: '#374151', margin: '4px 0 2px' }}>{official.processNote}</div>
      ) : !official ? (
        <div style={{ fontSize: '10.5px', color: '#92400E', margin: '4px 0 2px' }}>
          General preparation guide — the exact required documents depend on your visa type and consulate. Confirm the complete, current list with the destination&rsquo;s official immigration authority before you apply.
        </div>
      ) : null}

      {/* Groups */}
      {groups.map((group, gi) => (
        <div key={`${group.tier}-${gi}`} style={{ marginTop: '12px', breakInside: 'avoid' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#374151', borderBottom: '1px solid #D1D5DB', paddingBottom: '3px', marginBottom: '6px' }}>
            {official ? group.label : (tierName[group.tier] ?? group.label)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '18px', rowGap: '6px' }}>
            {group.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '7px', breakInside: 'avoid' }}>
                <span style={{ flexShrink: 0, width: '11px', height: '11px', border: '1.5px solid #111827', borderRadius: '2px', marginTop: '1px' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  {item.description && <div style={{ color: '#4B5563' }}>{item.description}</div>}
                  {item.conditional && <div style={{ color: '#B45309', fontStyle: 'italic' }}>↳ {item.conditional}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div style={{ marginTop: '16px', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '9px 11px', breakInside: 'avoid', color: '#4B5563' }}>
        This checklist is a free preparation guide compiled by VisitPlane. Visa rules change frequently and depend on your exact situation — always confirm the current requirements, fees and forms with the destination&rsquo;s official immigration authority before booking travel or submitting an application.
      </div>
    </div>
  )
}
