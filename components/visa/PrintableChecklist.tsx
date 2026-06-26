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

// Split a process note into individual sentences (bullet points), without
// breaking on abbreviations like "U.S." (period after an uppercase letter).
function toPoints(text: string): string[] {
  return text
    .split(/(?<=[a-z0-9)’”"])\.\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
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

      {/* Process note (curated) or general-guide note (fallback) — as points */}
      {official?.processNote ? (
        <ul style={{ margin: '6px 0 2px', paddingLeft: '15px', fontSize: '10.5px', color: '#374151', listStyleType: 'disc' }}>
          {toPoints(official.processNote).map((p, i) => (
            <li key={i} style={{ marginBottom: '2px' }}>{p}</li>
          ))}
        </ul>
      ) : !official ? (
        <ul style={{ margin: '6px 0 2px', paddingLeft: '15px', fontSize: '10.5px', color: '#92400E', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '2px' }}>General preparation guide — the exact required documents depend on your visa type and the consulate handling your nationality.</li>
          <li>Confirm the complete, current list with the destination&rsquo;s official immigration authority before you apply.</li>
        </ul>
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

      {/* Disclaimer — single line */}
      <div style={{ marginTop: '12px', paddingTop: '6px', borderTop: '1px solid #D1D5DB', fontSize: '9px', color: '#6B7280', breakInside: 'avoid' }}>
        Free preparation guide by VisitPlane — visa rules change; always confirm current requirements with the destination&rsquo;s official immigration authority before applying.
      </div>
    </div>
  )
}
