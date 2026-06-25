import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'
import { resolveDocumentGroups } from '@/components/visa/DocumentChecklist'
import { getOfficialPortal } from '@/lib/data/officialPortals'

// ─────────────────────────────────────────────────────────────────────────────
// Print-only checklist. Hidden on screen (`hidden print:block`); when the user
// hits "Download checklist" (window.print), this is the ONLY thing that prints —
// a compact, 1–2 page document checklist with the official source it's based on.
// Designed to read with "Print backgrounds" OFF: borders + dark text, no reliance
// on background fills. The rest of the page is print:hidden (see VisaPageClient).
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

  const groups = resolveDocumentGroups(visaRecord, destinationName)
  const visaType = (visaRecord.visa_type ?? visaRecord.type ?? 'Tourist Visa').toString()
  const portal = getOfficialPortal(destinationName)
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

      {/* Groups */}
      {groups.map((group, gi) => (
        <div key={`${group.tier}-${gi}`} style={{ marginTop: '12px', breakInside: 'avoid' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', color: '#374151', borderBottom: '1px solid #D1D5DB', paddingBottom: '3px', marginBottom: '6px' }}>
            {tierName[group.tier] ?? group.label}
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

      {/* Official source */}
      <div style={{ marginTop: '16px', border: '1px solid #111827', borderRadius: '6px', padding: '9px 11px', breakInside: 'avoid' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '3px' }}>Official source — verify here before you travel</div>
        {portal ? (
          <div>
            <div style={{ fontWeight: 700 }}>{portal.label}</div>
            <div style={{ color: '#1D4ED8', wordBreak: 'break-all' }}>{portal.url}</div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 700 }}>{destinationName} — official government immigration / visa portal</div>
            <div style={{ color: '#1D4ED8' }}>
              https://www.google.com/search?q={encodeURIComponent(`${destinationName} official visa from ${passportName}`)}
            </div>
          </div>
        )}
        <div style={{ marginTop: '5px', color: '#4B5563' }}>
          This checklist is compiled by VisitPlane and cross-checked against official immigration sources. It is a free preparation guide — visa rules change frequently and depend on your exact situation. Always confirm the current requirements, fees and forms at the official source above before booking travel or submitting an application.
        </div>
      </div>
    </div>
  )
}
